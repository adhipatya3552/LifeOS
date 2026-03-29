import { google } from "googleapis";
import { z } from "zod";
import type { GoogleToolContext } from "@/lib/tools/gmail";

export const listRecentDocsInputSchema = z.object({
  maxResults: z.number().optional().default(10).describe("Number of docs to return"),
});

export const summarizeDocInputSchema = z.object({
  docId: z.string().describe("The Google Doc ID"),
  docName: z.string().optional().describe("Human-readable name for context"),
});

export const createDocInputSchema = z.object({
  title: z.string().describe("Document title"),
  content: z.string().describe("Initial document content"),
});

const MOCK_DOCS = [
  {
    id: "doc1",
    name: "Q1 2026 OKRs",
    modifiedTime: "2026-03-18T10:00:00Z",
    webViewLink: "https://docs.google.com/document/d/mock1",
    mimeType: "application/vnd.google-apps.document",
  },
  {
    id: "doc2",
    name: "Product Roadmap 2026",
    modifiedTime: "2026-03-17T15:30:00Z",
    webViewLink: "https://docs.google.com/document/d/mock2",
    mimeType: "application/vnd.google-apps.document",
  },
  {
    id: "doc3",
    name: "Team Meeting Notes - March",
    modifiedTime: "2026-03-19T09:45:00Z",
    webViewLink: "https://docs.google.com/document/d/mock3",
    mimeType: "application/vnd.google-apps.document",
  },
];

function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}

function getDocsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.docs({ version: "v1", auth });
}

export async function executeListRecentDocs(
  { maxResults = 10 }: z.infer<typeof listRecentDocsInputSchema>,
  { accessToken }: GoogleToolContext
) {
  if (!accessToken) {
    return {
      success: true,
      mock: true,
      docs: MOCK_DOCS.slice(0, maxResults),
      message: `Found ${Math.min(maxResults, MOCK_DOCS.length)} recent documents`,
    };
  }

  try {
    const drive = getDriveClient(accessToken);
    const response = await drive.files.list({
      pageSize: maxResults,
      orderBy: "modifiedTime desc",
      q: "mimeType='application/vnd.google-apps.document'",
      fields: "files(id,name,modifiedTime,webViewLink,mimeType)",
    });

    const docs = response.data.files || [];
    return {
      success: true,
      mock: false,
      docs,
      message: `Found ${docs.length} recent documents`,
    };
  } catch (error) {
    console.error("[Drive] list_recent_docs error:", error);
    return { success: false, error: "Failed to list documents" };
  }
}

export async function executeSummarizeDoc(
  { docId, docName }: z.infer<typeof summarizeDocInputSchema>,
  { accessToken }: GoogleToolContext
) {
  if (!accessToken) {
    const mockDoc = MOCK_DOCS.find((doc) => doc.id === docId);
    return {
      success: true,
      mock: true,
      docName: mockDoc?.name || docName || docId,
      summary:
        "This document contains the Q1 2026 objectives and key results for the product team. Key highlights: (1) Launch v2.0 by end of March, (2) Reach 10K active users, (3) Improve NPS to 45+.",
      message: `Summarized "${mockDoc?.name || docName || docId}"`,
    };
  }

  try {
    const docs = getDocsClient(accessToken);
    const response = await docs.documents.get({ documentId: docId });
    const content =
      response.data.body?.content
        ?.map((element) =>
          element.paragraph?.elements
            ?.map((paragraphElement) => paragraphElement.textRun?.content || "")
            .join("") || ""
        )
        .join("\n")
        .slice(0, 4000) || "";

    return {
      success: true,
      mock: false,
      docName: response.data.title,
      content,
      message: `Retrieved ${content.length} characters from "${response.data.title}"`,
    };
  } catch (error) {
    console.error("[Drive] summarize_doc error:", error);
    return { success: false, error: "Failed to read document" };
  }
}

export async function executeCreateDoc(
  { title, content }: z.infer<typeof createDocInputSchema>,
  { accessToken }: GoogleToolContext
) {
  if (!accessToken) {
    return {
      success: true,
      mock: true,
      docId: "mock-doc-new",
      docName: title,
      webViewLink: "https://docs.google.com/document/d/mock-new",
      message: `Created document "${title}"`,
    };
  }

  try {
    const docs = getDocsClient(accessToken);
    const createResponse = await docs.documents.create({
      requestBody: { title },
    });

    const docId = createResponse.data.documentId!;

    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content,
            },
          },
        ],
      },
    });

    return {
      success: true,
      mock: false,
      docId,
      docName: title,
      webViewLink: `https://docs.google.com/document/d/${docId}`,
      message: `Created document "${title}"`,
    };
  } catch (error) {
    console.error("[Drive] create_doc error:", error);
    return { success: false, error: "Failed to create document" };
  }
}
