"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Mail,
  CalendarDays,
  FolderOpen,
  Shield,
  Zap,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Mail,
    color: "#ea4335",
    title: "Gmail Intelligence",
    description:
      "Summarize your inbox, draft replies, search emails, and send messages through natural conversation.",
  },
  {
    icon: CalendarDays,
    color: "#4285f4",
    title: "Calendar Mastery",
    description:
      "View your schedule, create events, reschedule meetings, and find free slots effortlessly.",
  },
  {
    icon: FolderOpen,
    color: "#34a853",
    title: "Drive Management",
    description:
      "Browse recent docs, summarize content, and create new documents without switching apps.",
  },
  {
    icon: Shield,
    color: "#8b5cf6",
    title: "Auth0 Token Vault",
    description:
      "Your tokens are stored securely in Auth0 Token Vault. The agent acts on your behalf without ever seeing raw credentials.",
  },
  {
    icon: Zap,
    color: "#06b6d4",
    title: "Streaming Responses",
    description:
      "Real-time AI responses with action cards that show exactly what your agent is doing, step by step.",
  },
  {
    icon: Shield,
    color: "#f59e0b",
    title: "Human-in-the-Loop",
    description:
      "Sensitive actions like sending emails require your explicit approval before firing. You stay in control.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SIGN_IN_HREF = "/auth/login?returnTo=%2Fdashboard";
const SIGN_UP_HREF =
  "/auth/login?screen_hint=signup&returnTo=%2Fdashboard";

export function LandingPageClient() {
  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-clip"
      style={{ background: "var(--color-bg)" }}
    >
      <nav
        className="sticky top-0 z-50 border-b glass"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Brain
              className="h-7 w-7"
              style={{ color: "var(--color-primary)" }}
            />
            <span className="text-xl font-bold gradient-text">LifeOS</span>
          </div>

          <div className="flex w-full flex-wrap items-center justify-start gap-3 sm:w-auto sm:justify-end sm:gap-4">
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

      <section className="relative overflow-hidden px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-32 sm:pt-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(139,92,246,0.2) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full sm:left-1/4 sm:h-64 sm:w-64 sm:translate-x-0"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 mx-auto w-full max-w-4xl"
        >
          <div
            className="mb-8 inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "var(--color-primary-light)",
            }}
          >
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            <span className="truncate sm:whitespace-nowrap">
              Authorized to Act Hackathon Project
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight sm:text-5xl md:text-7xl">
            Your AI <span className="gradient-text">Personal</span>
            <br />
            Operating System
          </h1>

          <p
            className="mx-auto mb-10 max-w-2xl text-lg sm:mb-12 sm:text-xl md:text-2xl"
            style={{ color: "var(--color-text-muted)" }}
          >
            LifeOS manages your Gmail, Google Calendar, and Drive through natural
            conversation, powered by{" "}
            <span style={{ color: "var(--color-primary-light)" }}>
              Auth0 Token Vault
            </span>{" "}
            for secure, credential-free AI automation.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <a
              href={SIGN_UP_HREF}
              id="hero-cta-btn"
              className="gradient-primary flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:scale-105 glow-primary sm:w-auto"
            >
              Launch LifeOS
              <ChevronRight className="h-5 w-5" />
            </a>
            <Link
              href="#features"
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-medium transition-all duration-200 hover:scale-105 sm:w-auto"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-hover)",
                color: "var(--color-text)",
              }}
            >
              See Features
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 mx-auto mt-12 w-full max-w-2xl animate-float sm:mt-16"
        >
          <div
            className="rounded-2xl p-4 text-left glass sm:p-6"
            style={{ border: "1px solid var(--color-border-hover)" }}
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                LifeOS Agent
              </span>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-xs animate-pulse-glow"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  color: "var(--color-success)",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                Live
              </span>
            </div>

            <div
              className="mb-4 rounded-xl p-4"
              style={{
                background: "rgba(139,92,246,0.05)",
                border: "1px solid rgba(139,92,246,0.1)",
              }}
            >
              <p
                className="mb-1 text-sm font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                You
              </p>
              <p style={{ color: "var(--color-text)" }}>
                Summarize my inbox and schedule a meeting with Alice for tomorrow
                at 2pm.
              </p>
            </div>

            <div className="space-y-3">
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p
                  className="mb-2 text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  You have{" "}
                  <strong style={{ color: "var(--color-primary-light)" }}>
                    3 unread emails
                  </strong>
                  . Most urgent: Q1 Report from Alice, Invoice from Vendor.
                </p>
              </div>

              <div
                className="flex items-center gap-3 rounded-xl p-4"
                style={{
                  background: "rgba(66,133,244,0.08)",
                  border: "1px solid rgba(66,133,244,0.25)",
                }}
              >
                <CalendarDays
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: "#4285f4" }}
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#4285f4" }}
                  >
                    Created event
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Meeting with Alice - Tomorrow, 2:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section
        id="features"
        className="px-4 py-20 sm:px-6 sm:py-24"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-5xl">
              Everything you need,{" "}
              <span className="gradient-text">nothing you don&apos;t</span>
            </h2>
            <p className="text-lg" style={{ color: "var(--color-text-muted)" }}>
              Built for the Authorized to Act Hackathon, and designed to fit your
              daily life.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <div
                  className="glass-light h-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{ border: "1px solid var(--color-border)" }}
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: `${feature.color}18`,
                      border: `1px solid ${feature.color}30`,
                    }}
                  >
                    <feature.icon
                      className="h-6 w-6"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3
                    className="mb-2 text-lg font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 text-center sm:px-6 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-2xl"
        >
          <h2 className="mb-6 text-4xl font-bold">
            Ready to run your life on{" "}
            <span className="gradient-text">autopilot?</span>
          </h2>
          <p
            className="mb-10 text-lg"
            style={{ color: "var(--color-text-muted)" }}
          >
            Connect your Google account once. LifeOS handles the rest - securely,
            privately, intelligently.
          </p>
          <a
            href={SIGN_UP_HREF}
            id="bottom-cta-btn"
            className="gradient-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-5 text-xl font-bold text-white transition-all duration-200 hover:scale-105 glow-primary sm:w-auto sm:px-10"
          >
            Get Started Free
            <ChevronRight className="h-6 w-6" />
          </a>
        </motion.div>
      </section>

      <footer
        className="border-t px-4 py-8 text-center text-sm sm:px-6"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-text-subtle)",
        }}
      >
        <div className="mb-2 flex items-center justify-center gap-2">
          <Brain className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
          <span
            className="font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            LifeOS
          </span>
        </div>
        <p>
          Built for the Authorized to Act Hackathon. Powered by Auth0 Token
          Vault, Convex, and OpenRouter.
        </p>
      </footer>
    </div>
  );
}
