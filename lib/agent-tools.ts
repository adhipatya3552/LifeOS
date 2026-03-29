import { tool } from "ai";
import type { ZodTypeAny } from "zod";
import {
  createEventInputSchema,
  executeCreateEvent,
  executeFindFreeSlot,
  executeGetSchedule,
  executeRescheduleEvent,
  findFreeSlotInputSchema,
  getScheduleInputSchema,
  rescheduleEventInputSchema,
} from "@/lib/tools/calendar";
import {
  createDocInputSchema,
  executeCreateDoc,
  executeListRecentDocs,
  executeSummarizeDoc,
  listRecentDocsInputSchema,
  summarizeDocInputSchema,
} from "@/lib/tools/drive";
import {
  draftReplyInputSchema,
  executeDraftReply,
  executeSearchEmails,
  executeSendEmail,
  executeSummarizeInbox,
  searchEmailsInputSchema,
  sendEmailInputSchema,
  summarizeInboxInputSchema,
  type GoogleToolContext,
} from "@/lib/tools/gmail";

type ToolService = "gmail" | "calendar" | "drive";

type ToolConfig = {
  description: string;
  inputSchema: ZodTypeAny;
  service: ToolService;
  writeAction: boolean;
  summarize: (input: Record<string, unknown>) => string;
  execute: (input: any, context: GoogleToolContext) => Promise<any>;
};

export const LIFE_OS_TOOL_CONFIG = {
  summarize_inbox: {
    description:
      "Summarize the user's unread Gmail inbox and return the most important messages.",
    inputSchema: summarizeInboxInputSchema,
    service: "gmail",
    writeAction: false,
    summarize: () => "Summarize inbox",
    execute: executeSummarizeInbox,
  },
  search_emails: {
    description: "Search Gmail by keyword, sender, or subject.",
    inputSchema: searchEmailsInputSchema,
    service: "gmail",
    writeAction: false,
    summarize: (input) => `Search emails for "${input.query || ""}"`,
    execute: executeSearchEmails,
  },
  draft_reply: {
    description: "Create an email draft without sending it.",
    inputSchema: draftReplyInputSchema,
    service: "gmail",
    writeAction: true,
    summarize: (input) => `Draft reply to ${input.to || "recipient"}`,
    execute: executeDraftReply,
  },
  send_email: {
    description:
      "Send an email on behalf of the user. This is a sensitive write action.",
    inputSchema: sendEmailInputSchema,
    service: "gmail",
    writeAction: true,
    summarize: (input) => `Send email to ${input.to || "recipient"}`,
    execute: executeSendEmail,
  },
  get_schedule: {
    description: "Read the user's Google Calendar schedule for today or this week.",
    inputSchema: getScheduleInputSchema,
    service: "calendar",
    writeAction: false,
    summarize: (input) => `Get calendar schedule for ${input.range || "today"}`,
    execute: executeGetSchedule,
  },
  create_event: {
    description: "Create a new Google Calendar event.",
    inputSchema: createEventInputSchema,
    service: "calendar",
    writeAction: true,
    summarize: (input) => `Create event "${input.title || "Untitled"}"`,
    execute: executeCreateEvent,
  },
  reschedule_event: {
    description: "Move an existing Google Calendar event to a new time.",
    inputSchema: rescheduleEventInputSchema,
    service: "calendar",
    writeAction: true,
    summarize: (input) => `Reschedule event ${input.eventId || ""}`,
    execute: executeRescheduleEvent,
  },
  find_free_slot: {
    description: "Find a free time slot in the user's calendar.",
    inputSchema: findFreeSlotInputSchema,
    service: "calendar",
    writeAction: false,
    summarize: (input) => `Find a ${input.duration || ""}-minute free slot`,
    execute: executeFindFreeSlot,
  },
  list_recent_docs: {
    description: "List recently modified Google Docs in Drive.",
    inputSchema: listRecentDocsInputSchema,
    service: "drive",
    writeAction: false,
    summarize: () => "List recent Drive documents",
    execute: executeListRecentDocs,
  },
  summarize_doc: {
    description: "Read and summarize a Google Doc.",
    inputSchema: summarizeDocInputSchema,
    service: "drive",
    writeAction: false,
    summarize: (input) => `Summarize document ${input.docName || input.docId || ""}`,
    execute: executeSummarizeDoc,
  },
  create_doc: {
    description: "Create a new Google Doc with the provided content.",
    inputSchema: createDocInputSchema,
    service: "drive",
    writeAction: true,
    summarize: (input) => `Create document "${input.title || "Untitled"}"`,
    execute: executeCreateDoc,
  },
} satisfies Record<string, ToolConfig>;

export type LifeOsToolName = keyof typeof LIFE_OS_TOOL_CONFIG;

export function isWriteTool(toolName: LifeOsToolName) {
  return LIFE_OS_TOOL_CONFIG[toolName].writeAction;
}

export function getToolService(toolName: LifeOsToolName) {
  return LIFE_OS_TOOL_CONFIG[toolName].service;
}

export function summarizeToolAction(
  toolName: LifeOsToolName,
  input: Record<string, unknown>
) {
  return LIFE_OS_TOOL_CONFIG[toolName].summarize(input);
}

export async function runLifeOsTool(
  toolName: LifeOsToolName,
  input: Record<string, unknown>,
  context: GoogleToolContext
) {
  return await (LIFE_OS_TOOL_CONFIG[toolName] as ToolConfig).execute(input, context);
}

export function createLifeOsToolSet(
  executeTool: (
    toolName: LifeOsToolName,
    input: Record<string, unknown>
  ) => Promise<Record<string, unknown>>
) {
  return Object.fromEntries(
    Object.entries(LIFE_OS_TOOL_CONFIG).map(([toolName, config]) => [
      toolName,
      tool({
        description: config.description,
        inputSchema: config.inputSchema as any,
        execute: async (input: any) =>
          await executeTool(toolName as LifeOsToolName, input as Record<string, unknown>),
      }),
    ])
  );
}
