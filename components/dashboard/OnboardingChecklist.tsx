"use client";

import Link from "next/link";
import { CheckCircle2, Circle, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { GoogleServiceId } from "@/lib/google-service-registry";

const DISMISS_KEY = "lifeos_onboarding_dismissed";

type OnboardingChecklistProps = {
  connectedServices: GoogleServiceId[];
  hasMessages: boolean;
  onPickPrompt: (prompt: string) => void;
};

export function OnboardingChecklist({
  connectedServices,
  hasMessages,
  onPickPrompt,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const gmail = connectedServices.includes("gmail");
  const calendar = connectedServices.includes("calendar");
  const drive = connectedServices.includes("drive");
  const anyService = gmail || calendar || drive;

  const steps = [
    {
      id: "connect",
      done: anyService,
      title: "Connect a Google service",
      detail: "Start with Gmail, Calendar, or Drive.",
      action: (
        <Link
          href="/connections"
          className="text-sm font-semibold underline-offset-2 hover:underline"
          style={{ color: "var(--color-primary-light)" }}
        >
          Open Connections
        </Link>
      ),
    },
    {
      id: "prompt",
      done: hasMessages,
      title: "Run your first prompt",
      detail: "Try a one-liner the agent can execute.",
      action: (
        <button
          type="button"
          onClick={() =>
            onPickPrompt(
              gmail
                ? "Summarize my unread emails."
                : calendar
                  ? "What's on my calendar today?"
                  : drive
                    ? "List my recent Drive docs."
                    : "Summarize my unread emails."
            )
          }
          className="text-sm font-semibold underline-offset-2 hover:underline"
          style={{ color: "var(--color-primary-light)" }}
        >
          Use a starter prompt
        </button>
      ),
    },
    {
      id: "more",
      done: [gmail, calendar, drive].filter(Boolean).length >= 2,
      title: "Connect a second service",
      detail: "Multi-service prompts get more powerful.",
      action: (
        <Link
          href="/connections"
          className="text-sm font-semibold underline-offset-2 hover:underline"
          style={{ color: "var(--color-primary-light)" }}
        >
          Add another
        </Link>
      ),
    },
  ];

  const allDone = steps.every((step) => step.done);

  if (dismissed || allDone) {
    return null;
  }

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  return (
    <div
      className="mb-4 rounded-2xl p-4 sm:p-5"
      style={{
        background:
          "linear-gradient(145deg, rgba(124,92,255,0.12), rgba(16,16,28,0.9))",
        border: "1px solid rgba(124,92,255,0.28)",
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--color-accent)" }}
          >
            Getting started
          </p>
          <h2
            className="font-display text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Bring your systems online
          </h2>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss onboarding"
          className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
          style={{ color: "var(--color-text-subtle)" }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="space-y-3">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex flex-col gap-2 rounded-xl px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            style={{
              background: "rgba(7,7,15,0.35)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-start gap-3">
              {step.done ? (
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: "var(--color-accent)" }}
                />
              ) : (
                <Circle
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: "var(--color-text-subtle)" }}
                />
              )}
              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: step.done
                      ? "var(--color-text-muted)"
                      : "var(--color-text)",
                    textDecoration: step.done ? "line-through" : "none",
                  }}
                >
                  {step.title}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                  {step.detail}
                </p>
              </div>
            </div>
            {!step.done ? <div className="pl-8 sm:pl-0">{step.action}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
