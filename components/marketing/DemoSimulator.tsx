"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  CalendarDays,
  FolderOpen,
  Mail,
  ShieldCheck,
} from "lucide-react";

type DemoId = "inbox" | "meeting" | "drive" | "free";

type DemoScript = {
  id: DemoId;
  label: string;
  user: string;
  reply: string;
  action?: {
    icon: typeof Mail;
    color: string;
    title: string;
    detail: string;
  };
};

const SCRIPTS: DemoScript[] = [
  {
    id: "inbox",
    label: "Summarize inbox",
    user: "Summarize my unread emails.",
    reply:
      "You have 3 unread emails. Most urgent: Q1 Report from Alice, Invoice from Vendor, and a PR review request.",
    action: {
      icon: Mail,
      color: "#ea4335",
      title: "Gmail · summarize_inbox",
      detail: "3 unread · priority sorted",
    },
  },
  {
    id: "meeting",
    label: "Book meeting",
    user: "Schedule a meeting with Alice tomorrow at 2pm.",
    reply:
      "Done. I created “Meeting with Alice” for tomorrow at 2:00 PM and noted it on your primary calendar.",
    action: {
      icon: CalendarDays,
      color: "#4285f4",
      title: "Calendar · create_event",
      detail: "Meeting with Alice · Tomorrow 2:00 PM",
    },
  },
  {
    id: "drive",
    label: "List docs",
    user: "List my recent Drive docs.",
    reply:
      "Here are your 3 most recently modified Docs: Q1 OKRs, Product Roadmap 2026, and Team Meeting Notes.",
    action: {
      icon: FolderOpen,
      color: "#34a853",
      title: "Drive · list_recent_docs",
      detail: "3 Google Docs · sorted by modified",
    },
  },
  {
    id: "free",
    label: "Find free slot",
    user: "Find a 30-minute free slot tomorrow afternoon.",
    reply:
      "Tomorrow afternoon you’re free 2:00–2:30 PM and 4:00–4:30 PM. Want me to book one?",
    action: {
      icon: CalendarDays,
      color: "#4285f4",
      title: "Calendar · find_free_slot",
      detail: "2 open 30-min windows",
    },
  },
];

type Phase = "idle" | "user" | "typing" | "reply" | "action";

export function DemoSimulator() {
  const [activeId, setActiveId] = useState<DemoId>("inbox");
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);

  const script = SCRIPTS.find((item) => item.id === activeId) || SCRIPTS[0];

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const runScript = useCallback(
    (id: DemoId) => {
      clearTimers();
      setActiveId(id);
      setPhase("user");

      const t1 = window.setTimeout(() => setPhase("typing"), 450);
      const t2 = window.setTimeout(() => setPhase("reply"), 1400);
      const t3 = window.setTimeout(() => setPhase("action"), 1900);
      timers.current = [t1, t2, t3];
    },
    [clearTimers]
  );

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setPhase("action");
      return;
    }

    runScript("inbox");
    return clearTimers;
  }, [runScript, clearTimers]);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        {SCRIPTS.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => runScript(item.id)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: selected
                  ? "rgba(124, 92, 255, 0.22)"
                  : "var(--color-surface-2)",
                border: selected
                  ? "1px solid rgba(124, 92, 255, 0.55)"
                  : "1px solid var(--color-border)",
                color: selected
                  ? "var(--color-primary-light)"
                  : "var(--color-text-muted)",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        className="panel-3d relative overflow-hidden rounded-2xl p-4 sm:p-5"
        style={{ minHeight: 320 }}
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              LifeOS Agent
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
              Interactive preview · no signup required
            </p>
          </div>
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium animate-pulse-glow"
            style={{
              background: "rgba(61, 255, 181, 0.1)",
              color: "var(--color-accent)",
              border: "1px solid rgba(61, 255, 181, 0.35)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
            Live
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {phase !== "idle" ? (
              <motion.div
                key={`user-${script.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl p-3.5"
                style={{
                  background: "rgba(124, 92, 255, 0.08)",
                  border: "1px solid rgba(124, 92, 255, 0.18)",
                }}
              >
                <p
                  className="mb-1 text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  You
                </p>
                <p className="text-sm" style={{ color: "var(--color-text)" }}>
                  {script.user}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {phase === "typing" ? (
            <div
              className="inline-flex items-center gap-1 rounded-xl px-4 py-3"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : null}

          <AnimatePresence>
            {phase === "reply" || phase === "action" ? (
              <motion.div
                key={`reply-${script.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3.5"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                  {script.reply}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {phase === "action" && script.action ? (
              <motion.div
                key={`action-${script.id}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 rounded-xl p-3.5"
                style={{
                  background: `${script.action.color}12`,
                  border: `1px solid ${script.action.color}40`,
                }}
              >
                <script.action.icon
                  className="h-5 w-5 shrink-0"
                  style={{ color: script.action.color }}
                />
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: script.action.color }}
                  >
                    {script.action.title}
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {script.action.detail}
                  </p>
                </div>
                <ShieldCheck
                  className="ml-auto h-4 w-4 shrink-0"
                  style={{ color: "var(--color-accent)" }}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
