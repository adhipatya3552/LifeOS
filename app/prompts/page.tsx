import type { Metadata } from "next";
import Link from "next/link";
import { Brain, CalendarDays, FolderOpen, Mail, Sparkles } from "lucide-react";
import { PROMPT_GALLERY } from "@/lib/prompt-gallery";
import { SIGN_UP_HREF } from "@/components/marketing/auth-links";

export const metadata: Metadata = {
  title: "Prompt gallery",
  description:
    "Ready-made LifeOS prompts for Gmail, Google Calendar, and Drive. Start a conversation with one click.",
  alternates: { canonical: "/prompts" },
};

const serviceMeta = {
  gmail: { label: "Gmail", color: "#ea4335", icon: Mail },
  calendar: { label: "Calendar", color: "#4285f4", icon: CalendarDays },
  drive: { label: "Drive", color: "#34a853", icon: FolderOpen },
  multi: { label: "Multi-service", color: "#7c5cff", icon: Sparkles },
} as const;

export default function PromptsPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <header
        className="border-b glass"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold gradient-text">
              LifeOS
            </span>
          </Link>
          <a
            href={SIGN_UP_HREF}
            className="gradient-primary rounded-full px-4 py-2 text-sm font-semibold text-white"
          >
            Launch LifeOS
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium"
          style={{ color: "var(--color-primary-light)" }}
        >
          ← LifeOS
        </Link>
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--color-accent)" }}
        >
          Prompt gallery
        </p>
        <h1 className="font-display mb-3 text-3xl font-bold sm:text-5xl">
          Start with a proven prompt
        </h1>
        <p
          className="mb-10 max-w-2xl text-base sm:text-lg"
          style={{ color: "var(--color-text-muted)" }}
        >
          Each card deep-links into LifeOS with the prompt ready to run after you
          sign in. Connect the matching Google service first for best results.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {PROMPT_GALLERY.map((item) => {
            const meta = serviceMeta[item.service];
            const Icon = meta.icon;
            const href = `/dashboard?prompt=${encodeURIComponent(item.prompt)}`;

            return (
              <article
                key={item.id}
                className="glass-depth flex flex-col rounded-2xl p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      background: `${meta.color}18`,
                      border: `1px solid ${meta.color}35`,
                      color: meta.color,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                </div>
                <h2 className="font-display mb-1 text-lg font-semibold">
                  {item.title}
                </h2>
                <p
                  className="mb-3 text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {item.description}
                </p>
                <p
                  className="mb-5 flex-1 rounded-xl px-3 py-2 font-mono text-sm"
                  style={{
                    background: "rgba(7,7,15,0.45)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  {item.prompt}
                </p>
                <Link
                  href={href}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white gradient-primary"
                >
                  Use in LifeOS
                </Link>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
