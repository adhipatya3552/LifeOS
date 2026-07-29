"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

export function SiteFooter() {
  return (
    <footer
      className="border-t px-4 py-10 text-center text-sm sm:px-6"
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-text-subtle)",
      }}
    >
      <div className="mb-3 flex items-center justify-center gap-2">
        <Brain className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
        <span
          className="font-display font-semibold"
          style={{ color: "var(--color-text-muted)" }}
        >
          LifeOS
        </span>
      </div>
      <p className="mx-auto max-w-lg leading-relaxed">
        Personal AI operating system for Gmail, Calendar, and Drive. Auth0 sign-in ·
        direct Google OAuth · Convex · OpenRouter.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link href="/prompts" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
          Prompts
        </Link>
        <Link href="/privacy" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
          Privacy
        </Link>
        <Link href="/terms" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
          Terms
        </Link>
      </div>
      <p className="mt-3 text-xs opacity-80">
        Originally built for the Authorized to Act hackathon.
      </p>
    </footer>
  );
}
