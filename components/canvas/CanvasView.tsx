"use client";

import { Canvas } from "@/components/canvas/Canvas";
import { Toolbar } from "@/components/canvas/Toolbar";
import { PropertyPanel } from "@/components/canvas/PropertyPanel";
import { DeviceFrame } from "@/components/canvas/DeviceFrame";
import { DeviceSelector } from "@/components/canvas/DeviceSelector";
import { ExportPanel } from "@/components/export/ExportPanel";
import { useAppStore } from "@/lib/store/useAppStore";
import { useEffect, useRef } from "react";

export function CanvasView() {
  const layout = useAppStore((s) => s.currentLayout);
  const setCanvasScale = useAppStore((s) => s.setCanvasScale);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      if (!containerRef.current || !layout) return;
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      const scaleW = containerW / layout.width;
      const scaleH = containerH / layout.height;
      setCanvasScale(
        Math.max(
          0.2,
          Math.min(1.5, Math.floor(Math.min(scaleW, scaleH) * 100) / 100)
        )
      );
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [layout, setCanvasScale]);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Canvas area */}
        <div
          ref={containerRef}
          className="flex-1 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 overflow-auto min-w-0"
        >
          <div className="flex flex-col items-center gap-3 p-4">
            <DeviceSelector />
            <DeviceFrame>
              <Canvas />
            </DeviceFrame>
          </div>
        </div>

        <PropertyPanel />
      </div>

      <ExportPanel />
    </div>
  );
}
