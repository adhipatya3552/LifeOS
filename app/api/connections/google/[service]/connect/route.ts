import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth0 } from "@/lib/auth0";
import { getConnectionsRedirectUrl } from "@/lib/google-service-flow";
import { getGoogleServiceConfig } from "@/lib/google-service-registry";
import {
  buildGoogleAuthUrl,
  getGoogleCallbackUrl,
  getGoogleOAuthCredentials,
} from "@/lib/google-oauth";

/** Cookie name used to carry the CSRF state token through the OAuth round-trip. */
export const OAUTH_STATE_COOKIE = "lifeos_oauth_state";

async function startConnectionFlow(
  request: Request,
  service: string
): Promise<Response> {
  const config = getGoogleServiceConfig(service);

  if (!config) {
    return NextResponse.redirect(
      new URL(
        "/connections?status=error&message=Unknown%20service%20requested.",
        request.url
      )
    );
  }

  const session = await auth0.getSession();

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", `/connections/${config.id}/authorize`);
    return NextResponse.redirect(loginUrl);
  }

  const credentials = getGoogleOAuthCredentials();

  if (!credentials) {
    return NextResponse.redirect(
      new URL(
        getConnectionsRedirectUrl(
          config.id,
          "error",
          "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local and restart the server."
        ),
        request.url
      )
    );
  }

  // Generate a CSRF state token.  It carries the service name so the callback
  // knows which service is being connected without any other state storage.
  const nonce = randomBytes(16).toString("hex");
  const statePayload = JSON.stringify({ service: config.id, nonce });
  const state = Buffer.from(statePayload).toString("base64url");

  const baseUrl =
    process.env.APP_BASE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;

  const redirectUri = getGoogleCallbackUrl(baseUrl);

  const authUrl = buildGoogleAuthUrl({
    clientId: credentials.clientId,
    redirectUri,
    scopes: config.scopes,
    state,
  });

  const response = NextResponse.redirect(authUrl);

  // Store the state in an httpOnly cookie so the callback can verify it
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600, // 10 minutes — plenty of time for the OAuth round-trip
    path: "/",
  });

  return response;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params;
  return await startConnectionFlow(request, service);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params;
  return await startConnectionFlow(request, service);
}
