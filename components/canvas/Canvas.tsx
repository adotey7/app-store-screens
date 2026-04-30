"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ScreenRenderer } from "@/components/layout/ScreenRenderer";
import { useAppStore } from "@/lib/store/useAppStore";
import type { LayoutElement } from "@/types";

type HandlePos =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "rotate";

interface DragState {
  startX: number;
  startY: number;
  elX: number;
  elY: number;
}

interface ResizeState {
  handle: HandlePos;
  startX: number;
  startY: number;
  startEl: LayoutElement;
}

interface RotateState {
  startAngle: number;
  startRotation: number;
  cx: number;
  cy: number;
}

const HANDLE_SIZE = 8;

function getHandleCursor(pos: HandlePos): string {
  switch (pos) {
    case "nw":
    case "se":
      return "nwse-resize";
    case "ne":
    case "sw":
      return "nesw-resize";
    case "n":
    case "s":
      return "ns-resize";
    case "e":
    case "w":
      return "ew-resize";
    case "rotate":
      return "grab";
  }
}

function SelectionOverlay({
  el,
  scale,
  onResizeStart,
  onRotateStart,
}: {
  el: LayoutElement;
  scale: number;
  onResizeStart: (pos: HandlePos, e: React.PointerEvent) => void;
  onRotateStart: (e: React.PointerEvent) => void;
}) {
  const invScale = Math.max(1 / scale, 1);
  const handleOffset = (HANDLE_SIZE * invScale) / 2;

  const handlePositions: { pos: HandlePos; left: number | string; top: number | string }[] = [
    { pos: "nw", left: -handleOffset, top: -handleOffset },
    { pos: "n", left: "50%", top: -handleOffset },
    { pos: "ne", left: `calc(100% + ${handleOffset}px)`, top: -handleOffset },
    { pos: "e", left: `calc(100% + ${handleOffset}px)`, top: "50%" },
    { pos: "se", left: `calc(100% + ${handleOffset}px)`, top: `calc(100% + ${handleOffset}px)` },
    { pos: "s", left: "50%", top: `calc(100% + ${handleOffset}px)` },
    { pos: "sw", left: -handleOffset, top: `calc(100% + ${handleOffset}px)` },
    { pos: "w", left: -handleOffset, top: "50%" },
  ];

  const baseTransform = el.rotation ? `rotate(${el.rotation}deg)` : undefined;

  return (
    <div
      style={{
        position: "absolute",
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        transform: baseTransform,
        transformOrigin: "center center",
        pointerEvents: "none",
        zIndex: (el.zIndex ?? 0) + 1,
      }}
    >
      {/* Selection border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: "1.5px dashed #3B82F6",
          borderRadius: Math.min(el.borderRadius ?? 0, 4),
        }}
      />

      {/* Rotation handle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: -24 * invScale,
          width: HANDLE_SIZE * invScale,
          height: HANDLE_SIZE * invScale,
          marginLeft: -(HANDLE_SIZE * invScale) / 2,
          backgroundColor: "white",
          border: "1.5px solid #3B82F6",
          borderRadius: "50%",
          pointerEvents: "auto",
          cursor: "grab",
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onRotateStart(e);
        }}
      />
      {/* Rotation connector line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: -(HANDLE_SIZE * invScale) / 2 - 2,
          width: 1,
          height: 20 * invScale,
          backgroundColor: "#3B82F6",
          marginLeft: -0.5,
        }}
      />

      {/* Resize handles */}
      {handlePositions.map(({ pos, left, top }) => (
        <div
          key={pos}
          style={{
            position: "absolute",
            left,
            top,
            width: HANDLE_SIZE * invScale,
            height: HANDLE_SIZE * invScale,
            marginLeft: typeof left === "string" && left.includes("%") ? -(HANDLE_SIZE * invScale) / 2 : undefined,
            marginTop: typeof top === "string" && top.includes("%") ? -(HANDLE_SIZE * invScale) / 2 : undefined,
            backgroundColor: "white",
            border: "1.5px solid #3B82F6",
            borderRadius: pos === "rotate" ? "50%" : 2,
            pointerEvents: "auto",
            cursor: getHandleCursor(pos),
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(pos, e);
          }}
        />
      ))}
    </div>
  );
}

export function Canvas() {
  const layout = useAppStore((s) => s.currentLayout);
  const selectedElementId = useAppStore((s) => s.selectedElementId);
  const updateElement = useAppStore((s) => s.updateElement);
  const canvasScale = useAppStore((s) => s.canvasScale);
  const selectElement = useAppStore((s) => s.selectElement);
  const removeElement = useAppStore((s) => s.removeElement);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [rotateState, setRotateState] = useState<RotateState | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard nudging + shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedElementId || !layout) return;

      // Delete / Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        removeElement(selectedElementId);
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          useAppStore.getState().redo();
        } else {
          useAppStore.getState().undo();
        }
        return;
      }

      // Arrow nudge
      const step = e.shiftKey ? 10 : 1;
      const el = layout.elements.find((x) => x.id === selectedElementId);
      if (!el) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          updateElement(selectedElementId, { y: el.y - step });
          break;
        case "ArrowDown":
          e.preventDefault();
          updateElement(selectedElementId, { y: el.y + step });
          break;
        case "ArrowLeft":
          e.preventDefault();
          updateElement(selectedElementId, { x: el.x - step });
          break;
        case "ArrowRight":
          e.preventDefault();
          updateElement(selectedElementId, { x: el.x + step });
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, layout, updateElement, removeElement]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      const elementId = target.closest("[data-el-id]")?.getAttribute("data-el-id");
      if (!elementId || !layout) {
        selectElement(null);
        return;
      }

      e.stopPropagation();

      const el = layout.elements.find((x) => x.id === elementId);
      if (!el) return;

      selectElement(elementId);
      setDragState({
        startX: e.clientX,
        startY: e.clientY,
        elX: el.x,
        elY: el.y,
      });

      const handleMove = (ev: PointerEvent) => {
        setDragState((prev) => {
          if (!prev) return null;
          const dx = (ev.clientX - prev.startX) / canvasScale;
          const dy = (ev.clientY - prev.startY) / canvasScale;
          updateElement(elementId, {
            x: Math.round(prev.elX + dx),
            y: Math.round(prev.elY + dy),
          });
          return prev;
        });
      };

      const handleUp = () => {
        setDragState(null);
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [layout, canvasScale, updateElement, selectElement]
  );

  const handleResizeStart = useCallback(
    (pos: HandlePos, e: React.PointerEvent) => {
      if (!selectedElementId || !layout) return;
      const el = layout.elements.find((x) => x.id === selectedElementId);
      if (!el) return;

      setResizeState({
        handle: pos,
        startX: e.clientX,
        startY: e.clientY,
        startEl: { ...el },
      });

      const handleMove = (ev: PointerEvent) => {
        setResizeState((prev) => {
          if (!prev) return null;
          const dxRaw = (ev.clientX - prev.startX) / canvasScale;
          const dyRaw = (ev.clientY - prev.startY) / canvasScale;

          let { x, y, width, height } = prev.startEl;
          const MIN = 10;

          // If rotated, just resize the bounding box (simplified)
          switch (prev.handle) {
            case "e":
              width = Math.max(MIN, prev.startEl.width + dxRaw);
              break;
            case "w":
              width = Math.max(MIN, prev.startEl.width - dxRaw);
              x = prev.startEl.x + (prev.startEl.width - width);
              break;
            case "s":
              height = Math.max(MIN, prev.startEl.height + dyRaw);
              break;
            case "n":
              height = Math.max(MIN, prev.startEl.height - dyRaw);
              y = prev.startEl.y + (prev.startEl.height - height);
              break;
            case "se":
              width = Math.max(MIN, prev.startEl.width + dxRaw);
              height = Math.max(MIN, prev.startEl.height + dyRaw);
              break;
            case "sw":
              width = Math.max(MIN, prev.startEl.width - dxRaw);
              x = prev.startEl.x + (prev.startEl.width - width);
              height = Math.max(MIN, prev.startEl.height + dyRaw);
              break;
            case "ne":
              width = Math.max(MIN, prev.startEl.width + dxRaw);
              height = Math.max(MIN, prev.startEl.height - dyRaw);
              y = prev.startEl.y + (prev.startEl.height - height);
              break;
            case "nw":
              width = Math.max(MIN, prev.startEl.width - dxRaw);
              x = prev.startEl.x + (prev.startEl.width - width);
              height = Math.max(MIN, prev.startEl.height - dyRaw);
              y = prev.startEl.y + (prev.startEl.height - height);
              break;
          }

          updateElement(selectedElementId, { x, y, width, height });
          return prev;
        });
      };

      const handleUp = () => {
        setResizeState(null);
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [selectedElementId, layout, canvasScale, updateElement]
  );

  const handleRotateStart = useCallback(
    (e: React.PointerEvent) => {
      if (!selectedElementId || !layout) return;
      const el = layout.elements.find((x) => x.id === selectedElementId);
      if (!el) return;

      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      const startAngle = Math.atan2(
        (e.clientY - containerRef.current!.getBoundingClientRect().top) / canvasScale - cy,
        (e.clientX - containerRef.current!.getBoundingClientRect().left) / canvasScale - cx
      );

      setRotateState({
        startAngle,
        startRotation: el.rotation ?? 0,
        cx,
        cy,
      });

      const handleMove = (ev: PointerEvent) => {
        setRotateState((prev) => {
          if (!prev) return null;
          const rect = containerRef.current!.getBoundingClientRect();
          const curAngle = Math.atan2(
            (ev.clientY - rect.top) / canvasScale - prev.cy,
            (ev.clientX - rect.left) / canvasScale - prev.cx
          );
          const delta = ((curAngle - prev.startAngle) * 180) / Math.PI;
          const newRotation = Math.round((prev.startRotation + delta) % 360);
          updateElement(selectedElementId, { rotation: newRotation });
          return prev;
        });
      };

      const handleUp = () => {
        setRotateState(null);
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [selectedElementId, layout, canvasScale, updateElement]
  );

  if (!layout) return null;

  const selectedEl = selectedElementId
    ? layout.elements.find((e) => e.id === selectedElementId) ?? null
    : null;

  const isInteracting = dragState !== null || resizeState !== null || rotateState !== null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full select-none relative"
      tabIndex={0}
      style={{ outline: "none" }}
    >
      <div
        style={{
          transform: `scale(${canvasScale})`,
          transformOrigin: "top left",
          cursor: dragState ? "grabbing" : isInteracting ? "default" : "default",
          width: layout.width,
          height: layout.height,
        }}
        onPointerDown={handlePointerDown}
      >
        <div data-layout-root style={{ position: "relative", width: layout.width, height: layout.height }}>
          <ScreenRenderer layout={layout} interactive />
          {selectedEl && (
            <SelectionOverlay
              el={selectedEl}
              scale={canvasScale}
              onResizeStart={handleResizeStart}
              onRotateStart={handleRotateStart}
            />
          )}
        </div>
      </div>
    </div>
  );
}
