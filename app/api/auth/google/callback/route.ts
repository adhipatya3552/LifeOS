import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { api } from "@/convex/_generated/api";
import {
  exchangeCodeForTokens,
  getGoogleCallbackUrl,
  getGoogleOAuthCredentials,
} from "@/lib/google-oauth";
import { fetchGoogleProfile } from "@/lib/auth0-ai";
import { getConnectionsRedirectUrl } from "@/lib/google-service-flow";
import {
  getGoogleServiceConfig,
  isGoogleServiceId,
  type GoogleServiceId,
} from "@/lib/google-service-registry";
import { mutateConvex } from "@/lib/convex-server";
import { OAUTH_STATE_COOKIE } from "@/app/api/connections/google/[service]/connect/route";

/**
 * GET /api/auth/google/callback
 *
 * Google redirects the user here after they approve (or deny) the OAuth prompt.
 * This handler:
 *   1. Verifies the CSRF state cookie
 *   2. Exchanges the authorization code for tokens
 *   3. Fetches the user's Google profile
 *   4. Saves the connection + tokens to Convex
 *   5. Redirects to /connections with a success or error banner
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  // ── Helper to build an error redirect with the state cookie cleared ────────
  function errorRedirect(message: string, service?: GoogleServiceId) {
    const target = service
      ? new URL(getConnectionsRedirectUrl(service, "error", message), request.url)
      : new URL(
          `/connections?status=error&message=${encodeURIComponent(message)}`,
          request.url
        );
    const res = NextResponse.redirect(target);
    res.cookies.set(OAUTH_STATE_COOKIE, "", { expires: new Date(0), path: "/" });
    return res;
  }

  // ── Handle user-cancelled / provider error ─────────────────────────────────
  if (oauthError) {
    const msg =
      oauthError === "access_denied"
        ? "You cancelled the Google authorization request."
        : `Google returned an error: ${oauthError}`;
    return errorRedirect(msg);
  }

  if (!code || !state) {
    return errorRedirect("Invalid OAuth callback — missing code or state.");
  }

  // ── Verify CSRF state ──────────────────────────────────────────────────────
  // We read the cookie from the incoming request headers because Next.js route
  // handlers don't yet expose a mutable cookie store in the same way; we only
  // need to *read* it here.
  const cookieHeader = request.headers.get("cookie") ?? "";
  const storedState = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.slice(OAUTH_STATE_COOKIE.length + 1);

  if (!storedState || storedState !== state) {
    return errorRedirect(
      "Security check failed. Please try connecting again — the request may have expired."
    );
  }

  // ── Parse the state to get the service ID ─────────────────────────────────
  let service: string;
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString());
    service = parsed.service as string;
  } catch {
    return errorRedirect("Could not parse OAuth state. Please try again.");
  }

  if (!isGoogleServiceId(service)) {
    return errorRedirect(`Unknown service "${service}" in OAuth state.`);
  }

  const config = getGoogleServiceConfig(service)!;

  // ── Check Auth0 session (user must still be logged in) ────────────────────
  const session = await auth0.getSession();

  if (!session) {
    return errorRedirect(
      "Your session expired during Google authorization. Please sign in again.",
      service
    );
  }

  // ── Get Google OAuth credentials ──────────────────────────────────────────
  const credentials = getGoogleOAuthCredentials();

  if (!credentials) {
    return errorRedirect(
      "Google OAuth credentials are not configured on the server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.",
      service
    );
  }

  const baseUrl =
    process.env.APP_BASE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;

  const redirectUri = getGoogleCallbackUrl(baseUrl);

  try {
    // ── Exchange authorization code for tokens ─────────────────────────────
    const tokens = await exchangeCodeForTokens({
      code,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      redirectUri,
    });

    const tokenExpiresAt = Date.now() + tokens.expires_in * 1000;

    // ── Fetch Google profile ───────────────────────────────────────────────
    const profile = await fetchGoogleProfile(tokens.access_token);

    // ── Upsert user in Convex ──────────────────────────────────────────────
    const userId = await mutateConvex(api.users.upsertUser, {
      auth0Id: session.user.sub,
      email: session.user.email ?? "",
      name: session.user.name ?? session.user.email ?? "LifeOS User",
      picture: session.user.picture,
    });

    if (!userId) {
      return errorRedirect(
        "Unable to load your LifeOS profile. Please try again.",
        service
      );
    }

    // ── Save connection + tokens to Convex ────────────────────────────────
    await mutateConvex(api.serviceConnections.upsertServiceConnection, {
      userId,
      service,
      provider: "google",
      auth0Connection: config.auth0Connection,
      status: "connected",
      accountEmail: profile.email,
      accountName: profile.name,
      accountPicture: profile.picture,
      scopes: config.scopes,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt,
    });

    // ── Success! ──────────────────────────────────────────────────────────
    const successRes = NextResponse.redirect(
      new URL(
        getConnectionsRedirectUrl(
          service,
          "connected",
          `${config.name} is now connected to LifeOS.`
        ),
        request.url
      )
    );
    // Clear the CSRF state cookie
    successRes.cookies.set(OAUTH_STATE_COOKIE, "", {
      expires: new Date(0),
      path: "/",
    });
    return successRes;
  } catch (error) {
    console.error(`[OAuth] Failed to complete ${service} connection:`, error);
    return errorRedirect(
      `Unable to connect ${config.name}. Please try again. (${
        error instanceof Error ? error.message : "Unknown error"
      })`,
      service
    );
  }
}
