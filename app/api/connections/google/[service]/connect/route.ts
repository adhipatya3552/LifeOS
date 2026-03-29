import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {
  getCompletePagePath,
  getConnectionsRedirectUrl,
} from "@/lib/google-service-flow";
import {
  getConnectAccountFailureMessage,
  validateGoogleServiceConnection,
} from "@/lib/google-connection-diagnostics";
import { getGoogleServiceConfig } from "@/lib/google-service-registry";

async function startConnectionFlow(
  request: Request,
  service: string
) {
  const config = getGoogleServiceConfig(service);

  if (!config) {
    return NextResponse.redirect(
      new URL(
        "/connections?status=error&message=Unknown%20service%20requested.",
        request.url
      )
    );
  }

  const session = await auth0.getSession();

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", `/connections/${config.id}/authorize`);
    return NextResponse.redirect(loginUrl);
  }

  const validation = await validateGoogleServiceConnection(config.id);

  if (!validation.ok) {
    return NextResponse.redirect(
      new URL(
        getConnectionsRedirectUrl(config.id, "error", validation.message),
        request.url
      )
    );
  }

  if ("warning" in validation && validation.warning) {
    console.warn(
      `[Connections] ${config.id} preflight warning: ${validation.warning}`
    );
  }

  try {
    return await auth0.connectAccount({
      connection: config.auth0Connection,
      scopes: config.scopes,
      returnTo: getCompletePagePath(config.id),
    });
  } catch (error) {
    console.error(`[Connections] Failed to start ${config.id} connect flow:`, error);

    return NextResponse.redirect(
      new URL(
        getConnectionsRedirectUrl(
          config.id,
          "error",
          getConnectAccountFailureMessage(config.id, error)
        ),
        request.url
      )
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params;
  return await startConnectionFlow(request, service);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params;
  return await startConnectionFlow(request, service);
}
