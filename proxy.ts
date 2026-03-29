import { NextResponse } from "next/server";
import {
  AUTH0_CONNECTION_COOKIE_PREFIX,
  AUTH0_LEGACY_SESSION_COOKIE_NAME,
  AUTH0_SESSION_COOKIE_NAME,
  AUTH0_TRANSACTION_COOKIE_PREFIX,
  assertAuth0Config,
  auth0,
  isRecoverableAuth0SessionError,
} from "@/lib/auth0";

// In Auth0 v4, the proxy handles all auth routes automatically via auth0.middleware()
// The auth routes are at /auth/login, /auth/callback, /auth/logout (not /api/auth/)

const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/connections",
  "/history",
  "/settings",
  "/api/",
];

function getCookieNames(request: Request) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return [];
  }

  return cookieHeader
    .split(";")
    .map((entry) => entry.trim().split("=", 1)[0]?.trim())
    .filter((name): name is string => Boolean(name));
}

function getInvalidSessionRedirectTarget(pathname: string) {
  const isProtectedPath = PROTECTED_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedPath) {
    return "/auth/login";
  }

  return "/";
}

function clearInvalidAuthCookies(response: NextResponse, request: Request) {
  const cookieNames = new Set(getCookieNames(request));

  cookieNames.add(AUTH0_SESSION_COOKIE_NAME);
  cookieNames.add(AUTH0_LEGACY_SESSION_COOKIE_NAME);

  for (const cookieName of cookieNames) {
    if (
      cookieName === AUTH0_SESSION_COOKIE_NAME ||
      cookieName === AUTH0_LEGACY_SESSION_COOKIE_NAME ||
      cookieName.startsWith(AUTH0_TRANSACTION_COOKIE_PREFIX) ||
      cookieName.startsWith(AUTH0_CONNECTION_COOKIE_PREFIX)
    ) {
      response.cookies.set(cookieName, "", {
        expires: new Date(0),
        path: "/",
      });
    }
  }
}

export async function proxy(request: Request) {
  assertAuth0Config();

  try {
    return await auth0.middleware(request);
  } catch (error) {
    if (!isRecoverableAuth0SessionError(error)) {
      throw error;
    }

    const url = new URL(request.url);
    const redirectUrl = new URL(
      getInvalidSessionRedirectTarget(url.pathname),
      request.url
    );
    const response = NextResponse.redirect(redirectUrl);

    clearInvalidAuthCookies(response, request);

    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
