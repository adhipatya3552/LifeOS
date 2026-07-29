"use client";

import { useCallback, useEffect, useState } from "react";
import { Brain, Shield, Bell, Loader2 } from "lucide-react";

type SettingKey =
  | "autoApproveLowRisk"
  | "requireApprovalAll"
  | "stepUpAuth"
  | "auditLog"
  | "actionNotifications";

type SettingsState = Record<SettingKey, boolean>;

const DEFAULT_SETTINGS: SettingsState = {
  autoApproveLowRisk: true,
  requireApprovalAll: false,
  stepUpAuth: true,
  auditLog: true,
  actionNotifications: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<SettingKey | null>(null);

  const loadSettings = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Could not load settings");
      }
      const payload = (await response.json()) as {
        settings?: Partial<SettingsState> | null;
      };
      setSettings({
        ...DEFAULT_SETTINGS,
        ...(payload.settings || {}),
      });
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load settings. Please refresh and try again.");
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleToggle(field: SettingKey) {
    if (!settings || savingKey) return;

    const nextValue = !settings[field];
    const previous = settings;
    setSettings({ ...settings, [field]: nextValue });
    setSavingKey(field);
    setError(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: nextValue }),
      });

      if (!response.ok) {
        throw new Error("Could not save setting");
      }

      const payload = (await response.json()) as {
        settings?: Partial<SettingsState> | null;
      };

      if (payload.settings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...payload.settings,
        });
      }
    } catch (saveError) {
      console.error(saveError);
      setSettings(previous);
      setError("Could not save that setting. Your previous value was restored.");
    } finally {
      setSavingKey(null);
    }
  }

  const isLoading = settings === null;

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
          {error ? (
            <div
              className="rounded-2xl px-4 py-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.24)",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          ) : null}

          <Section icon={Brain} color="#8b5cf6" title="Agent Behavior">
            <ToggleSetting
              id="auto-approve-low-risk"
              label="Auto-approve low-risk actions"
              description="When on, read-only tools (inbox, schedule, free slots, list docs) run without confirmation. When off, every tool pauses for your approval."
              checked={settings.autoApproveLowRisk}
              disabled={savingKey === "autoApproveLowRisk"}
              onChange={() => handleToggle("autoApproveLowRisk")}
            />
            <ToggleSetting
              id="require-approval-all"
              label="Require approval for all write actions"
              description="Pause before creating events, drafting emails, modifying calendars, or creating documents."
              checked={settings.requireApprovalAll}
              disabled={savingKey === "requireApprovalAll"}
              onChange={() => handleToggle("requireApprovalAll")}
            />
          </Section>

          <Section icon={Shield} color="#4285f4" title="Security">
            <ToggleSetting
              id="step-up-auth"
              label="Extra approval for sending email"
              description="Always require explicit in-app approval before send_email runs, even if other write approvals are off."
              checked={settings.stepUpAuth}
              disabled={savingKey === "stepUpAuth"}
              onChange={() => handleToggle("stepUpAuth")}
            />
            <ToggleSetting
              id="audit-log"
              label="Keep action audit log"
              description="Store a history of agent actions in your private Convex database for review on the History page."
              checked={settings.auditLog}
              disabled={savingKey === "auditLog"}
              onChange={() => handleToggle("auditLog")}
            />
          </Section>

          <Section icon={Bell} color="#f59e0b" title="Notifications">
            <ToggleSetting
              id="action-completed"
              label="Play a sound when tasks complete"
              description="Plays a soft chime when the AI agent finishes responding to your request."
              checked={settings.actionNotifications}
              disabled={savingKey === "actionNotifications"}
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
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleSetting({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="block text-sm font-medium"
          style={{ color: "var(--color-text)" }}
        >
          {label}
        </label>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {description}
        </p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className="relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50"
        style={{
          background: checked ? "var(--color-primary)" : "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
          style={{
            left: checked ? "calc(100% - 1.4rem)" : "0.2rem",
          }}
        />
      </button>
    </div>
  );
}
