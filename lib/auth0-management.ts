type Auth0ManagementEnv = {
  domain: string;
  appClientId: string;
  managementClientId: string;
  managementClientSecret: string;
};

type Auth0ConnectionRecord = {
  id: string;
  name: string;
  strategy?: string;
  enabled_clients?: string[];
  options?: Record<string, unknown>;
};

type Auth0ApplicationRecord = {
  client_id: string;
  name: string;
  app_type?: string;
};

function getEnvValue(name: string) {
  return (process.env[name] || "").trim();
}

export function getAuth0ManagementEnv():
  | { ok: true; value: Auth0ManagementEnv }
  | { ok: false; missing: string[] } {
  const env: Auth0ManagementEnv = {
    domain: getEnvValue("AUTH0_DOMAIN"),
    appClientId: getEnvValue("AUTH0_CLIENT_ID"),
    managementClientId: getEnvValue("AUTH0_MANAGEMENT_CLIENT_ID"),
    managementClientSecret: getEnvValue("AUTH0_MANAGEMENT_CLIENT_SECRET"),
  };

  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return { ok: true, value: env };
}

async function requestJson<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (response.ok) {
    return (await response.json()) as T;
  }

  let details = "";

  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: string;
      error_description?: string;
    };
    details = payload.error_description || payload.message || payload.error || "";
  } catch {
    details = await response.text();
  }

  throw new Error(
    `${options.method || "GET"} ${url} failed with ${response.status}${
      details ? `: ${details}` : ""
    }`
  );
}

async function getManagementToken(env: Auth0ManagementEnv) {
  const payload = await requestJson<{ access_token: string }>(
    `https://${env.domain}/oauth/token`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: env.managementClientId,
        client_secret: env.managementClientSecret,
        audience: `https://${env.domain}/api/v2/`,
        grant_type: "client_credentials",
      }),
    }
  );

  return payload.access_token;
}

export async function findAuth0ConnectionByName(connectionName: string) {
  const env = getAuth0ManagementEnv();

  if (!env.ok) {
    return {
      ok: false as const,
      reason: "missing_management_env" as const,
      missing: env.missing,
    };
  }

  const token = await getManagementToken(env.value);
  const appClient = await requestJson<Auth0ApplicationRecord>(
    `https://${env.value.domain}/api/v2/clients/${encodeURIComponent(
      env.value.appClientId
    )}?fields=name,app_type,client_id&include_fields=true`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  const connections = await requestJson<Auth0ConnectionRecord[]>(
    `https://${env.value.domain}/api/v2/connections?name=${encodeURIComponent(
      connectionName
    )}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  const connection =
    connections.find((candidate) => candidate.name === connectionName) || null;

  return {
    ok: true as const,
    appClientId: env.value.appClientId,
    appClient,
    connection,
  };
}
