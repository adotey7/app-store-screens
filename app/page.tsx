"use client";

import { ChatView } from "@/components/chat/ChatView";
import { CanvasView } from "@/components/canvas/CanvasView";
import { useAppStore } from "@/lib/store/useAppStore";

export default function Home() {
  const view = useAppStore((s) => s.view);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-black">
      {view === "chat" ? <ChatView /> : <CanvasView />}
    </div>
  );
}
