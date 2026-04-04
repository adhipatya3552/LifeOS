"use client";

import { Brain, Shield, Bell, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUserRecord } from "@/lib/use-current-user";

export default function SettingsPage() {
  const currentUser = useCurrentUserRecord();
  const settings = useQuery(
    api.userSettings.getSettings,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const upsertSettings = useMutation(api.userSettings.upsertSettings);

  const isLoading = currentUser === undefined || settings === undefined;

  type SettingKey =
    | "autoApproveLowRisk"
    | "requireApprovalAll"
    | "stepUpAuth"
    | "auditLog"
    | "actionNotifications";

  function handleToggle(field: SettingKey) {
    if (!currentUser || !settings) return;
    upsertSettings({
      userId: currentUser._id,
      [field]: !(settings as Record<string, unknown>)[field],
    }).catch(console.error);
  }

  return (
    <div className="flex h-full min-w-0 flex-col overflow-y-auto overflow-x-clip">
      <div
        className="page-header px-4 py-6 sm:px-8"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Settings
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Configure your LifeOS preferences and agent behavior.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-24">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "var(--color-primary)" }}
          />
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
          <Section icon={Brain} color="#8b5cf6" title="Agent Behavior">
            <ToggleSetting
              id="auto-approve-low-risk"
              label="Auto-approve low-risk actions"
              description="Allow the agent to execute read-only actions (inbox summary, schedule view) without confirmation."
              checked={settings?.autoApproveLowRisk ?? true}
              onChange={() => handleToggle("autoApproveLowRisk")}
            />
            <ToggleSetting
              id="require-approval-all"
              label="Require approval for all write actions"
              description="Pause before creating events, drafting emails, or modifying documents."
              checked={settings?.requireApprovalAll ?? false}
              onChange={() => handleToggle("requireApprovalAll")}
            />
          </Section>

          <Section icon={Shield} color="#4285f4" title="Security">
            <ToggleSetting
              id="step-up-auth"
              label="Step-up auth for sensitive actions"
              description="Require re-authentication via Auth0 before sending emails or deleting events."
              checked={settings?.stepUpAuth ?? true}
              onChange={() => handleToggle("stepUpAuth")}
            />
            <ToggleSetting
              id="audit-log"
              label="Keep action audit log"
              description="Store a history of all agent actions in Convex for review."
              checked={settings?.auditLog ?? true}
              onChange={() => handleToggle("auditLog")}
            />
          </Section>

          <Section icon={Bell} color="#f59e0b" title="Notifications">
            <ToggleSetting
              id="action-completed"
              label="Play a sound when tasks complete"
              description="Plays a soft chime when the AI agent finishes responding to your request."
              checked={settings?.actionNotifications ?? true}
              onChange={() => handleToggle("actionNotifications")}
            />
          </Section>
        </div>
      )}
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
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          {label}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          {description}
        </p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className="relative flex-shrink-0 cursor-pointer"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <div
          className="h-6 w-11 rounded-full transition-all duration-300"
          style={{
            background: checked ? "var(--color-primary)" : "var(--color-surface-2)",
            border: `1px solid ${checked ? "var(--color-primary)" : "var(--color-border)"}`,
          }}
        >
          <div
            className="absolute h-5 w-5 rounded-full bg-white shadow transition-all duration-300"
            style={{
              top: "1px",
              left: checked ? "22px" : "2px",
            }}
          />
        </div>
      </button>
    </div>
  );
}
