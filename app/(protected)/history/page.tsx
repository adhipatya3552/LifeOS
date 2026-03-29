"use client";

import { useState, useTransition } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Mail,
  CalendarDays,
  FolderOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useCurrentUserRecord } from "@/lib/use-current-user";

const serviceIcons = {
  gmail: { icon: Mail, color: "#ea4335" },
  calendar: { icon: CalendarDays, color: "#4285f4" },
  drive: { icon: FolderOpen, color: "#34a853" },
} as const;

const statusConfig = {
  success: { icon: CheckCircle, label: "Success", color: "var(--color-success)" },
  failed: { icon: XCircle, label: "Failed", color: "var(--color-danger)" },
  pending_approval: {
    icon: AlertCircle,
    label: "Pending Approval",
    color: "var(--color-warning)",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "var(--color-text-subtle)" },
  approved: {
    icon: CheckCircle,
    label: "Approved",
    color: "var(--color-success)",
  },
} as const;

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default function HistoryPage() {
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const currentUser = useCurrentUserRecord();
  const actions =
    useQuery(
      api.agentActions.listActions,
      currentUser ? { userId: currentUser._id } : "skip"
    ) || [];

  return (
    <div className="flex h-full min-w-0 flex-col overflow-y-auto overflow-x-clip">
      <div
        className="border-b glass px-4 py-6 sm:px-8"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Action History
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Complete audit log of everything your AI agent has done on your behalf.
        </p>
      </div>

      <div className="space-y-3 px-4 py-6 sm:px-8">
        {actions.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-sm"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            No agent actions have been logged yet.
          </div>
        ) : null}

        {actions.map((action, index) => {
          const service = serviceIcons[action.service as keyof typeof serviceIcons];
          const status = statusConfig[action.status as keyof typeof statusConfig];
          const StatusIcon = status?.icon || Clock;

          return (
            <motion.div
              key={action._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className="flex flex-col gap-4 rounded-xl px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 sm:px-5 lg:flex-row lg:items-center"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: `${service.color}15`,
                    border: `1px solid ${service.color}25`,
                  }}
                >
                  <service.icon className="w-5 h-5" style={{ color: service.color }} />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {action.description}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-subtle)" }}>
                    {formatTime(action.createdAt)} - {action.actionType.replace(/_/g, " ")}
                  </p>
                </div>

                <div
                  className="flex flex-shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs lg:self-auto"
                  style={{
                    background: `${status?.color || "var(--color-text-subtle)"}15`,
                    border: `1px solid ${status?.color || "var(--color-text-subtle)"}30`,
                    color: status?.color || "var(--color-text-subtle)",
                  }}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{status?.label || action.status}</span>
                </div>

                {action.status === "pending_approval" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          setErrorText(null);
                          const response = await fetch("/api/agent/action", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              actionId: action._id,
                              decision: "approve",
                            }),
                          });
                          if (!response.ok) {
                            const payload = (await response.json().catch(() => null)) as
                              | { error?: string }
                              | null;
                            setErrorText(payload?.error || "Failed to approve action");
                          }
                        })
                      }
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: "rgba(16,185,129,0.14)",
                        color: "var(--color-success)",
                        border: "1px solid rgba(16,185,129,0.24)",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          setErrorText(null);
                          const response = await fetch("/api/agent/action", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              actionId: action._id,
                              decision: "reject",
                            }),
                          });
                          if (!response.ok) {
                            const payload = (await response.json().catch(() => null)) as
                              | { error?: string }
                              | null;
                            setErrorText(payload?.error || "Failed to reject action");
                          }
                        })
                      }
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: "rgba(239,68,68,0.12)",
                        color: "var(--color-danger)",
                        border: "1px solid rgba(239,68,68,0.24)",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          );
        })}

        {errorText ? (
          <p className="text-sm" style={{ color: "var(--color-danger)" }}>
            {errorText}
          </p>
        ) : null}
      </div>
    </div>
  );
}
