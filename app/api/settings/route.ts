import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { auth0 } from "@/lib/auth0";
import { mutateConvex, queryConvex } from "@/lib/convex-server";

const SETTING_KEYS = [
  "autoApproveLowRisk",
  "requireApprovalAll",
  "stepUpAuth",
  "auditLog",
  "actionNotifications",
] as const;

type SettingKey = (typeof SETTING_KEYS)[number];

/**
 * Authenticated settings API — never trust a raw userId from the browser.
 * Identity comes from the Auth0 session only.
 */
export async function GET() {
  const session = await auth0.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await queryConvex(api.users.getUser, {
    auth0Id: session.user.sub,
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const settings = await queryConvex(api.userSettings.getSettings, {
    userId: user._id,
  });

  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const session = await auth0.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await queryConvex(api.users.getUser, {
    auth0Id: session.user.sub,
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Partial<Record<SettingKey, boolean>> = {};

  for (const key of SETTING_KEYS) {
    if (key in body) {
      if (typeof body[key] !== "boolean") {
        return NextResponse.json(
          { error: `Field "${key}" must be a boolean` },
          { status: 400 }
        );
      }
      patch[key] = body[key] as boolean;
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No valid settings fields provided" },
      { status: 400 }
    );
  }

  await mutateConvex(api.userSettings.upsertSettings, {
    userId: user._id,
    ...patch,
  });

  const settings = await queryConvex(api.userSettings.getSettings, {
    userId: user._id,
  });

  return NextResponse.json({ settings });
}
