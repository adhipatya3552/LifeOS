"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, BookOpen } from "lucide-react";

export function BlogSection() {
  return (
    <section id="blog" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 70% 80%, rgba(61,255,181,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(124,92,255,0.1)",
              border: "1px solid rgba(124,92,255,0.25)",
              color: "var(--color-primary-light)",
            }}
          >
            <BookOpen className="h-3 w-3" />
            <span>From the build log</span>
          </div>
          <h2 className="font-display mb-6 text-3xl font-bold md:text-5xl">
            Building LifeOS:{" "}
            <span className="gradient-text">secure AI automation</span>
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full gradient-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-depth relative rounded-3xl p-8 md:p-12"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Brain className="h-24 w-24 text-white" />
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-lg leading-relaxed md:text-xl" style={{ color: "var(--color-text)" }}>
              Building <strong>LifeOS</strong> for the &quot;Authorized to Act&quot; hackathon has been an exhilarating yet challenging journey.
              Our goal was simple but ambitious: create a personal AI agent that can manage your digital life—emails, calendar, and documents—while
              keeping you in control of sensitive actions.
            </p>

            <p className="text-base leading-relaxed md:text-lg" style={{ color: "var(--color-text-muted)" }}>
              The architecture we shipped uses <strong>Auth0 for sign-in</strong> and <strong>direct Google OAuth</strong> for each service
              (Gmail, Calendar, Drive). Tokens are stored in your private Convex database, refreshed automatically, and can be revoked at any time.
              Write actions can require explicit in-app approval before they run.
            </p>

            <div
                className="my-8 p-6 rounded-2xl bg-opacity-10 border border-opacity-20"
                style={{
                    background: "rgba(6, 182, 212, 0.05)",
                    borderColor: "rgba(6, 182, 212, 0.2)"
                }}
            >
                <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    <h4 className="font-bold text-cyan-400">The model we chose</h4>
                </div>
                <p className="italic text-lg" style={{ color: "var(--color-text)" }}>
                    &ldquo;Per-service Google OAuth, private token storage, automatic refresh, and human-in-the-loop
                    approval for sensitive writes — so the agent can act without taking you out of the loop.&rdquo;
                </p>
            </div>

            <p className="text-base leading-relaxed md:text-lg" style={{ color: "var(--color-text-muted)" }}>
              That foundation let us focus on the intelligence and UX of the agent. One of our proudest moments was watching
              LifeOS move from summarizing a Gmail thread to booking a Calendar meeting from a single natural-language prompt.
            </p>

            <p className="text-base leading-relaxed md:text-lg" style={{ color: "var(--color-text-muted)" }}>
              It felt like a step toward personal productivity tools people can actually trust — not by hiding security behind buzzwords,
              but by making connections, scopes, and approvals understandable.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    A
                </div>
                <div>
                    <p className="font-semibold" style={{ color: "var(--color-text)" }}>Adhipatya</p>
                    <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Developer, LifeOS</p>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
