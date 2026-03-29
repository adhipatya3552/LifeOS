import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { auth0 } from "@/lib/auth0";
import { fetchGoogleProfile, getServiceAccessToken } from "@/lib/auth0-ai";
import { getConnectionsRedirectUrl } from "@/lib/google-service-flow";
import { getGoogleServiceConfig } from "@/lib/google-service-registry";
import { isConfiguredConvexUrl } from "@/lib/convex-env";
import { mutateConvex } from "@/lib/convex-server";

export const dynamic = "force-dynamic";

export default async function ServiceCompletePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const config = getGoogleServiceConfig(service);

  if (!config) {
    redirect("/connections?status=error&message=Unknown%20service%20requested.");
  }

  const session = await auth0.getSession();

  if (!session) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(`/connections/${config.id}/complete`)}`);
  }

  if (!isConfiguredConvexUrl(process.env.NEXT_PUBLIC_CONVEX_URL)) {
    redirect(
      getConnectionsRedirectUrl(
        config.id,
        "error",
        "Convex is not configured, so the connection could not be saved."
      )
    );
  }

  const userId = await mutateConvex(api.users.upsertUser, {
    auth0Id: session.user.sub,
    email: session.user.email ?? "",
    name: session.user.name ?? session.user.email ?? "LifeOS User",
    picture: session.user.picture,
  });

  if (!userId) {
    redirect(
      getConnectionsRedirectUrl(
        config.id,
        "error",
        "Unable to load your LifeOS profile. Please try again."
      )
    );
  }

  try {
    const accessToken = await getServiceAccessToken(config.id);

    if (!accessToken) {
      await mutateConvex(api.serviceConnections.upsertServiceConnection, {
        userId,
        service: config.id,
        provider: "google",
        auth0Connection: config.auth0Connection,
        status: "error",
        scopes: config.scopes,
      });

      redirect(
        getConnectionsRedirectUrl(
          config.id,
          "error",
          `LifeOS could not retrieve your ${config.shortName} token. Please reconnect and try again.`
        )
      );
    }

    const profile = await fetchGoogleProfile(accessToken);

    await mutateConvex(api.serviceConnections.upsertServiceConnection, {
      userId,
      service: config.id,
      provider: "google",
      auth0Connection: config.auth0Connection,
      status: "connected",
      accountEmail: profile.email,
      accountName: profile.name,
      accountPicture: profile.picture,
      scopes: config.scopes,
    });

    redirect(
      getConnectionsRedirectUrl(
        config.id,
        "connected",
        `${config.name} is now connected to LifeOS.`
      )
    );
  } catch (error) {
    console.error(`[Connections] Failed to complete ${config.id} connection:`, error);

    await mutateConvex(api.serviceConnections.upsertServiceConnection, {
      userId,
      service: config.id,
      provider: "google",
      auth0Connection: config.auth0Connection,
      status: "error",
      scopes: config.scopes,
    });

    redirect(
      getConnectionsRedirectUrl(
        config.id,
        "error",
        `Unable to finish ${config.shortName} authorization. Please try again.`
      )
    );
  }
}
