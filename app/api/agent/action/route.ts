import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { runLifeOsTool, type LifeOsToolName } from "@/lib/agent-tools";
import { getServiceAccessToken } from "@/lib/auth0-ai";
import { auth0 } from "@/lib/auth0";
import { getGoogleServiceConfig } from "@/lib/google-service-registry";
import { mutateConvex, queryConvex } from "@/lib/convex-server";

export async function POST(request: Request) {
  const session = await auth0.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    actionId,
    decision,
  }: {
    actionId?: string;
    decision?: "approve" | "reject";
  } = await request.json();

  if (!actionId || !decision) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const action = await queryConvex(api.agentActions.getAction, {
    actionId: actionId as Id<"agentActions">,
  });

  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  if (action.status !== "pending_approval") {
    return NextResponse.json(
      { error: "Action is no longer pending approval" },
      { status: 409 }
    );
  }

  if (decision === "reject") {
    await mutateConvex(api.agentActions.updateActionStatus, {
      actionId: action._id,
      status: "cancelled",
      metadata: {
        decision,
        decidedBy: session.user.sub,
      },
    });

    return NextResponse.json({
      success: true,
      actionId,
      decision,
      message: "Action cancelled by user.",
    });
  }

  await mutateConvex(api.agentActions.updateActionStatus, {
    actionId: action._id,
    status: "approved",
    metadata: {
      decision,
      decidedBy: session.user.sub,
    },
  });

  const service = action.service as "gmail" | "calendar" | "drive";
  const serviceConfig = getGoogleServiceConfig(service);
  const accessToken = await getServiceAccessToken(service);

  if (!accessToken || !serviceConfig) {
    if (serviceConfig) {
      await mutateConvex(api.serviceConnections.upsertServiceConnection, {
        userId: action.userId,
        service,
        provider: "google",
        auth0Connection: serviceConfig.auth0Connection,
        status: "error",
        scopes: serviceConfig.scopes,
      });
    }

    await mutateConvex(api.agentActions.updateActionStatus, {
      actionId: action._id,
      status: "failed",
      result: {
        success: false,
        error: `${serviceConfig?.name || service} is no longer available. Please reconnect it from /connections and try again.`,
      },
      metadata: {
        decision,
        decidedBy: session.user.sub,
      },
    });

    return NextResponse.json(
      {
        success: false,
        actionId,
        decision,
        error: `${serviceConfig?.name || service} needs to be reconnected from /connections.`,
      },
      { status: 409 }
    );
  }

  const result = await runLifeOsTool(
    action.toolName as LifeOsToolName,
    action.input as Record<string, unknown>,
    {
      accessToken,
    }
  );

  await mutateConvex(api.agentActions.updateActionStatus, {
    actionId: action._id,
    status: result.success === false ? "failed" : "success",
    result,
    metadata: {
      decision,
      decidedBy: session.user.sub,
    },
  });

  return NextResponse.json({
    success: result.success !== false,
    actionId,
    decision,
    result,
    message:
      typeof result.message === "string"
        ? result.message
        : result.success === false
          ? result.error
          : "Action executed.",
  });
}
