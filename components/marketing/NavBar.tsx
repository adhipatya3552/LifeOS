"use client";

import { Brain } from "lucide-react";
import { SIGN_IN_HREF, SIGN_UP_HREF } from "@/components/marketing/auth-links";

export function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b glass"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary glow-primary">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display text-xl font-bold gradient-text">
              LifeOS
            </span>
            <p
              className="text-[10px] font-medium uppercase tracking-[0.16em]"
              style={{ color: "var(--color-text-subtle)" }}
            >
              Control room
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-start gap-3 sm:w-auto sm:justify-end sm:gap-4">
          <a
            href="#demo"
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-white"
            style={{ color: "var(--color-text-muted)" }}
          >
            Live demo
          </a>
          <a
            href="#features"
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-white"
            style={{ color: "var(--color-text-muted)" }}
          >
            Features
          </a>
          <a
            href="/prompts"
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-white"
            style={{ color: "var(--color-text-muted)" }}
          >
            Prompts
          </a>
          <a
            href={SIGN_IN_HREF}
            className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-200"
            style={{
              border: "1px solid var(--color-border-hover)",
              color: "var(--color-text-muted)",
            }}
          >
            Sign in
          </a>
          <a
            href={SIGN_UP_HREF}
            id="get-started-btn"
            className="gradient-primary rounded-full px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 glow-primary"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
