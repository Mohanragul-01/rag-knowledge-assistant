// File: src/components/ChatInput.tsx
// Purpose: Question input bar — submits on Enter or button click, disabled while loading
// Step: Step-7 — React UI

import { useState, KeyboardEvent } from "react";


interface Props {
  onSend: (question: string) => void;
  isLoading: boolean;
  disabled: boolean; // true when no PDF has been uploaded yet
}


export default function ChatInput({ onSend, isLoading, disabled }: Props) {
  const [value, setValue] = useState("");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  
  // Submit on Enter, allow Shift+Enter for newlines
  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const placeholder = disabled
    ? "Upload a PDF first…"
    : "Ask a question about your document…";

    
  return (
    <div className="border-t border-cosmic-100 p-4 dark:border-cosmic-900">
      <div className="card flex items-end gap-3 p-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-void-800
                     placeholder-cosmic-300 outline-none
                     dark:text-cosmic-100 dark:placeholder-cosmic-700
                     disabled:cursor-not-allowed"
          style={{ maxHeight: "120px" }}
        />

        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading || disabled}
          className="btn-primary flex h-9 w-9 shrink-0 items-center justify-center
                     rounded-xl p-0 text-base"
          aria-label="Send question"
        >
          {isLoading ? "⏳" : "➤"}
        </button>
      </div>

      {disabled && (
        <p className="mt-2 text-center text-xs text-cosmic-400 dark:text-cosmic-600">
          Upload a PDF above to unlock the chat
        </p>
      )}
    </div>
  );
}
