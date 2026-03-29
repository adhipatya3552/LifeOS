import { google } from "googleapis";
import { z } from "zod";

export const summarizeInboxInputSchema = z.object({
  maxResults: z
    .number()
    .optional()
    .default(10)
    .describe("Maximum number of emails to fetch"),
});

export const searchEmailsInputSchema = z.object({
  query: z
    .string()
    .describe("Gmail search query, for example 'from:alice subject:report'"),
  maxResults: z.number().optional().default(5),
});

export const draftReplyInputSchema = z.object({
  to: z.string().describe("Recipient email address"),
  subject: z.string().describe("Email subject line"),
  body: z.string().describe("Email body text"),
});

export const sendEmailInputSchema = z.object({
  to: z.string().describe("Recipient email address"),
  subject: z.string().describe("Email subject line"),
  body: z.string().describe("Email body text"),
});

export type GoogleToolContext = {
  accessToken?: string;
};

const MOCK_EMAILS = [
  {
    id: "1",
    from: "Alice Johnson <alice@acme.com>",
    subject: "Q1 Report Ready for Review",
    snippet:
      "Hi, the Q1 report is ready for your review. Please check the attached document.",
    date: "2026-03-20T09:00:00Z",
    unread: true,
  },
  {
    id: "2",
    from: "Bob Smith <bob@vendor.io>",
    subject: "Invoice #2024-031",
    snippet: "Please find attached the invoice for services rendered in March.",
    date: "2026-03-19T14:30:00Z",
    unread: true,
  },
  {
    id: "3",
    from: "GitHub <noreply@github.com>",
    subject: "[lifeos] PR #42: Add calendar sync feature",
    snippet: "PR #42 has been opened by dev-team. Review requested.",
    date: "2026-03-19T11:15:00Z",
    unread: false,
  },
];

function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

export async function executeSummarizeInbox(
  { maxResults = 10 }: z.infer<typeof summarizeInboxInputSchema>,
  { accessToken }: GoogleToolContext
) {
  if (!accessToken) {
    const unread = MOCK_EMAILS.filter((email) => email.unread);
    return {
      success: true,
      mock: true,
      summary: `You have ${unread.length} unread emails.`,
      emails: unread.slice(0, maxResults),
      message: `Summarized ${unread.length} unread emails from Gmail.`,
    };
  }

  try {
    const gmail = getGmailClient(accessToken);
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults,
    });

    const messages = listResponse.data.messages || [];
    const emailDetails = await Promise.all(
      messages.slice(0, Math.min(maxResults, 5)).map(async (message) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });
        const headers = detail.data.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((header) => header.name === name)?.value || "";

        return {
          id: message.id,
          from: getHeader("From"),
          subject: getHeader("Subject"),
          date: getHeader("Date"),
          snippet: detail.data.snippet,
          unread: true,
        };
      })
    );

    return {
      success: true,
      mock: false,
      summary: `You have ${messages.length} unread emails.`,
      emails: emailDetails,
      message: `Summarized ${messages.length} unread emails from Gmail.`,
    };
  } catch (error) {
    console.error("[Gmail] summarize_inbox error:", error);
    return { success: false, error: "Failed to fetch inbox" };
  }
}

export async function executeSearchEmails(
  { query, maxResults = 5 }: z.infer<typeof searchEmailsInputSchema>,
  { accessToken }: GoogleToolContext
) {
  if (!accessToken) {
    const filtered = MOCK_EMAILS.filter(
      (email) =>
        email.subject.toLowerCase().includes(query.toLowerCase()) ||
        email.from.toLowerCase().includes(query.toLowerCase())
    );

    return {
      success: true,
      mock: true,
      emails: filtered.slice(0, maxResults),
      message: `Found ${filtered.length} matching emails.`,
    };
  }

  try {
    const gmail = getGmailClient(accessToken);
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults,
    });

    const messages = listResponse.data.messages || [];
    return {
      success: true,
      mock: false,
      count: messages.length,
      emails: messages,
      message: `Found ${messages.length} matching emails.`,
    };
  } catch (error) {
    console.error("[Gmail] search_emails error:", error);
    return { success: false, error: "Search failed" };
  }
}

export async function executeDraftReply(
  { to, subject, body }: z.infer<typeof draftReplyInputSchema>,
  { accessToken }: GoogleToolContext
) {
  if (!accessToken) {
    return {
      success: true,
      mock: true,
      draft: { to, subject, body, id: "mock-draft-001" },
      message: `Draft created: "${subject}" to ${to}`,
    };
  }

  try {
    const gmail = getGmailClient(accessToken);
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      body,
    ].join("\n");

    const encoded = Buffer.from(email).toString("base64url");
    const response = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw: encoded } },
    });

    return {
      success: true,
      mock: false,
      draftId: response.data.id,
      message: `Draft created for "${subject}" to ${to}`,
    };
  } catch (error) {
    console.error("[Gmail] draft_reply error:", error);
    return { success: false, error: "Failed to create draft" };
  }
}

export async function executeSendEmail(
  { to, subject, body }: z.infer<typeof sendEmailInputSchema>,
  { accessToken }: GoogleToolContext
) {
  if (!accessToken) {
    return {
      success: true,
      mock: true,
      message: `[MOCK] Email sent to ${to}: "${subject}"`,
    };
  }

  try {
    const gmail = getGmailClient(accessToken);
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      body,
    ].join("\n");

    const encoded = Buffer.from(email).toString("base64url");
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encoded },
    });

    return {
      success: true,
      mock: false,
      message: `Email sent to ${to}: "${subject}"`,
    };
  } catch (error) {
    console.error("[Gmail] send_email error:", error);
    return { success: false, error: "Failed to send email" };
  }
}
