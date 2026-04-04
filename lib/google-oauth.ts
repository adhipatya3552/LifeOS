/**
 * lib/google-oauth.ts
 *
 * Direct Google OAuth 2.0 helpers — replaces Auth0 Token Vault.
 *
 * Setup required in Google Cloud Console:
 *   1. Create a project at https://console.cloud.google.com
 *   2. Enable: Gmail API, Google Calendar API, Google Drive API, Google Docs API
 *   3. Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
 *   4. Application type: Web Application
 *   5. Authorized redirect URIs: http://localhost:3000/api/auth/google/callback
 *      (Add your production URL too when deploying)
 *   6. Copy the Client ID and Client Secret to .env.local
 */

const GOOGLE_OAUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export type GoogleRefreshResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

/** Returns Google OAuth credentials from env, or null if not configured. */
export function getGoogleOAuthCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

/** Builds the absolute Google OAuth callback URL from the base URL. */
export function getGoogleCallbackUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/api/auth/google/callback`;
}

/**
 * Builds the Google OAuth authorization URL the user will be redirected to.
 * Uses `access_type=offline` and `prompt=consent` to always get a refresh token.
 */
export function buildGoogleAuthUrl({
  clientId,
  redirectUri,
  scopes,
  state,
}: {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent", // Force consent screen so Google always issues a refresh token
    state,
  });

  return `${GOOGLE_OAUTH_BASE}?${params.toString()}`;
}

/** Exchanges an authorization code for access + refresh tokens. */
export async function exchangeCodeForTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${body}`);
  }

  return (await response.json()) as GoogleTokenResponse;
}

/** Refreshes an expired access token using the stored refresh token. */
export async function refreshGoogleAccessToken({
  refreshToken,
  clientId,
  clientSecret,
}: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<GoogleRefreshResponse> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }).toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google token refresh failed (${response.status}): ${body}`);
  }

  return (await response.json()) as GoogleRefreshResponse;
}
