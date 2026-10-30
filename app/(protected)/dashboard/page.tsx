"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CalendarDays,
  FolderOpen,
  Loader2,
  Mail,
  Plus,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ActionCard } from "@/components/chat/ActionCard";
import { ChatInput } from "@/components/chat/ChatInput";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { useCurrentUserRecord } from "@/lib/use-current-user";
import { playCompletionChime } from "@/lib/notification-sound";
import {
  getConnectedServiceIds,
} from "@/lib/google-service-registry";
import { normalizeServiceConnections } from "@/lib/google-service-flow";
import { useConvexEnabled } from "@/app/ConvexClientProvider";

const STARTER_PROMPTS = [
  "Summarize my inbox",
  "What's on my calendar today?",
  "List my recent Drive docs",
  "Find a free slot tomorrow afternoon",
];

export default function DashboardPage() {
  const [input, setInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isStartingNew, setIsStartingNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef<string>("ready");
  const promptPrefillDone = useRef(false);
  const historyRequestId = useRef(0);
  const searchParams = useSearchParams();

  const convexEnabled = useConvexEnabled();
  const {
    auth0Id,
    connectedServices: bootstrappedServices,
    serviceConnections: bootstrappedConnections,
  } = useAppSession();

  const liveConnections = useQuery(
    api.serviceConnections.listByAuth0Id,
    convexEnabled ? { auth0Id } : "skip"
  );

  const serviceConnections = normalizeServiceConnections(
    liveConnections || bootstrappedConnections || []
  );
  const connectedServices =
    getConnectedServiceIds(serviceConnections).length > 0
      ? getConnectedServiceIds(serviceConnections)
      : bootstrappedServices;

  const currentUser = useCurrentUserRecord();
  const settings = useQuery(
    api.userSettings.getSettings,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const notificationsEnabled = settings?.actionNotifications ?? true;

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error) => {
      setChatError(error.message || "LifeOS could not complete that request.");
    },
  });

  const setMessagesRef = useRef(setMessages);
  useEffect(() => {
    setMessagesRef.current = setMessages;
  }, [setMessages]);

  // Prefill from /dashboard?prompt=... or /prompts deep links
  useEffect(() => {
    if (promptPrefillDone.current) return;
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setInput(prompt);
      promptPrefillDone.current = true;
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const requestId = historyRequestId.current;

    (async () => {
      try {
        const response = await fetch("/api/chat/history");
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as {
          messages?: UIMessage[];
        };
        if (
          !cancelled &&
          requestId === historyRequestId.current &&
          payload.messages &&
          payload.messages.length > 0
        ) {
          setMessagesRef.current(payload.messages);
        }
      } catch (error) {
        console.error("Failed to load chat history", error);
      } finally {
        if (!cancelled && requestId === historyRequestId.current) {
          setHistoryLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const wasStreaming =
      prevStatusRef.current === "streaming" ||
      prevStatusRef.current === "submitted";
    const isNowReady = status === "ready";
    if (
      wasStreaming &&
      isNowReady &&
      notificationsEnabled &&
      messages.length > 0
    ) {
      playCompletionChime();
    }
    prevStatusRef.current = status;
  }, [status, notificationsEnabled, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoading = status === "submitted" || status === "streaming";
  const isEmpty = !historyLoading && messages.length === 0;

  const handleSubmit = async () => {
    const text = input.trim();

    if (!text || isLoading) {
      return;
    }

    setChatError(null);
    await sendMessage({ text });
    setInput("");
  };

  const handleNewConversation = async () => {
    if (isStartingNew) {
      return;
    }

    setChatError(null);
    setIsStartingNew(true);

    try {
      const response = await fetch("/api/chat/conversation", {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          payload?.error || "Could not start a new conversation."
        );
      }

      if (isLoading) {
        stop();
      }

      historyRequestId.current += 1;
      setMessages([]);
      setInput("");
      setHistoryLoading(false);
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Could not start a new conversation."
      );
    } finally {
      setIsStartingNew(false);
    }
  };

  const systems = [
    {
      id: "gmail" as const,
      label: "Gmail",
      icon: Mail,
      color: "#ea4335",
      online: connectedServices.includes("gmail"),
    },
    {
      id: "calendar" as const,
      label: "Calendar",
      icon: CalendarDays,
      color: "#4285f4",
      online: connectedServices.includes("calendar"),
    },
    {
      id: "drive" as const,
      label: "Drive",
      icon: FolderOpen,
      color: "#34a853",
      online: connectedServices.includes("drive"),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="page-header flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
            AI Dashboard
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Chat with your personal life agent
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleNewConversation()}
          disabled={isStartingNew || historyLoading}
          aria-label="Start a new conversation"
          className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
          style={{
            background: "rgba(124,92,255,0.12)",
            border: "1px solid var(--color-border-hover)",
            color: "var(--color-primary-light)",
          }}
        >
          {isStartingNew ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <OnboardingChecklist
          connectedServices={connectedServices}
          hasMessages={messages.length > 0}
          onPickPrompt={setInput}
        />

        {chatError ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.24)",
              color: "var(--color-danger)",
            }}
          >
            {chatError}
          </motion.div>
        ) : null}

        {historyLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: "var(--color-primary)" }}
            />
          </div>
        ) : (
          <AnimatePresence>
            {isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-16"
              >
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 glow-primary animate-float">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2
                  className="font-display text-2xl font-bold mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  Systems status
                </h2>
                <p
                  className="text-base max-w-md mb-6"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Hello! I&apos;m your LifeOS agent. Connect services, then ask me
                  to manage mail, calendar, or docs.
                </p>

                <div className="mb-8 flex flex-wrap justify-center gap-2">
                  {systems.map((system) => (
                    <div
                      key={system.id}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: system.online
                          ? `${system.color}18`
                          : "var(--color-surface-2)",
                        border: system.online
                          ? `1px solid ${system.color}40`
                          : "1px solid var(--color-border)",
                        color: system.online
                          ? system.color
                          : "var(--color-text-subtle)",
                      }}
                    >
                      <system.icon className="h-3.5 w-3.5" />
                      {system.label}
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: system.online
                            ? "var(--color-accent)"
                            : "var(--color-text-subtle)",
                        }}
                      />
                      {system.online ? "Online" : "Offline"}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  <button
                    onClick={() =>
                      sendMessage({
                        text: "Give me my daily briefing: summarize my important unread Gmail messages, list today's Google Calendar commitments, identify conflicts and priorities, and propose a prioritised plan. If a calendar action is needed, propose it for my approval before executing.",
                      })
                    }
                    disabled={isLoading}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    style={{
                      background: "var(--color-accent)",
                      color: "#fff",
                      border: "1px solid var(--color-accent)",
                    }}
                  >
                    Daily Personal Briefing
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {STARTER_PROMPTS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border-hover)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageBubble message={message} />
                  {message.parts
                    .filter((part) => part.type.startsWith("tool-"))
                    .map((part, index) => (
                      <ActionCard
                        key={`${message.id}-tool-${index}`}
                        toolPart={part as {
                          type: `tool-${string}`;
                          state?: string;
                          output?: unknown;
                          input?: unknown;
                          errorText?: string;
                        }}
                      />
                    ))}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-1"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </motion.div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        input={input}
        onInputChange={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
