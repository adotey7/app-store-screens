"use client";

import { create } from "zustand";
import type { LayoutElement, ScreenLayout, ChatMessage, AppView, DeviceType } from "@/types";
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "@/lib/playstore/sizes";

interface AppState {
  // App flow
  view: AppView;
  setView: (view: AppView) => void;

  // Current layout being edited
  currentLayout: ScreenLayout | null;
  setCurrentLayout: (layout: ScreenLayout | null) => void;

  // Chat messages
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  // Loading state
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;

  // Selected element on canvas
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;

  // Device frame
  deviceType: DeviceType;
  setDeviceType: (device: DeviceType) => void;

  // Canvas scale
  canvasScale: number;
  setCanvasScale: (scale: number) => void;

  // Element operations
  updateElement: (id: string, updates: Partial<LayoutElement>) => void;
  addElement: (element: LayoutElement) => void;
  removeElement: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  alignElements: (align: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  distributeElements: (axis: "x" | "y") => void;

  // Undo/redo
  history: ScreenLayout[];
  historyIndex: number;
  pushHistory: (layout: ScreenLayout) => void;
  undo: () => void;
  redo: () => void;

  // Export dialog
  exportDialogOpen: boolean;
  setExportDialogOpen: (open: boolean) => void;

  // Generation history
  generationHistory: { id: string; prompt: string; layout: ScreenLayout; timestamp: number }[];
  addToHistory: (entry: { id: string; prompt: string; layout: ScreenLayout; timestamp: number }) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export const useAppStore = create<AppState>((set, get) => ({
  view: "chat",
  setView: (view) => set({ view }),

  currentLayout: null,
  setCurrentLayout: (layout) => {
    if (layout) {
      get().pushHistory(layout);
    }
    set({ currentLayout: layout });
  },

  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  isGenerating: false,
  setIsGenerating: (loading) => set({ isGenerating: loading }),

  selectedElementId: null,
  selectElement: (id) => set({ selectedElementId: id }),

  deviceType: "phone",
  setDeviceType: (device) => set({ deviceType: device }),

  canvasScale: 1,
  setCanvasScale: (scale) => set({ canvasScale: scale }),

  updateElement: (id, updates) => {
    const layout = get().currentLayout;
    if (!layout) return;
    const newLayout = {
      ...layout,
      elements: layout.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    };
    set({ currentLayout: newLayout });
    get().pushHistory(newLayout);
  },

  addElement: (element) => {
    const layout = get().currentLayout;
    if (!layout) return;
    const newLayout = {
      ...layout,
      elements: [...layout.elements, element],
    };
    set({ currentLayout: newLayout });
    get().pushHistory(newLayout);
  },

  removeElement: (id) => {
    const layout = get().currentLayout;
    if (!layout) return;
    const newLayout = {
      ...layout,
      elements: layout.elements.filter((el) => el.id !== id),
    };
    set({ currentLayout: newLayout, selectedElementId: null });
    get().pushHistory(newLayout);
  },

  bringToFront: (id) => {
    const layout = get().currentLayout;
    if (!layout) return;
    const maxZ = Math.max(...layout.elements.map((el) => el.zIndex ?? 0));
    const newLayout = {
      ...layout,
      elements: layout.elements.map((el) =>
        el.id === id ? { ...el, zIndex: maxZ + 1 } : el
      ),
    };
    set({ currentLayout: newLayout });
    get().pushHistory(newLayout);
  },

  sendToBack: (id) => {
    const layout = get().currentLayout;
    if (!layout) return;
    const minZ = Math.min(...layout.elements.map((el) => el.zIndex ?? 0));
    const newLayout = {
      ...layout,
      elements: layout.elements.map((el) =>
        el.id === id ? { ...el, zIndex: minZ - 1 } : el
      ),
    };
    set({ currentLayout: newLayout });
    get().pushHistory(newLayout);
  },

  alignElements: (align) => {
    const layout = get().currentLayout;
    const selectedId = get().selectedElementId;
    if (!layout || !selectedId) return;

    const selected = layout.elements.find((el) => el.id === selectedId);
    if (!selected) return;

    const newElements = layout.elements.map((el) => {
      if (el.id === selectedId) return el;
      let updates: Partial<LayoutElement> = {};
      switch (align) {
        case "left":
          updates = { x: selected.x };
          break;
        case "center":
          updates = { x: selected.x + (selected.width - el.width) / 2 };
          break;
        case "right":
          updates = { x: selected.x + selected.width - el.width };
          break;
        case "top":
          updates = { y: selected.y };
          break;
        case "middle":
          updates = { y: selected.y + (selected.height - el.height) / 2 };
          break;
        case "bottom":
          updates = { y: selected.y + selected.height - el.height };
          break;
      }
      return { ...el, ...updates };
    });

    const newLayout = { ...layout, elements: newElements };
    set({ currentLayout: newLayout });
    get().pushHistory(newLayout);
  },

  distributeElements: (axis) => {
    const layout = get().currentLayout;
    if (!layout || layout.elements.length < 3) return;

    const sorted = [...layout.elements].sort((a, b) =>
      axis === "x"
        ? (a.x + a.width / 2) - (b.x + b.width / 2)
        : (a.y + a.height / 2) - (b.y + b.height / 2)
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpace =
      axis === "x"
        ? last.x + last.width / 2 - (first.x + first.width / 2)
        : last.y + last.height / 2 - (first.y + first.height / 2);
    const step = totalSpace / (sorted.length - 1);

    const newElements = layout.elements.map((el) => {
      const idx = sorted.findIndex((s) => s.id === el.id);
      if (idx <= 0 || idx >= sorted.length - 1) return el;
      if (axis === "x") {
        const center = first.x + first.width / 2 + step * idx;
        return { ...el, x: center - el.width / 2 };
      } else {
        const center = first.y + first.height / 2 + step * idx;
        return { ...el, y: center - el.height / 2 };
      }
    });

    const newLayout = { ...layout, elements: newElements };
    set({ currentLayout: newLayout });
    get().pushHistory(newLayout);
  },

  history: [],
  historyIndex: -1,
  pushHistory: (layout) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(structuredClone(layout));
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ currentLayout: structuredClone(history[newIndex]), historyIndex: newIndex });
  },
  redo: () => {
    const { history, historyIndex, history: h } = get();
    if (historyIndex >= h.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ currentLayout: structuredClone(h[newIndex]), historyIndex: newIndex });
  },

  exportDialogOpen: false,
  setExportDialogOpen: (open) => set({ exportDialogOpen: open }),

  generationHistory: [],
  addToHistory: (entry) =>
    set((state) => ({
      generationHistory: [entry, ...state.generationHistory].slice(0, 50),
    })),
}));
