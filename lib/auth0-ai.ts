import { auth0 } from "@/lib/auth0";
import {
  getGoogleServiceConfig,
  type GoogleServiceId,
} from "@/lib/google-service-registry";

export type GoogleProfile = {
  email?: string;
  name?: string;
  picture?: string;
};

export async function getServiceAccessToken(service: GoogleServiceId) {
  const config = getGoogleServiceConfig(service);

  if (!config) {
    return null;
  }

  try {
    const { token } = await auth0.getAccessTokenForConnection({
      connection: config.auth0Connection,
    });

    return token;
  } catch (error) {
    console.warn(`[Auth0] ${service} connection token unavailable:`, error);
    return null;
  }
}

export async function fetchGoogleProfile(
  accessToken: string
): Promise<GoogleProfile> {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

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
