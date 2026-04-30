"use client";

import { useState, useCallback } from "react";
import JSZip from "jszip";
import { useAppStore } from "@/lib/store/useAppStore";
import { PLAY_STORE_SIZES } from "@/lib/playstore/sizes";
import { captureElementToPng, renderExportCanvas } from "@/lib/layout/export";
import { FRAMES } from "@/components/canvas/DeviceFrame";

function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ExportPanel() {
  const open = useAppStore((s) => s.exportDialogOpen);
  const setOpen = useAppStore((s) => s.setExportDialogOpen);
  const currentLayout = useAppStore((s) => s.currentLayout);
  const deviceType = useAppStore((s) => s.deviceType);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportAll, setExportAll] = useState(false);

  const handleExportSingle = useCallback(
    async (label: string, targetWidth: number, targetHeight: number) => {
      if (!currentLayout) return;

      setExporting(label);

      try {
        const dataUrl = await renderToDataUrl(
          currentLayout,
          deviceType,
          targetWidth,
          targetHeight
        );

        const filename = `${label.toLowerCase().replace(/\s+/g, "-")}-${targetWidth}x${targetHeight}.png`;
        downloadImage(dataUrl, filename);
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setExporting(null);
      }
    },
    [currentLayout, deviceType]
  );

  const handleExportAll = useCallback(async () => {
    if (!currentLayout) return;
    setExportAll(true);

    try {
      const zip = new JSZip();

      for (const size of PLAY_STORE_SIZES) {
        setExporting(size.label);

        const dataUrl = await renderToDataUrl(
          currentLayout,
          deviceType,
          size.width,
          size.height
        );

        const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
        const filename = `${size.label.toLowerCase().replace(/\s+/g, "-")}-${size.width}x${size.height}.png`;
        zip.file(filename, base64, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "play-store-assets.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export all failed:", err);
    } finally {
      setExporting(null);
      setExportAll(false);
    }
  }, [currentLayout, deviceType]);

  if (!open || !currentLayout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Export Play Store Assets
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto">
          {currentLayout && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              {deviceType !== "none"
                ? "Export includes device frame"
                : "Exporting raw screen (no device frame)"}
            </div>
          )}
          {PLAY_STORE_SIZES.map((size) => (
            <div
              key={size.label}
              className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {size.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {size.width} x {size.height}px
                </p>
              </div>
              <button
                onClick={() =>
                  handleExportSingle(size.label, size.width, size.height)
                }
                disabled={exporting !== null}
                className="px-4 py-2 text-xs font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors"
              >
                {exporting === size.label ? "Exporting..." : "Download"}
              </button>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleExportAll}
            disabled={exportAll}
            className="w-full py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {exportAll
              ? "Exporting all..."
              : `Download All as ZIP (${PLAY_STORE_SIZES.length} images)`}
          </button>
        </div>
      </div>
    </div>
  );
}

async function renderToDataUrl(
  layout: { width: number; height: number; background: string },
  deviceType: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  const isFramed = deviceType !== "none";

  // Find the original element in the visible canvas
  const selector = isFramed ? "[data-export-target]" : "[data-layout-root]";
  const original = document.querySelector(selector) as HTMLElement;

  if (!original) throw new Error("Export target not found");

  // Get native dimensions
  let nativeW: number;
  let nativeH: number;

  if (isFramed) {
    const frame = FRAMES[deviceType as keyof typeof FRAMES];
    nativeW = frame.outerWidth;
    nativeH = frame.outerHeight;
  } else {
    nativeW = layout.width;
    nativeH = layout.height;
  }

  // Calculate pixel ratio so the captured image is at least target size
  // This ensures we capture enough resolution for sharp downscaling
  const minPixelRatio = Math.max(
    2,
    Math.ceil(
      Math.max(targetWidth / nativeW, targetHeight / nativeH, 2)
    )
  );

  // Create an offscreen wrapper to isolate the element for capture
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.width = `${nativeW}px`;
  wrapper.style.height = `${nativeH}px`;
  wrapper.style.overflow = "hidden";

  // Clone deeply
  const clone = original.cloneNode(true) as HTMLElement;

  // Remove any scaling transforms from the clone so it renders at native size
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Allow styles to settle
  await new Promise((r) => setTimeout(r, 150));

  // Capture at high pixel ratio
  const sourceDataUrl = await captureElementToPng(wrapper, minPixelRatio);

  // Clean up
  document.body.removeChild(wrapper);

  // Determine background color for the canvas
  const canvasBg = isFramed ? "#ffffff" : layout.background || "#ffffff";

  // Render onto canvas at exact target dimensions with perfect centering
  const finalDataUrl = await renderExportCanvas(
    sourceDataUrl,
    targetWidth,
    targetHeight,
    canvasBg
  );

  return finalDataUrl;
}
