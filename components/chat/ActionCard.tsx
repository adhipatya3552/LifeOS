"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  CalendarDays,
  FolderOpen,
  CheckCircle,
  Loader2,
  XCircle,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

interface ActionCardProps {
  toolPart: {
    type: `tool-${string}`;
    state?: string;
    output?: unknown;
    input?: unknown;
    errorText?: string;
  };
}

const toolMeta: Record<
  string,
  { label: string; icon: typeof Mail; color: string; bg: string }
> = {
  summarize_inbox: {
    label: "Checking inbox",
    icon: Mail,
    color: "#ea4335",
    bg: "rgba(234,67,53,0.08)",
  },
  search_emails: {
    label: "Searching emails",
    icon: Mail,
    color: "#ea4335",
    bg: "rgba(234,67,53,0.08)",
  },
  draft_reply: {
    label: "Drafting reply",
    icon: Mail,
    color: "#ea4335",
    bg: "rgba(234,67,53,0.08)",
  },
  send_email: {
    label: "Sending email",
    icon: Mail,
    color: "#ea4335",
    bg: "rgba(234,67,53,0.08)",
  },
  get_schedule: {
    label: "Fetching schedule",
    icon: CalendarDays,
    color: "#4285f4",
    bg: "rgba(66,133,244,0.08)",
  },
  create_event: {
    label: "Creating event",
    icon: CalendarDays,
    color: "#4285f4",
    bg: "rgba(66,133,244,0.08)",
  },
  reschedule_event: {
    label: "Rescheduling event",
    icon: CalendarDays,
    color: "#4285f4",
    bg: "rgba(66,133,244,0.08)",
  },
  find_free_slot: {
    label: "Finding free slot",
    icon: CalendarDays,
    color: "#4285f4",
    bg: "rgba(66,133,244,0.08)",
  },
  list_recent_docs: {
    label: "Listing documents",
    icon: FolderOpen,
    color: "#34a853",
    bg: "rgba(52,168,83,0.08)",
  },
  summarize_doc: {
    label: "Reading document",
    icon: FolderOpen,
    color: "#34a853",
    bg: "rgba(52,168,83,0.08)",
  },
  create_doc: {
    label: "Creating document",
    icon: FolderOpen,
    color: "#34a853",
    bg: "rgba(52,168,83,0.08)",
  },
};

function getResultSummary(result: Record<string, unknown> | undefined) {
  if (!result) return "Action completed";
  if (typeof result.message === "string") return result.message;
  if (typeof result.summary === "string") return result.summary;
  if (typeof result.error === "string") return `Error: ${result.error}`;
  return "Action completed successfully";
}

function asObject(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

async function submitApproval(actionId: string, decision: "approve" | "reject") {
  const response = await fetch("/api/agent/action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ actionId, decision }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error || "Failed to update action approval");
  }
}

export function ActionCard({ toolPart }: ActionCardProps) {
  const toolName = toolPart.type.replace("tool-", "");
  const meta = toolMeta[toolName] || {
    label: toolName,
    icon: CheckCircle,
    color: "var(--color-primary)",
    bg: "rgba(139,92,246,0.08)",
  };

  const [errorText, setErrorText] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const output = asObject(toolPart.output);
  const state = toolPart.state || "input-available";
  const isDone = state === "output-available";
  const isError =
    state === "output-error" || output?.success === false || Boolean(toolPart.errorText);
  const actionId =
    typeof output?.actionId === "string" ? output.actionId : undefined;
  const pendingApproval = output?.status === "pending_approval" && actionId;
  const resultSummary = useMemo(
    () =>
      toolPart.errorText
        ? toolPart.errorText
        : getResultSummary(output as Record<string, unknown> | undefined),
    [output, toolPart.errorText]
  );
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 30 }}
      className="ml-11 my-2"
    >
      <div
        className="inline-flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: meta.bg,
          border: `1px solid ${meta.color}30`,
          maxWidth: "480px",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}18` }}
        >
          <Icon className="w-4 h-4" style={{ color: meta.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: meta.color }}>
              {meta.label}
            </span>
            {!isDone ? (
              <Loader2 className="w-3 h-3 animate-spin" style={{ color: meta.color }} />
            ) : null}
            {isDone && !isError ? (
              <CheckCircle
                className="w-3 h-3"
                style={{ color: "var(--color-success)" }}
              />
            ) : null}
            {isDone && isError ? (
              <XCircle
                className="w-3 h-3"
                style={{ color: "var(--color-danger)" }}
              />
            ) : null}
          </div>
          {resultSummary ? (
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: "var(--color-text-muted)" }}
            >
              {resultSummary}
            </p>
          ) : null}
          {pendingApproval ? (
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    setErrorText(null);
                    try {
                      await submitApproval(actionId, "approve");
                    } catch (error) {
                      setErrorText(
                        error instanceof Error ? error.message : "Approval failed"
                      );
                    }
                  })
                }
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium"
                style={{
                  background: "rgba(16,185,129,0.14)",
                  color: "var(--color-success)",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                <ShieldCheck className="w-3 h-3" />
                Approve
              </button>
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    setErrorText(null);
                    try {
                      await submitApproval(actionId, "reject");
                    } catch (error) {
                      setErrorText(
                        error instanceof Error ? error.message : "Rejection failed"
                      );
                    }
                  })
                }
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  color: "var(--color-danger)",
                  border: "1px solid rgba(239,68,68,0.24)",
                }}
              >
                <ShieldX className="w-3 h-3" />
                Reject
              </button>
            </div>
          ) : null}
          {errorText ? (
            <p className="text-xs mt-2" style={{ color: "var(--color-danger)" }}>
              {errorText}
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
