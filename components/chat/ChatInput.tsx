"use client";

import { useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  handleSubmit: () => void | Promise<void>;
  isLoading: boolean;
}

export function ChatInput({
  input,
  onInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    await handleSubmit();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!isLoading && input.trim()) {
        void submit();
      }
    }
  };

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(event.target.value);

    const element = event.target;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  };

  return (
    <div
      className="px-6 py-4 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="relative"
      >
        <div
          className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border-hover)",
          }}
        >
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask LifeOS anything... (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed"
            style={{
              color: "var(--color-text)",
              minHeight: "24px",
              maxHeight: "160px",
            }}
            disabled={isLoading}
          />

          <button
            id="chat-send-btn"
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40"
            style={{
              background:
                input.trim() && !isLoading
                  ? "linear-gradient(135deg, #8b5cf6, #06b6d4)"
                  : "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        <p
          className="text-xs text-center mt-2"
          style={{ color: "var(--color-text-subtle)" }}
        >
          LifeOS may make mistakes. Sensitive actions can require explicit approval.
        </p>
      </form>
    </div>
  );
}
