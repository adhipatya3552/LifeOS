import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/convex/_generated/api";
import { auth0 } from "@/lib/auth0";
import { mutateConvex } from "@/lib/convex-server";

const CONVERSATION_COOKIE = "lifeos_conversation_id";

/**
 * POST /api/chat/conversation
 * Creates a new conversation owned by the signed-in user and points the
 * conversation cookie at it. Previous conversations stay untouched.
 */
export async function POST() {
  const session = await auth0.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = await mutateConvex(api.users.upsertUser, {
    auth0Id: session.user.sub,
    email: session.user.email ?? "",
    name: session.user.name ?? session.user.email ?? "LifeOS User",
    picture: session.user.picture,
  });

  if (!userId) {
    return NextResponse.json(
      { error: "Convex is not configured, so a new conversation cannot be saved." },
      { status: 503 }
    );
  }

  const conversationId = await mutateConvex(
    api.conversations.createConversation,
    {
      userId,
      title: "New Conversation",
    }
  );

  if (!conversationId) {
    return NextResponse.json(
      { error: "Could not create a new conversation." },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(CONVERSATION_COOKIE, conversationId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return NextResponse.json({ conversationId });
}
