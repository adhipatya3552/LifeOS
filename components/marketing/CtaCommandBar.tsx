"use client";

import { motion } from "framer-motion";
import { ChevronRight, Terminal } from "lucide-react";
import { SIGN_UP_HREF } from "@/components/marketing/auth-links";

export function CtaCommandBar() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl p-8 text-center sm:p-12"
        style={{
          background:
            "linear-gradient(145deg, rgba(124,92,255,0.18) 0%, rgba(16,16,28,0.95) 45%, rgba(61,255,181,0.08) 100%)",
          border: "1px solid rgba(124,92,255,0.35)",
          boxShadow: "var(--layer-3)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 os-grid-bg opacity-40" />

        <div className="relative z-10">
          <div
            className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(61,255,181,0.12)",
              border: "1px solid rgba(61,255,181,0.35)",
            }}
          >
            <Terminal className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
          </div>

          <h2 className="font-display mb-4 text-3xl font-bold sm:text-4xl">
            Ready to run your life on{" "}
            <span className="gradient-text">autopilot?</span>
          </h2>
          <p
            className="mx-auto mb-8 max-w-xl text-base sm:text-lg"
            style={{ color: "var(--color-text-muted)" }}
          >
            Connect Google once. Chat to manage mail, calendar, and docs — with
            approvals when you want them.
          </p>

          <div
            className="mx-auto mb-8 flex max-w-lg items-center gap-3 rounded-2xl px-4 py-3 text-left"
            style={{
              background: "rgba(7,7,15,0.65)",
              border: "1px solid rgba(124,92,255,0.3)",
            }}
          >
            <span
              className="font-mono text-sm"
              style={{ color: "var(--color-accent)" }}
            >
              &gt;
            </span>
            <span
              className="truncate font-mono text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              Try: Summarize my unread mail…
            </span>
          </div>

          <a
            href={SIGN_UP_HREF}
            id="bottom-cta-btn"
            className="gradient-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-5 text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] glow-primary sm:w-auto sm:px-10"
          >
            Get Started Free
            <ChevronRight className="h-6 w-6" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
