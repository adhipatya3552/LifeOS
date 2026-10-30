import { createOpenAI } from "@ai-sdk/openai";
import {
  APICallError,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { cookies } from "next/headers";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import {
  createLifeOsToolSet,
  getToolService,
  isWriteTool,
  runLifeOsTool,
  summarizeToolAction,
} from "@/lib/agent-tools";
import { getServiceAccessToken } from "@/lib/auth0-ai";
import { auth0 } from "@/lib/auth0";
import {
  getMissingServiceMessage,
  normalizeServiceConnections,
} from "@/lib/google-service-flow";
import {
  getConnectedServiceIds,
  getGoogleServiceConfig,
  getServiceConnectionMap,
} from "@/lib/google-service-registry";
import { mutateConvex, queryConvex } from "@/lib/convex-server";

export const maxDuration = 60;

const CONVERSATION_COOKIE = "lifeos_conversation_id";
const DEFAULT_MAX_OUTPUT_TOKENS = 2048;
const MAX_OUTPUT_TOKEN_CAP = 8192;

function getAIModel() {
  // LOCAL MOCK MODE: clearly labelled, dev-only, never a real model call.
  if (process.env.LIFEOS_MOCK_AI === "1") {
    return null as unknown as ReturnType<ReturnType<typeof createOpenAI>["chat"]>;
  }

  // Prefer Nebius Token Factory (NVIDIA Nemotron) when configured.
  if (process.env.NEBIUS_API_KEY) {
    const nebius = createOpenAI({
      apiKey: process.env.NEBIUS_API_KEY,
      baseURL: "https://api.tokenfactory.nebius.com/v1/",
    });
    // Exact model ID from Nebius Token Factory catalogue.
    return nebius.chat(
      process.env.NEBIUS_MODEL || "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B"
    );
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "No AI provider configured. Set NEBIUS_API_KEY (preferred) or OPENROUTER_API_KEY, or LIFEOS_MOCK_AI=1 for local mock mode."
    );
  }

  const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  // Use .chat() to force the Chat Completions API (/v1/chat/completions).
  // The default openrouter(model) uses the Responses API (/v1/responses) which
  // silently drops maxOutputTokens (shows as `undefined` in the request body),
  // causing the server to request the model's full 65 K context window and
  // exceed OpenRouter free-tier credit limits with a 402 error.
  return openrouter.chat(process.env.AI_MODEL || "openai/gpt-4.1-mini");
}

function getMaxOutputTokens() {
  const rawValue = process.env.AI_MAX_OUTPUT_TOKENS;

  if (!rawValue) {
    return DEFAULT_MAX_OUTPUT_TOKENS;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_MAX_OUTPUT_TOKENS;
  }

  return Math.min(parsedValue, MAX_OUTPUT_TOKEN_CAP);
}

function getStreamingErrorMessage(error: unknown) {
  if (APICallError.isInstance(error) && error.statusCode === 402) {
    return "LifeOS could not reach the AI model because the current OpenRouter credit or token budget is too low for this request. Please try again in a moment, reconnect if needed, or top up OpenRouter credits if the issue keeps happening.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "LifeOS hit an unexpected error while generating a reply.";
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

function getConversationTitle(messages: UIMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const text = firstUserMessage ? getMessageText(firstUserMessage) : "";
  return text ? text.slice(0, 80) : "LifeOS Conversation";
}

const SYSTEM_PROMPT = `You are LifeOS, a powerful AI personal life manager. You help users manage Gmail, Google Calendar, and Google Drive through natural conversation.

You have access to these tools:
- Gmail: summarize_inbox, search_emails, draft_reply, send_email
- Calendar: get_schedule, create_event, reschedule_event, find_free_slot
- Drive: list_recent_docs, summarize_doc, create_doc

Guidelines:
1. Be proactive and suggest a sensible next step after each answer.
2. For sensitive write actions, explain what will happen before you ask the tool to act.
3. If a specific service is not connected, say so clearly and direct the user to /connections.
4. Prefer concise, structured summaries over long prose when reading tool results.
5. Today's date/time is ${new Date().toLocaleString("en-IN", {
   timeZone: "Asia/Kolkata",
 })}.`;

export async function POST(request: Request) {
  const session = await auth0.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    messages,
  }: {
    messages: UIMessage[];
    // Client may still send requireApproval for backward compatibility;
    // server settings are authoritative.
    requireApproval?: boolean;
  } = await request.json();

  // LOCAL MOCK MODE (dev only): clearly labelled, never a real model call.
  if (process.env.LIFEOS_MOCK_AI === "1") {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const text = lastUser ? getMessageText(lastUser) : "";
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const id = crypto.randomUUID();
        writer.write({ type: "text-start", id });
        const reply =
          "[MOCK MODE — not a real Nebius/NVIDIA call] LifeOS mock reply to: " +
          (text || "(empty)") +
          ". Configure NEBIUS_API_KEY to enable real Nebius Token Factory inference.";
        for (const chunk of reply.match(/.{1,40}/g) || [reply]) {
          writer.write({ type: "text-delta", id, delta: chunk });
        }
        writer.write({ type: "text-end", id });
      },
    });
    return createUIMessageStreamResponse({ stream });
  }

  const userId = await mutateConvex(api.users.upsertUser, {
    auth0Id: session.user.sub,
    email: session.user.email ?? "",
    name: session.user.name ?? session.user.email ?? "LifeOS User",
    picture: session.user.picture,
  });

  const settings = userId
    ? await queryConvex(api.userSettings.getSettings, { userId })
    : null;

  const requireApprovalAll = settings?.requireApprovalAll ?? false;
  const autoApproveLowRisk = settings?.autoApproveLowRisk ?? true;
  const stepUpAuth = settings?.stepUpAuth ?? true;
  const auditLogEnabled = settings?.auditLog ?? true;

  const serviceConnections = normalizeServiceConnections(
    userId
      ? (await queryConvex(api.serviceConnections.listByUserId, {
          userId,
        })) || []
      : []
  );
  const connectedServices = getConnectedServiceIds(serviceConnections);
  const serviceConnectionMap = getServiceConnectionMap(serviceConnections);

  const cookieStore = await cookies();
  let conversationId =
    cookieStore.get(CONVERSATION_COOKIE)?.value as Id<"conversations"> | undefined;

  if (!conversationId && userId) {
    const createdConversationId = await mutateConvex(
      api.conversations.createConversation,
      {
        userId,
        title: getConversationTitle(messages),
      }
    );

    if (createdConversationId) {
      conversationId = createdConversationId as Id<"conversations">;
      cookieStore.set(CONVERSATION_COOKIE, conversationId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }
  }

  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  if (conversationId && latestUserMessage) {
    const latestUserText = getMessageText(latestUserMessage);

    if (latestUserText) {
      await mutateConvex(api.messages.addMessage, {
        conversationId,
        messageKey: latestUserMessage.id,
        role: "user",
        content: latestUserText,
      });
    }

    await mutateConvex(api.conversations.touchConversation, { conversationId });
  }

  const tools = createLifeOsToolSet(async (toolName, input) => {
    const service = getToolService(toolName);
    const description = summarizeToolAction(toolName, input);
    const serviceConfig = getGoogleServiceConfig(service);
    const connection = serviceConnectionMap[service];
    const writeTool = isWriteTool(toolName);
    const sensitiveTool = toolName === "send_email";

    // Approval rules (server-side settings are source of truth):
    // - requireApprovalAll → all write tools
    // - !autoApproveLowRisk → all tools (including reads)
    // - stepUpAuth → send_email always needs explicit approval
    const needsApproval =
      (!autoApproveLowRisk) ||
      (writeTool && requireApprovalAll) ||
      (sensitiveTool && stepUpAuth);

    if (connection?.status !== "connected") {
      return {
        success: false,
        service,
        requiresConnection: true,
        error: getMissingServiceMessage(service),
      };
    }

    if (needsApproval) {
      if (!userId) {
        return {
          success: false,
          error:
            "Approval requires a configured Convex backend so the pending action can be stored.",
        };
      }

      const actionId = await mutateConvex(api.agentActions.logAction, {
        userId,
        conversationId,
        service,
        toolName,
        actionType: toolName,
        description,
        status: "pending_approval",
        input,
        metadata: {
          connectedServices,
          accountEmail: connection.accountEmail,
          reason: sensitiveTool && stepUpAuth
            ? "step_up_sensitive"
            : writeTool
              ? "require_approval_write"
              : "require_approval_all_tools",
        },
      });

      if (!actionId) {
        return {
          success: false,
          error:
            "Could not store a pending approval action. Check that Convex is configured, then try again.",
        };
      }

      return {
        success: true,
        status: "pending_approval",
        actionId,
        message:
          sensitiveTool && stepUpAuth
            ? `${description} needs your explicit approval before sending.`
            : `${description} is awaiting approval.`,
      };
    }

    const accessToken = await getServiceAccessToken(service);

    if (!accessToken) {
      if (userId && serviceConfig) {
        await mutateConvex(api.serviceConnections.upsertServiceConnection, {
          userId,
          service,
          provider: "google",
          auth0Connection: serviceConfig.auth0Connection,
          status: "error",
          accountEmail: connection.accountEmail,
          accountName: connection.accountName,
          accountPicture: connection.accountPicture,
          scopes: serviceConfig.scopes,
        });
      }

      return {
        success: false,
        service,
        requiresReconnect: true,
        error: `${serviceConfig?.name || service} is connected in LifeOS, but its Google token is unavailable right now. Please reconnect it from /connections.`,
      };
    }

    const result = await runLifeOsTool(toolName, input, {
      accessToken,
    });

    if (userId && auditLogEnabled) {
      await mutateConvex(api.agentActions.logAction, {
        userId,
        conversationId,
        service,
        toolName,
        actionType: toolName,
        description,
        status: result.success === false ? "failed" : "success",
        input,
        result,
        metadata: {
          connectedServices,
          accountEmail: connection.accountEmail,
        },
      });
    }

    return result;
  });

  const result = streamText({
    model: getAIModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools,
    maxOutputTokens: getMaxOutputTokens(),
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      console.error("Chat streaming failed", error);
    },
    onFinish: async (event) => {
      if (!conversationId || !event.text.trim()) {
        return;
      }

      const responseId =
        typeof event.response === "object" &&
        event.response &&
        "id" in event.response &&
        typeof (event.response as { id?: unknown }).id === "string"
          ? (event.response as { id: string }).id
          : null;

      await mutateConvex(api.messages.addMessage, {
        conversationId,
        messageKey: responseId || `assistant-${crypto.randomUUID()}`,
        role: "assistant",
        content: event.text.trim(),
      });

      await mutateConvex(api.conversations.touchConversation, { conversationId });
    },
  });

  return result.toUIMessageStreamResponse({
    onError: getStreamingErrorMessage,
  });
}

