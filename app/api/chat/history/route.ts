import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { UIMessage } from "ai";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { auth0 } from "@/lib/auth0";
import { queryConvex } from "@/lib/convex-server";

const CONVERSATION_COOKIE = "lifeos_conversation_id";

/**
 * GET /api/chat/history
 * Returns prior messages for the current conversation cookie (if owned by the user).
 */
export async function GET() {
  const session = await auth0.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cookieStore = await cookies();
  const conversationId = cookieStore.get(CONVERSATION_COOKIE)?.value as
    | Id<"conversations">
    | undefined;

  if (!conversationId) {
    return NextResponse.json({ messages: [] as UIMessage[] });
  }

  const currentUser = await queryConvex(api.users.getUser, {
    auth0Id: session.user.sub,
  });

  if (!currentUser) {
    return NextResponse.json({ messages: [] as UIMessage[] });
  }

  const conversation = await queryConvex(api.conversations.getConversation, {
    conversationId,
  });

  if (!conversation || conversation.userId !== currentUser._id) {
    // Stale or foreign cookie — clear it client-side by omitting messages
    return NextResponse.json({
      messages: [] as UIMessage[],
      conversationId: null,
      stale: true,
    });
  }

  const stored =
    (await queryConvex(api.messages.listMessages, { conversationId })) || [];

  const messages: UIMessage[] = stored.map((message) => ({
    id: message.messageKey,
    role: message.role,
    parts: [{ type: "text" as const, text: message.content }],
  }));

  return NextResponse.json({
    messages,
    conversationId,
  });
}
