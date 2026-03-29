import { findAuth0ConnectionByName } from "@/lib/auth0-management";
import {
  getGoogleServiceConfig,
  type GoogleServiceId,
} from "@/lib/google-service-registry";

type Auth0ErrorShape = {
  code?: string;
  message?: string;
  cause?: {
    status?: number;
    title?: string;
    detail?: string;
    validationErrors?: Array<{
      detail?: string;
      field?: string;
      pointer?: string;
      source?: string;
    }>;
  };
};

function normalizeText(value: string | undefined | null) {
  return (value || "").trim().toLowerCase();
}

function buildConnectionNameMessage(connectionName: string) {
  return `The Auth0 connection "${connectionName}" was not found. Create it in Auth0 and enable it for this application.`;
}

function buildAppEnablementMessage(connectionName: string) {
  return `The Auth0 connection "${connectionName}" is not enabled for this LifeOS application. Enable it for the current Auth0 app and try again.`;
}

function buildWrongAuth0AppTypeMessage(
  appName: string,
  appType: string,
  clientId: string
) {
  return `AUTH0_CLIENT_ID is currently set to the Auth0 application "${appName}" (${appType}, client ID ${clientId}). LifeOS sign-in and Google Connected Accounts must use your Regular Web Application credentials instead. Update AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET in .env.local to the client ID and client secret from your Regular Web Application, not your Machine-to-Machine Management API app.`;
}

function buildManagementEnvMessage(missing: string[]) {
  return `Auth0 Management API validation is not configured. Add ${missing.join(
    ", "
  )} to .env.local so LifeOS can verify service connections before starting authorization.`;
}

export async function validateGoogleServiceConnection(service: GoogleServiceId) {
  const config = getGoogleServiceConfig(service);

  if (!config) {
    return {
      ok: false as const,
      message: "Unknown Google service requested.",
    };
  }

  if (!config.auth0Connection.trim()) {
    return {
      ok: false as const,
      message: `The ${config.name} Auth0 connection name is missing from the service registry.`,
    };
  }

  const lookup = await findAuth0ConnectionByName(config.auth0Connection);

  if (!lookup.ok) {
    return {
      ok: true as const,
      warning: buildManagementEnvMessage(lookup.missing),
    };
  }

  if (!lookup.connection) {
    return {
      ok: false as const,
      message: buildConnectionNameMessage(config.auth0Connection),
    };
  }

  const appType = normalizeText(lookup.appClient.app_type);

  if (appType && appType !== "regular_web") {
    return {
      ok: false as const,
      message: buildWrongAuth0AppTypeMessage(
        lookup.appClient.name,
        lookup.appClient.app_type || "unknown",
        lookup.appClient.client_id
      ),
    };
  }

  const enabledClients = lookup.connection.enabled_clients || [];

  if (!enabledClients.includes(lookup.appClientId)) {
    return {
      ok: false as const,
      message: buildAppEnablementMessage(config.auth0Connection),
    };
  }

  return {
    ok: true as const,
  };
}

export function getConnectAccountFailureMessage(
  service: GoogleServiceId,
  error: unknown
) {
  const config = getGoogleServiceConfig(service);
  const connectionName = config?.auth0Connection || service;
  const auth0Error = (error || {}) as Auth0ErrorShape;
  const message = normalizeText(auth0Error.message);
  const causeTitle = normalizeText(auth0Error.cause?.title);
  const causeDetail = normalizeText(auth0Error.cause?.detail);
  const validationDetails = (auth0Error.cause?.validationErrors || [])
    .map((item) => normalizeText(item.detail))
    .filter(Boolean)
    .join(" ");
  const haystack = [message, causeTitle, causeDetail, validationDetails]
    .filter(Boolean)
    .join(" ");

  if (haystack.includes("create:me:connected_accounts")) {
    return "The Auth0 My Account API is not activated for this tenant or this app cannot request create:me:connected_accounts yet.";
  }

  if (
    haystack.includes("unknown connection") ||
    haystack.includes("connection was not found") ||
    haystack.includes(`"${connectionName.toLowerCase()}"`) ||
    haystack.includes(connectionName.toLowerCase())
  ) {
    return buildConnectionNameMessage(connectionName);
  }

  if (
    haystack.includes("enabled for this client") ||
    haystack.includes("enabled client") ||
    haystack.includes("application") && haystack.includes("connection")
  ) {
    return buildAppEnablementMessage(connectionName);
  }

  if (haystack.includes("offline access")) {
    return `Offline Access must be enabled on the "${connectionName}" Auth0 connection before ${config?.shortName || service} can be linked.`;
  }

  if (
    haystack.includes("connected account") ||
    haystack.includes("connected accounts") ||
    haystack.includes("token vault")
  ) {
    return `Connected Accounts and Token Vault must be enabled on the "${connectionName}" Auth0 connection before ${config?.shortName || service} can be linked.`;
  }

  if (
    haystack.includes("consent") ||
    haystack.includes("google") ||
    haystack.includes("scope")
  ) {
    return `Auth0 reached the provider setup for ${config?.name || service}, but the Google provider configuration or requested scopes are not accepted yet. Confirm the Google APIs are enabled and the OAuth consent screen includes the required scopes.`;
  }

  return `Unable to start ${config?.shortName || service} authorization because the Auth0 Connected Accounts setup is incomplete. Check that "${connectionName}" exists, is enabled for this app, and has Connected Accounts, Token Vault, and Offline Access enabled.`;
}
