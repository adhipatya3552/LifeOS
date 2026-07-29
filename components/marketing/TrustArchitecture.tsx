"use client";

import { motion } from "framer-motion";
import { Brain, Database, Lock, User } from "lucide-react";

const steps = [
  {
    icon: User,
    label: "You",
    detail: "Sign in with Auth0",
    color: "#a78bfa",
  },
  {
    icon: Brain,
    label: "LifeOS agent",
    detail: "Natural language + tools",
    color: "#7c5cff",
  },
  {
    icon: Lock,
    label: "Google OAuth",
    detail: "Per-service scopes",
    color: "#4285f4",
  },
  {
    icon: Database,
    label: "Your Convex DB",
    detail: "Private tokens + history",
    color: "#3dffb5",
  },
];

export function TrustArchitecture() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--color-accent)" }}
          >
            Trust model
          </p>
          <h2 className="font-display mb-4 text-3xl font-bold md:text-4xl">
            Security you can <span className="gradient-text">explain</span>
          </h2>
          <p
            className="mx-auto max-w-2xl text-base sm:text-lg"
            style={{ color: "var(--color-text-muted)" }}
          >
            No black-box vault claims. LifeOS uses Auth0 for login, direct Google
            OAuth per service, private token storage, and optional approval before
            writes.
          </p>
        </motion.div>

        <div className="glass-depth rounded-3xl p-6 sm:p-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.label}
                className="flex items-center gap-4 rounded-2xl p-4 lg:flex-col lg:text-center"
                style={{
                  background: "rgba(7,7,15,0.35)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: `${step.color}18`,
                    border: `1px solid ${step.color}40`,
                    boxShadow: `0 0 24px ${step.color}22`,
                  }}
                >
                  <step.icon className="h-6 w-6" style={{ color: step.color }} />
                </div>
                <div className="min-w-0 lg:mt-1">
                  <p
                    className="font-display font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {step.label}
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-8 grid gap-3 border-t pt-8 sm:grid-cols-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            {[
              "No Google password ever shared with LifeOS",
              "Approve or reject sensitive writes in-app",
              "Disconnect any service from Connections anytime",
            ].map((item) => (
              <p
                key={item}
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "rgba(61,255,181,0.06)",
                  border: "1px solid rgba(61,255,181,0.15)",
                  color: "var(--color-text-muted)",
                }}
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
