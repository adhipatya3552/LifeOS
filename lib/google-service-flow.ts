import {
  getGoogleServiceConfig,
  GOOGLE_SERVICE_LIST,
  type GoogleServiceId,
  type ServiceConnectionSummary,
} from "@/lib/google-service-registry";

export function getConnectionsRedirectUrl(
  service: GoogleServiceId,
  status: "connected" | "error" | "cancelled",
  message?: string
) {
  const params = new URLSearchParams({
    service,
    status,
  });

  if (message) {
    params.set("message", message);
  }

  return `/connections?${params.toString()}`;
}

export function getAllowPagePath(service: GoogleServiceId) {
  return `/connections/${service}/authorize`;
}

export function getCompletePagePath(service: GoogleServiceId) {
  return `/connections/${service}/complete`;
}

export function buildDefaultServiceConnections(): ServiceConnectionSummary[] {
  return GOOGLE_SERVICE_LIST.map((service) => ({
    service: service.id,
    provider: "google",
    auth0Connection: service.auth0Connection,
    status: "revoked",
    scopes: service.scopes,
    updatedAt: 0,
  }));
}

export function normalizeServiceConnections(
  connections: ServiceConnectionSummary[]
): ServiceConnectionSummary[] {
  const connectionMap = new Map(
    connections.map((connection) => [connection.service, connection])
  );

  return GOOGLE_SERVICE_LIST.map((service) => {
    const existing = connectionMap.get(service.id);

    return (
      existing || {
        service: service.id,
        provider: "google",
        auth0Connection: service.auth0Connection,
        status: "revoked",
        scopes: service.scopes,
        updatedAt: 0,
      }
    );
  });
}

export function getMissingServiceMessage(service: GoogleServiceId) {
  const config = getGoogleServiceConfig(service);
  return `Please connect ${config?.name || service} from /connections before using this feature.`;
}
