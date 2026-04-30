"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store/useAppStore";

export function Toolbar() {
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const historyIndex = useAppStore((s) => s.historyIndex);
  const history = useAppStore((s) => s.history);
  const canvasScale = useAppStore((s) => s.canvasScale);
  const setCanvasScale = useAppStore((s) => s.setCanvasScale);
  const setExportDialogOpen = useAppStore((s) => s.setExportDialogOpen);
  const setView = useAppStore((s) => s.setView);
  const layout = useAppStore((s) => s.currentLayout);
  const selectedElementId = useAppStore((s) => s.selectedElementId);
  const removeElement = useAppStore((s) => s.removeElement);
  const bringToFront = useAppStore((s) => s.bringToFront);
  const sendToBack = useAppStore((s) => s.sendToBack);
  const alignElements = useAppStore((s) => s.alignElements);
  const distributeElements = useAppStore((s) => s.distributeElements);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  function addTextElement() {
    if (!layout) return;
    const id = `text-${Date.now()}`;
    useAppStore.getState().addElement({
      id,
      type: "text",
      x: 50,
      y: layout.height / 2 - 20,
      width: layout.width - 100,
      height: 40,
      text: "New Text",
      fontSize: 18,
      fontWeight: 400,
      color: "#000000",
      textAlign: "center",
      zIndex: layout.elements.length,
    });
    useAppStore.getState().selectElement(id);
  }

  function addShapeElement() {
    if (!layout) return;
    const id = `shape-${Date.now()}`;
    useAppStore.getState().addElement({
      id,
      type: "shape",
      x: 100,
      y: layout.height / 2 - 40,
      width: 160,
      height: 80,
      backgroundColor: "#3B82F6",
      borderRadius: 12,
      zIndex: layout.elements.length,
    });
    useAppStore.getState().selectElement(id);
  }

  function addButtonElement() {
    if (!layout) return;
    const id = `button-${Date.now()}`;
    useAppStore.getState().addElement({
      id,
      type: "button",
      x: 40,
      y: layout.height - 120,
      width: layout.width - 80,
      height: 50,
      text: "Get Started",
      fontSize: 16,
      fontWeight: 600,
      color: "#ffffff",
      backgroundColor: "#3B82F6",
      borderRadius: 14,
      zIndex: layout.elements.length,
    });
    useAppStore.getState().selectElement(id);
  }

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 overflow-x-auto">
      {/* Back to chat */}
      <button
        onClick={() => setView("chat")}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Chat
      </button>

      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

      {/* Add elements */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={addTextElement}
          className="px-2 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          title="Add Text"
        >
          <svg className="w-4 h-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5h18M3 12h18M3 19h12" />
          </svg>
          Text
        </button>
        <button
          onClick={addShapeElement}
          className="px-2 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          title="Add Shape"
        >
          <svg className="w-4 h-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          Shape
        </button>
        <button
          onClick={addButtonElement}
          className="px-2 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          title="Add Button"
        >
          <svg className="w-4 h-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 12h12" />
          </svg>
          Button
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 10L4 15L9 20" />
            <path d="M20 4v7a4 4 0 01-4 4H4" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 10L20 15L15 20" />
            <path d="M4 4v7a4 4 0 004 4h12" />
          </svg>
        </button>
      </div>

      {/* Delete selected */}
      {selectedElementId && (
        <>
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          <button
            onClick={() => removeElement(selectedElementId)}
            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors shrink-0"
            title="Delete (Del)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </>
      )}

      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

      {/* Layer ordering */}
      {selectedElementId && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => bringToFront(selectedElementId)}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Bring to Front"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
            </svg>
          </button>
          <button
            onClick={() => sendToBack(selectedElementId)}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Send to Back"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z" />
            </svg>
          </button>
        </div>
      )}

      {selectedElementId && <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />}

      {/* Alignment */}
      {selectedElementId && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => alignElements("left")}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Align Left"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 10H7M17 14H7M5 6v12" />
            </svg>
          </button>
          <button
            onClick={() => alignElements("center")}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Align Center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 10H6M20 6v12M15 14H9M4 6v12" />
            </svg>
          </button>
          <button
            onClick={() => alignElements("right")}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Align Right"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 10h10M7 14h10M19 6v12" />
            </svg>
          </button>
          <button
            onClick={() => alignElements("top")}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Align Top"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 17V7M14 17V7M6 5h12" />
            </svg>
          </button>
          <button
            onClick={() => alignElements("middle")}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Align Middle"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 18V6M14 18V6M4 12h16" />
            </svg>
          </button>
          <button
            onClick={() => alignElements("bottom")}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Align Bottom"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 17V7M14 17V7M6 19h12" />
            </svg>
          </button>
          <button
            onClick={() => distributeElements("x")}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Distribute Horizontally"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 6v12M3 6v12M8 10h8v4H8z" />
            </svg>
          </button>
          <button
            onClick={() => distributeElements("y")}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Distribute Vertically"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 21V3M18 21V3M10 8h4v8h-4z" />
            </svg>
          </button>
        </div>
      )}

      {selectedElementId && <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />}

      <div className="flex-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setCanvasScale(Math.max(0.25, canvasScale - 0.1))}
          className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Zoom Out"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35M8 11h6" />
          </svg>
        </button>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 w-10 text-center tabular-nums">
          {Math.round(canvasScale * 100)}%
        </span>
        <button
          onClick={() => setCanvasScale(Math.min(2, canvasScale + 0.1))}
          className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Zoom In"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

      {/* Theme */}
      <ThemeToggle />

      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

      {/* Export */}
      <button
        onClick={() => setExportDialogOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        Export
      </button>
    </div>
  );
}
