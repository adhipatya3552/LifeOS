import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const envFilePath = path.join(projectRoot, ".env.local");

function loadEnvFile(filePath) {
  const env = {};

  if (!existsSync(filePath)) {
    return env;
  }

  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [rawKey, ...rawValueParts] = line.split("=");
    const key = rawKey.trim();
    const valueWithComment = rawValueParts.join("=");
    const value = valueWithComment.split("#")[0].trim();

    if (key && value) {
      env[key] = value.replace(/^['"]|['"]$/g, "");
    }
  }

  return env;
}

function getEnv(name, fallbackEnv) {
  return process.env[name] || fallbackEnv[name] || "";
}

function formatMissingVar(name, description) {
  return `- ${name}: ${description}`;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);

  if (response.ok) {
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  let details = "";

  try {
    const body = await response.json();
    details = body.error_description || body.message || body.error || "";
  } catch {
    details = await response.text();
  }

  throw new Error(
    `${options.method || "GET"} ${url} failed with ${response.status}${
      details ? `: ${details}` : ""
    }`
  );
}

async function getManagementToken(domain, clientId, clientSecret) {
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    let details = "";

    try {
      const body = await response.json();
      details = body.error_description || body.error || "";
    } catch {
      details = await response.text();
    }

    throw new Error(
      `Unable to create an Auth0 Management API token. ${details} Create a Machine to Machine application, authorize it for the Auth0 Management API, and grant: update:prompts, read:connections, update:connections.`
    );
  }

  const body = await response.json();
  return body.access_token;
}

async function updatePromptText({
  domain,
  token,
  prompt,
  description,
}) {
  const screenKeys = [prompt, prompt.split("-")[0]];
  let lastError;

  for (const screenKey of screenKeys) {
    try {
      await requestJson(
        `https://${domain}/api/v2/prompts/${prompt}/custom-text/en`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            [screenKey]: {
              description,
            },
          }),
        }
      );

      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function disableConnectionForApp({
  domain,
  token,
  strategy,
  appClientId,
}) {
  const connections = await requestJson(
    `https://${domain}/api/v2/connections?strategy=${encodeURIComponent(
      strategy
    )}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  const targetConnection = connections.find((connection) =>
    Array.isArray(connection.enabled_clients)
      ? connection.enabled_clients.includes(appClientId)
      : false
  );

  if (!targetConnection) {
    return {
      changed: false,
      message: `No enabled ${strategy} connection was attached to this application.`,
    };
  }

  const nextEnabledClients = targetConnection.enabled_clients.filter(
    (clientId) => clientId !== appClientId
  );

  if (nextEnabledClients.length === targetConnection.enabled_clients.length) {
    return {
      changed: false,
      message: `${strategy} was already disabled for this application.`,
    };
  }

  await requestJson(`https://${domain}/api/v2/connections/${targetConnection.id}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      enabled_clients: nextEnabledClients,
    }),
  });

  return {
    changed: true,
    message: `Disabled ${strategy} for this application to remove the Auth0 developer-keys alert.`,
  };
}

async function main() {
  const envFromFile = loadEnvFile(envFilePath);
  const auth0Domain = getEnv("AUTH0_DOMAIN", envFromFile);
  const appClientId = getEnv("AUTH0_CLIENT_ID", envFromFile);
  const managementClientId = getEnv("AUTH0_MANAGEMENT_CLIENT_ID", envFromFile);
  const managementClientSecret = getEnv(
    "AUTH0_MANAGEMENT_CLIENT_SECRET",
    envFromFile
  );
  const loginText =
    getEnv("AUTH0_HOSTED_LOGIN_TEXT", envFromFile) ||
    "Log in to LifeOS to continue.";
  const signupText =
    getEnv("AUTH0_HOSTED_SIGNUP_TEXT", envFromFile) || loginText;
  const socialConnectionStrategy =
    getEnv("AUTH0_SOCIAL_CONNECTION_TO_DISABLE", envFromFile) ||
    "google-oauth2";

  const missing = [];

  if (!auth0Domain) {
    missing.push(
      formatMissingVar(
        "AUTH0_DOMAIN",
        "your Auth0 tenant domain, for example dev-example.us.auth0.com"
      )
    );
  }

  if (!appClientId) {
    missing.push(
      formatMissingVar(
        "AUTH0_CLIENT_ID",
        "the Auth0 application client ID used by LifeOS"
      )
    );
  }

  if (!managementClientId) {
    missing.push(
      formatMissingVar(
        "AUTH0_MANAGEMENT_CLIENT_ID",
        "a Machine to Machine application's client ID with Auth0 Management API access"
      )
    );
  }

  if (!managementClientSecret) {
    missing.push(
      formatMissingVar(
        "AUTH0_MANAGEMENT_CLIENT_SECRET",
        "the Machine to Machine application's client secret"
      )
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Auth0 management configuration.\n${missing.join(
        "\n"
      )}\n\nCreate or use a Machine to Machine application, authorize it for the Auth0 Management API, then grant: update:prompts, read:connections, update:connections.`
    );
  }

  const token = await getManagementToken(
    auth0Domain,
    managementClientId,
    managementClientSecret
  );

  await updatePromptText({
    domain: auth0Domain,
    token,
    prompt: "login-id",
    description: loginText,
  });

  await updatePromptText({
    domain: auth0Domain,
    token,
    prompt: "signup-id",
    description: signupText,
  });

  const connectionResult = await disableConnectionForApp({
    domain: auth0Domain,
    token,
    strategy: socialConnectionStrategy,
    appClientId,
  });

  console.log("Updated Auth0 Universal Login text:");
  console.log(`- login-id.description -> ${loginText}`);
  console.log(`- signup-id.description -> ${signupText}`);
  console.log(connectionResult.message);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
