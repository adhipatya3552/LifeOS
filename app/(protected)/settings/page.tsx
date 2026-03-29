"use client";

import { Brain, Shield, Zap, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-y-auto overflow-x-clip">
      <div
        className="border-b glass px-4 py-6 sm:px-8"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Settings
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Configure your LifeOS preferences and agent behavior.
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        <Section icon={Brain} color="#8b5cf6" title="Agent Behavior">
          <ToggleSetting
            id="auto-approve-low-risk"
            label="Auto-approve low-risk actions"
            description="Allow the agent to execute read-only actions (inbox summary, schedule view) without confirmation."
            defaultChecked
          />
          <ToggleSetting
            id="require-approval-all"
            label="Require approval for all write actions"
            description="Pause before creating events, drafting emails, or modifying documents."
            defaultChecked={false}
          />
        </Section>

        <Section icon={Shield} color="#4285f4" title="Security">
          <ToggleSetting
            id="step-up-auth"
            label="Step-up auth for sensitive actions"
            description="Require re-authentication via Auth0 before sending emails or deleting events."
            defaultChecked
          />
          <ToggleSetting
            id="audit-log"
            label="Keep action audit log"
            description="Store a history of all agent actions in Convex for review."
            defaultChecked
          />
        </Section>

        <Section icon={Bell} color="#f59e0b" title="Notifications">
          <ToggleSetting
            id="action-completed"
            label="Notify when actions complete"
            description="Show a notification when the agent successfully completes a task."
            defaultChecked
          />
        </Section>

        <Section icon={Zap} color="#06b6d4" title="AI Model">
          <div className="space-y-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
            >
              Provider
            </label>
            <p className="mb-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Configured via <code style={{ color: "var(--color-primary-light)" }}>OPENROUTER_API_KEY</code>{" "}
              and <code style={{ color: "var(--color-primary-light)" }}>AI_MODEL</code> on the server.
            </p>
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              Current: <span style={{ color: "var(--color-primary-light)" }}>OpenRouter</span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  color,
  title,
  children,
}: {
  icon: typeof Brain;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function ToggleSetting({
  id,
  label,
  description,
  defaultChecked,
}: {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          {label}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          {description}
        </p>
      </div>
      <label className="relative cursor-pointer flex-shrink-0" htmlFor={id}>
        <input id={id} type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <div
          className="h-5 w-10 rounded-full bg-slate-700 transition-all duration-300 peer-checked:bg-violet-500"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 peer-checked:translate-x-5" />
        </div>
      </label>
    </div>
  );
}
