// File: src/components/ChatWindow.tsx
// Purpose: Scrollable list of Message bubbles — auto-scrolls to newest message
// Step: Step-7 — React UI

import { useEffect, useRef } from "react";
import type { Message as MsgType } from "../types";
import Message from "./Message";

interface Props {
  messages: MsgType[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="cosmic-scroll flex-1 overflow-y-auto px-4 py-6">
      {messages.length === 0 && (
        // Empty state — shown before any message is sent
        <div className="flex h-full flex-col items-center justify-center gap-3 opacity-50">
          <div className="text-4xl">🔭</div>
          <p className="font-display text-lg text-cosmic-400 dark:text-cosmic-600">
            Upload a PDF and ask anything
          </p>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {/* Typing indicator while waiting for Groq response */}
        {isLoading && (
          <div className="flex justify-start animate-fade-up">
            <div className="card rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-cosmic-400 dark:bg-cosmic-500"
                    style={{
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Invisible anchor element we scroll into view */}
      <div ref={bottomRef} />
    </div>
  );
}
