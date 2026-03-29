import { api } from "@/convex/_generated/api";
import type { AppSessionData } from "@/components/providers/AppSessionProvider";
import { getConnectedServiceIds } from "@/lib/google-service-registry";
import { normalizeServiceConnections } from "@/lib/google-service-flow";
import { isConfiguredConvexUrl } from "@/lib/convex-env";
import { mutateConvex, queryConvex } from "@/lib/convex-server";

interface SessionUserLike {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function ensureCurrentUserProfile(
  user: SessionUserLike
): Promise<AppSessionData> {
  const profile: AppSessionData = {
    auth0Id: user.sub,
    email: user.email ?? "",
    name: user.name ?? user.email ?? "LifeOS User",
    picture: user.picture,
    connectedServices: [],
    serviceConnections: normalizeServiceConnections([]),
  };

  if (!isConfiguredConvexUrl(process.env.NEXT_PUBLIC_CONVEX_URL)) {
    return profile;
  }

  await mutateConvex(api.users.upsertUser, {
    auth0Id: profile.auth0Id,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
  });

  const storedConnections =
    (await queryConvex(api.serviceConnections.listByAuth0Id, {
      auth0Id: profile.auth0Id,
    })) || [];
  const serviceConnections = normalizeServiceConnections(storedConnections);

  return {
    ...profile,
    serviceConnections,
    connectedServices: getConnectedServiceIds(serviceConnections),
  };
}
