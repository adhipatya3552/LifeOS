export type PromptGalleryItem = {
  id: string;
  title: string;
  prompt: string;
  service: "gmail" | "calendar" | "drive" | "multi";
  description: string;
};

export const PROMPT_GALLERY: PromptGalleryItem[] = [
  {
    id: "summarize-inbox",
    title: "Summarize inbox",
    prompt: "Summarize my unread emails.",
    service: "gmail",
    description: "Quick priority digest of unread mail.",
  },
  {
    id: "calendar-today",
    title: "Today's schedule",
    prompt: "What's on my calendar today?",
    service: "calendar",
    description: "See meetings and free gaps for the day.",
  },
  {
    id: "list-docs",
    title: "Recent Drive docs",
    prompt: "List my recent Drive docs.",
    service: "drive",
    description: "Surface the Docs you touched last.",
  },
  {
    id: "free-slot",
    title: "Find a free slot",
    prompt: "Find a free slot tomorrow afternoon.",
    service: "calendar",
    description: "Suggest open windows for a meeting.",
  },
  {
    id: "search-mail",
    title: "Search email",
    prompt: "Search my emails for invoices from this month.",
    service: "gmail",
    description: "Find threads by topic or sender.",
  },
  {
    id: "weekly-review",
    title: "Weekly review",
    prompt:
      "Summarize my unread inbox and list this week's calendar events. Highlight anything urgent.",
    service: "multi",
    description: "One prompt across mail + calendar.",
  },
];

export function getPromptById(id: string) {
  return PROMPT_GALLERY.find((item) => item.id === id);
}
