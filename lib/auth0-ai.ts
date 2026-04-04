import { auth0 } from "@/lib/auth0";
import {
  getGoogleServiceConfig,
  type GoogleServiceId,
} from "@/lib/google-service-registry";
import {
  getGoogleOAuthCredentials,
  refreshGoogleAccessToken,
} from "@/lib/google-oauth";
import { api } from "@/convex/_generated/api";
import { mutateConvex, queryConvex } from "@/lib/convex-server";

export type GoogleProfile = {
  email?: string;
  name?: string;
  picture?: string;
};

/**
 * Returns a valid Google access token for the given service.
 *
 * Uses tokens stored in Convex (direct OAuth 2.0 — no Auth0 Token Vault needed).
 * Automatically refreshes expired tokens and saves the new one back to Convex.
 */
export async function getServiceAccessToken(
  service: GoogleServiceId
): Promise<string | null> {
  const config = getGoogleServiceConfig(service);

  if (!config) {
    return null;
  }

  // Need the Auth0 session to identify which user's tokens to fetch
  const session = await auth0.getSession();

  if (!session) {
    return null;
  }

  // Fetch the stored connection (includes OAuth tokens) from Convex
  const connection = await queryConvex(
    api.serviceConnections.getConnectionByAuth0IdAndService,
    { auth0Id: session.user.sub, service }
  );

  if (!connection || connection.status !== "connected") {
    return null;
  }

  if (!connection.accessToken) {
    return null;
  }

  const now = Date.now();
  // Five-minute buffer: refresh before the token is actually expired
  const isExpired =
    connection.tokenExpiresAt != null &&
    connection.tokenExpiresAt - 5 * 60 * 1000 < now;

  if (!isExpired) {
    return connection.accessToken;
  }

  // Token is expired — try to refresh it
  if (!connection.refreshToken) {
    console.warn(`[OAuth] ${service} token expired but no refresh token found.`);
    return null;
  }

  const credentials = getGoogleOAuthCredentials();

  if (!credentials) {
    console.warn(`[OAuth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — cannot refresh ${service} token.`);
    return null;
  }

  try {
    const refreshed = await refreshGoogleAccessToken({
      refreshToken: connection.refreshToken,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
    });

    const newExpiresAt = now + refreshed.expires_in * 1000;

    // Save the new access token to Convex
    await mutateConvex(api.serviceConnections.updateAccessToken, {
      auth0Id: session.user.sub,
      service,
      accessToken: refreshed.access_token,
      tokenExpiresAt: newExpiresAt,
    });

    return refreshed.access_token;
  } catch (error) {
    console.warn(`[OAuth] Failed to refresh ${service} token:`, error);
    return null;
  }
}

/** Fetches the connected Google account's profile using an access token. */
export async function fetchGoogleProfile(
  accessToken: string
): Promise<GoogleProfile> {
  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Google profile (${response.status})`);
  }

  const payload = (await response.json()) as {
    email?: string;
    name?: string;
    picture?: string;
  };

  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}
