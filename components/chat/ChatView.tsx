"use client";

import { useState, useCallback } from "react";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store/useAppStore";

export function ChatView() {
  const addMessage = useAppStore((s) => s.addMessage);
  const messages = useAppStore((s) => s.messages);
  const isGenerating = useAppStore((s) => s.isGenerating);
  const setIsGenerating = useAppStore((s) => s.setIsGenerating);
  const setCurrentLayout = useAppStore((s) => s.setCurrentLayout);
  const setView = useAppStore((s) => s.setView);
  const generationHistory = useAppStore((s) => s.generationHistory);

  const handleSubmit = useCallback(
    async (prompt: string) => {
      const userMsg = { id: `user-${Date.now()}`, role: "user" as const, content: prompt };
      addMessage(userMsg);
      setIsGenerating(true);

      try {
        const previousMessages = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, previousMessages }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Generation failed");
        }

        const layout = await res.json();

        const assistantMsg = {
          id: `assistant-${Date.now()}`,
          role: "assistant" as const,
          content: `Generated a ${layout.themeName || "modern"} layout — ${layout.elements.length} elements ready for editing.`,
          layout,
        };

        addMessage(assistantMsg);
        setCurrentLayout(layout);
        setView("canvas");
      } catch (err) {
        const errorMsg = {
          id: `error-${Date.now()}`,
          role: "assistant" as const,
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}. Make sure your OPENAI_API_KEY is set in .env.local.`,
        };
        addMessage(errorMsg);
      } finally {
        setIsGenerating(false);
      }
    },
    [messages, addMessage, setIsGenerating, setCurrentLayout, setView]
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo / Title */}
      <div className="text-center space-y-2 relative">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          App Store Screens
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
          Describe your app concept and AI will generate beautiful Play Store screenshots you can tweak and export.
        </p>
      </div>

      {/* Chat panel */}
      <ChatPanel />

      {/* Composer */}
      <div className="w-full sticky bottom-6">
        <ChatComposer onSubmit={handleSubmit} isGenerating={isGenerating} />
      </div>

      {/* Example prompts */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
          {[
            "A meditation app with calming colors, breathing circle, and nature backgrounds",
            "A fitness tracker with dark theme, heart rate graph, step counter, and neon accents",
            "A recipe app with warm colors, food photos, ingredient lists, and cooking timers",
            "A finance app with minimal design, charts, balance overview, and card-style transactions",
          ].map((example) => (
            <button
              key={example}
              onClick={() => handleSubmit(example)}
              disabled={isGenerating}
              className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors disabled:opacity-50"
            >
              {example.length > 60 ? example.slice(0, 60) + "..." : example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
