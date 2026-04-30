"use client";

import { useState, useRef, useEffect } from "react";

interface ChatComposerProps {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
  placeholder?: string;
}

export function ChatComposer({ onSubmit, isGenerating, placeholder }: ChatComposerProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [prompt]);

  function handleSubmit() {
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) return;
    onSubmit(trimmed);
    setPrompt("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-4">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Describe your app concept...\ne.g. A meditation app with a calm sunset background, a circular breathing timer, and a 'Begin Session' button"}
          rows={2}
          className="w-full resize-none bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none min-h-[56px] max-h-[200px]"
          disabled={isGenerating}
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-400">
            Press Enter to send, Shift+Enter for new line
          </span>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white dark:border-zinc-600/30 dark:border-t-zinc-900 rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
