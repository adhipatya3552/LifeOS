import { Auth0Client } from "@auth0/nextjs-auth0/server";

type Auth0Instance = InstanceType<typeof Auth0Client>;
type GetAccessTokenForConnectionOptions = Parameters<
  Auth0Instance["getAccessTokenForConnection"]
>[0];
type ConnectAccountOptions = Parameters<Auth0Instance["connectAccount"]>[0];
type Auth0ErrorShape = {
  code?: string;
  message?: string;
  cause?: unknown;
};

const REQUIRED_AUTH0_ENV = [
  "AUTH0_DOMAIN",
  "AUTH0_CLIENT_ID",
  "AUTH0_CLIENT_SECRET",
  "AUTH0_SECRET",
  "APP_BASE_URL",
] as const;

const PLACEHOLDER_MARKERS = [
  "your_",
  "your-",
  "yourdomain",
  "replace_with",
  "change_me",
  "example",
  "<",
];
const RECOVERABLE_AUTH0_ERROR_CODES = new Set([
  "ERR_JWE_INVALID",
  "ERR_JWS_INVALID",
]);
const RECOVERABLE_AUTH0_ERROR_MESSAGES = [
  "invalid compact jwe",
  "jwe invalid",
  "failed to decrypt",
];

export const AUTH0_SESSION_COOKIE_NAME = "__session";
export const AUTH0_LEGACY_SESSION_COOKIE_NAME = "appSession";
export const AUTH0_TRANSACTION_COOKIE_PREFIX = "__txn_";
export const AUTH0_CONNECTION_COOKIE_PREFIX = "__FC";

let client: Auth0Instance | undefined;
let validated = false;

function isPlaceholderValue(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    normalized.length === 0 ||
    PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker))
  );
}

function normalizeAuth0Domain(rawValue: string) {
  const trimmed = rawValue.trim();
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  const withoutTrailingSlashes = withoutProtocol.replace(/\/+$/, "");

  if (!withoutTrailingSlashes || withoutTrailingSlashes.includes("/")) {
    throw new Error(
      "AUTH0_DOMAIN must be your Auth0 tenant domain only, for example `your-tenant.us.auth0.com`."
    );
  }

  const parsed = new URL(`https://${withoutTrailingSlashes}`);
  return parsed.hostname;
}

function normalizeAppBaseUrl(rawValue: string) {
  const parsed = new URL(rawValue.trim());

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("APP_BASE_URL must start with http:// or https://.");
  }

  return parsed.origin;
}

function getErrorCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return "";
  }

  return ((error as Auth0ErrorShape).code || "").toUpperCase();
}

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "";
  }

  return ((error as Auth0ErrorShape).message || "").toLowerCase();
}

export function isRecoverableAuth0SessionError(error: unknown): boolean {
  const visited = new Set<unknown>();
  let current: unknown = error;

  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current);

    if (RECOVERABLE_AUTH0_ERROR_CODES.has(getErrorCode(current))) {
      return true;
    }

    const message = getErrorMessage(current);

    if (
      message &&
      RECOVERABLE_AUTH0_ERROR_MESSAGES.some((fragment) =>
        message.includes(fragment)
      )
    ) {
      return true;
    }

    current = (current as Auth0ErrorShape).cause;
  }

  return false;
}

export function assertAuth0Config() {
  if (validated) {
    return;
  }

  const problems: string[] = [];

  for (const envName of REQUIRED_AUTH0_ENV) {
    const rawValue = process.env[envName];

    if (!rawValue || isPlaceholderValue(rawValue)) {
      problems.push(`${envName} is missing or still set to a placeholder value.`);
    }
  }

  if (problems.length === 0) {
    try {
      process.env.AUTH0_DOMAIN = normalizeAuth0Domain(process.env.AUTH0_DOMAIN || "");
    } catch (error) {
      problems.push(
        error instanceof Error ? error.message : "AUTH0_DOMAIN is invalid."
      );
    }

    try {
      process.env.APP_BASE_URL = normalizeAppBaseUrl(process.env.APP_BASE_URL || "");
    } catch (error) {
      problems.push(
        error instanceof Error ? error.message : "APP_BASE_URL is invalid."
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `[Auth0 config] Invalid Auth0 environment configuration. Set your real Auth0 tenant domain and app credentials in .env.local before using /auth/login. ${problems.join(
        " "
      )}`
    );
  }

  validated = true;
}

function getAuth0Client() {
  assertAuth0Config();
  client ??= new Auth0Client({
    signInReturnToPath: "/dashboard",
  });
  return client;
}

export const auth0 = {
  async middleware(request: Request) {
    return await getAuth0Client().middleware(request);
  },

  async getSession() {
    try {
      return await getAuth0Client().getSession();
    } catch (error) {
      if (isRecoverableAuth0SessionError(error)) {
        return null;
      }

      throw error;
    }
  },

  async connectAccount(options: ConnectAccountOptions) {
    return await getAuth0Client().connectAccount(options);
  },

  async getAccessTokenForConnection(
    options: GetAccessTokenForConnectionOptions
  ) {
    return await getAuth0Client().getAccessTokenForConnection(options);
  },
};
