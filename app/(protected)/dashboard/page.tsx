"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertTriangle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ActionCard } from "@/components/chat/ActionCard";
import { ChatInput } from "@/components/chat/ChatInput";
import { useCurrentUserRecord } from "@/lib/use-current-user";
import { playCompletionChime } from "@/lib/notification-sound";

export default function DashboardPage() {
  const [requireApproval, setRequireApproval] = useState(false);
  const [input, setInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef<string>("ready");

  // Read the user's notification preference from Convex
  const currentUser = useCurrentUserRecord();
  const settings = useQuery(
    api.userSettings.getSettings,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const notificationsEnabled = settings?.actionNotifications ?? true;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error) => {
      setChatError(error.message || "LifeOS could not complete that request.");
    },
  });

  // Play the completion chime when streaming finishes
  useEffect(() => {
    const wasStreaming = prevStatusRef.current === "streaming" || prevStatusRef.current === "submitted";
    const isNowReady = status === "ready";
    if (wasStreaming && isNowReady && notificationsEnabled && messages.length > 0) {
      playCompletionChime();
    }
    prevStatusRef.current = status;
  }, [status, notificationsEnabled, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoading = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  const handleSubmit = async () => {
    const text = input.trim();

    if (!text || isLoading) {
      return;
    }

    setChatError(null);
    await sendMessage(
      { text },
      {
        body: { requireApproval },
      }
    );
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="page-header flex items-center justify-between px-6 py-4"
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
            AI Dashboard
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Chat with your personal life agent
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              id="require-approval-toggle"
              className="sr-only"
              checked={requireApproval}
              onChange={(event) => setRequireApproval(event.target.checked)}
            />
            <div
              className="w-11 h-6 rounded-full transition-all duration-300"
              style={{
                background: requireApproval
                  ? "var(--color-warning)"
                  : "var(--color-surface-2)",
                border: `1px solid ${requireApproval ? "var(--color-warning)" : "var(--color-border)"}`,
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                style={{
                  left: requireApproval ? "22px" : "2px",
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle
              className="w-4 h-4"
              style={{
                color: requireApproval
                  ? "var(--color-warning)"
                  : "var(--color-text-subtle)",
              }}
            />
            <span
              className="text-sm font-medium"
              style={{
                color: requireApproval
                  ? "var(--color-warning)"
                  : "var(--color-text-muted)",
              }}
            >
              Approve before acting
            </span>
          </div>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
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

        <AnimatePresence>
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-24"
            >
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 glow-primary animate-float">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2
                className="text-2xl font-bold mb-3"
                style={{ color: "var(--color-text)" }}
              >
                Hello! I&apos;m your LifeOS agent.
              </h2>
              <p
                className="text-base max-w-md"
                style={{ color: "var(--color-text-muted)" }}
              >
                Ask me to check your emails, manage your calendar, or work with
                your Drive documents. I&apos;ll handle it autonomously and
                securely.
              </p>

              <div className="flex flex-wrap gap-2 mt-8 justify-center">
                {[
                  "Summarize my inbox",
                  "What's on my calendar today?",
                  "List my recent Drive docs",
                  "Find a free slot tomorrow afternoon",
                ].map((suggestion) => (
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
