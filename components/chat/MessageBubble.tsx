"use client";

import { Brain, User } from "lucide-react";
import type { UIMessage } from "ai";

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const content = message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  if (!content) {
    return null;
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex items-end gap-2 max-w-[75%]">
          <div
            className="px-5 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "var(--color-text)",
            }}
          >
            {content}
          </div>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <User
              className="w-3.5 h-3.5"
              style={{ color: "var(--color-text-muted)" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <div
        className="px-5 py-4 rounded-2xl rounded-tl-sm text-sm prose-ai"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}
