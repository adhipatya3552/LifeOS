"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  FolderOpen,
  Mail,
  Shield,
  ShieldCheck,
  Zap,
} from "lucide-react";

type BentoCard = {
  key: string;
  span: string;
  icon: typeof Zap;
  color: string;
  title: string;
  description: string;
  bullets?: string[];
};

const cards: BentoCard[] = [
  {
    key: "multi",
    span: "lg:col-span-2 lg:row-span-2",
    icon: Zap,
    color: "#7c5cff",
    title: "One message, multi-service actions",
    description:
      "Ask in plain English. LifeOS can summarize Gmail, check Calendar, and touch Drive in a single turn — with streaming replies and action cards you can see.",
    bullets: [
      "Summarize inbox & search mail",
      "Create or reschedule events",
      "List, read, and create Docs",
    ],
  },
  {
    key: "gmail",
    span: "",
    icon: Mail,
    color: "#ea4335",
    title: "Gmail intelligence",
    description:
      "Unread digests, search, drafts, and send — with approval before anything leaves your account.",
  },
  {
    key: "cal",
    span: "",
    icon: CalendarDays,
    color: "#4285f4",
    title: "Calendar mastery",
    description:
      "Today's agenda, free slots, new meetings, and reschedules without opening another tab.",
  },
  {
    key: "drive",
    span: "",
    icon: FolderOpen,
    color: "#34a853",
    title: "Drive management",
    description:
      "Recent Docs, quick summaries, and new documents generated from a prompt.",
  },
  {
    key: "oauth",
    span: "md:col-span-2 lg:col-span-1",
    icon: Shield,
    color: "#3dffb5",
    title: "Private Google OAuth",
    description:
      "Per-service scopes. Tokens stay in your private Convex database and refresh automatically. Revoke anytime.",
  },
  {
    key: "hitl",
    span: "md:col-span-2 lg:col-span-2",
    icon: ShieldCheck,
    color: "#f59e0b",
    title: "Human-in-the-loop",
    description:
      "Sensitive writes can pause for your explicit approve/reject. Sending email can always require confirmation — you stay in command.",
  },
];

export function FeatureBento() {
  return (
    <section
      id="features"
      className="relative px-4 py-20 sm:px-6 sm:py-28"
      style={{ background: "var(--color-surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(124,92,255,0.4), transparent)",
        }}
      />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--color-accent)" }}
          >
            Systems online
          </p>
          <h2 className="font-display mb-4 text-3xl font-bold md:text-5xl">
            Everything you need to{" "}
            <span className="gradient-text">operate your day</span>
          </h2>
          <p className="text-lg" style={{ color: "var(--color-text-muted)" }}>
            Built around real Gmail, Calendar, and Drive tools — not a generic
            chatbot wrapper.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3">
          {cards.map((card, index) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className={`${card.span} bento-card glass-depth rounded-2xl p-6`}
              style={{ border: "1px solid var(--color-border)" }}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: `${card.color}18`,
                  border: `1px solid ${card.color}35`,
                }}
              >
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
              <h3
                className="font-display mb-2 text-lg font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {card.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-muted)" }}
              >
                {card.description}
              </p>
              {card.bullets ? (
                <ul className="mt-4 space-y-2">
                  {card.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "var(--color-accent)" }}
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
