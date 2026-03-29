export const GOOGLE_SERVICE_IDS = ["gmail", "calendar", "drive"] as const;

export type GoogleServiceId = (typeof GOOGLE_SERVICE_IDS)[number];

export type ServiceConnectionStatus = "connected" | "error" | "revoked";

export type ServiceConnectionSummary = {
  service: GoogleServiceId;
  provider: "google";
  auth0Connection: string;
  status: ServiceConnectionStatus;
  accountEmail?: string;
  accountName?: string;
  accountPicture?: string;
  scopes: string[];
  connectedAt?: number;
  updatedAt: number;
};

type GoogleServiceConfig = {
  id: GoogleServiceId;
  name: string;
  shortName: string;
  auth0Connection: string;
  scopes: string[];
  title: string;
  description: string;
  permissionBullets: string[];
  connectButtonLabel: string;
  color: string;
  bg: string;
  border: string;
};

const OPENID_PROFILE_SCOPES = ["openid", "email", "profile"];

export const GOOGLE_SERVICE_REGISTRY: Record<
  GoogleServiceId,
  GoogleServiceConfig
> = {
  gmail: {
    id: "gmail",
    name: "Gmail",
    shortName: "Gmail",
    auth0Connection: "google-oauth2",
    scopes: [
      ...OPENID_PROFILE_SCOPES,
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.send",
    ],
    title: "Connect Gmail to LifeOS",
    description:
      "Authorize LifeOS to read your inbox, draft replies, and send emails from the Gmail account you choose for this service.",
    permissionBullets: [
      "Read your unread emails and search your inbox",
      "Create draft replies on your behalf",
      "Send Gmail messages after you approve or request an action",
    ],
    connectButtonLabel: "Connect Gmail",
    color: "#EA4335",
    bg: "rgba(234,67,53,0.08)",
    border: "rgba(234,67,53,0.22)",
  },
  calendar: {
    id: "calendar",
    name: "Google Calendar",
    shortName: "Calendar",
    auth0Connection: "google-oauth2",
    scopes: [
      ...OPENID_PROFILE_SCOPES,
      "https://www.googleapis.com/auth/calendar.events",
    ],
    title: "Connect Google Calendar to LifeOS",
    description:
      "Authorize LifeOS to check your schedule, create events, and update meetings in the Google Calendar account you choose for this service.",
    permissionBullets: [
      "Read your event schedule and availability",
      "Create calendar events on your behalf",
      "Reschedule or update events when you ask",
    ],
    connectButtonLabel: "Connect Calendar",
    color: "#4285F4",
    bg: "rgba(66,133,244,0.08)",
    border: "rgba(66,133,244,0.22)",
  },
  drive: {
    id: "drive",
    name: "Google Drive",
    shortName: "Drive",
    auth0Connection: "google-oauth2",
    scopes: [
      ...OPENID_PROFILE_SCOPES,
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ],
    title: "Connect Google Drive to LifeOS",
    description:
      "Authorize LifeOS to browse recent Google Docs, read document contents, and create new documents in the Google account you choose for this service.",
    permissionBullets: [
      "View metadata for your recent Google Docs",
      "Read the content of Google Docs you select",
      "Create new Google Docs with generated content",
    ],
    connectButtonLabel: "Connect Drive",
    color: "#34A853",
    bg: "rgba(52,168,83,0.08)",
    border: "rgba(52,168,83,0.22)",
  },
};

export const GOOGLE_SERVICE_LIST = GOOGLE_SERVICE_IDS.map(
  (serviceId) => GOOGLE_SERVICE_REGISTRY[serviceId]
);

export function isGoogleServiceId(value: string): value is GoogleServiceId {
  return GOOGLE_SERVICE_IDS.includes(value as GoogleServiceId);
}

export function getGoogleServiceConfig(service: string) {
  return isGoogleServiceId(service) ? GOOGLE_SERVICE_REGISTRY[service] : null;
}

export function getConnectedServiceIds(
  connections: ServiceConnectionSummary[]
): GoogleServiceId[] {
  return connections
    .filter((connection) => connection.status === "connected")
    .map((connection) => connection.service);
}

export function getServiceConnectionMap(
  connections: ServiceConnectionSummary[]
): Partial<Record<GoogleServiceId, ServiceConnectionSummary>> {
  return connections.reduce<
    Partial<Record<GoogleServiceId, ServiceConnectionSummary>>
  >((accumulator, connection) => {
    accumulator[connection.service] = connection;
    return accumulator;
  }, {});
}
