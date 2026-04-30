import type { ScreenLayout } from "@/types";

export async function captureElementToPng(
  element: HTMLElement,
  pixelRatio?: number
): Promise<string> {
  const { toPng } = await import("dom-to-image-more");
  const ratio = pixelRatio || 3;
  return toPng(element, {
    quality: 1,
    pixelRatio: ratio,
    cacheBust: true,
  });
}

export async function captureElementToBlob(
  element: HTMLElement,
  pixelRatio?: number
): Promise<Blob> {
  const { toBlob } = await import("dom-to-image-more");
  const ratio = pixelRatio || 3;
  return toBlob(element, {
    quality: 1,
    pixelRatio: ratio,
    cacheBust: true,
  });
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function renderExportCanvas(
  sourceDataUrl: string,
  targetWidth: number,
  targetHeight: number,
  backgroundColor: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Scale image to fit while maintaining aspect ratio (letterbox)
      const scale = Math.min(
        targetWidth / img.width,
        targetHeight / img.height
      );
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = (targetWidth - drawW) / 2;
      const offsetY = (targetHeight - drawH) / 2;

      // High-quality downscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      resolve(canvas.toDataURL("image/png", 1.0));
    };
    img.onerror = () => reject(new Error("Failed to load captured image"));
    img.src = sourceDataUrl;
  });
}

export function getExportDimensions(
  layout: ScreenLayout,
  targetWidth: number,
  targetHeight: number
): { scale: number; offsetX: number; offsetY: number } {
  const scaleX = targetWidth / layout.width;
  const scaleY = targetHeight / layout.height;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (targetWidth - layout.width * scale) / 2;
  const offsetY = (targetHeight - layout.height * scale) / 2;

  return { scale, offsetX, offsetY };
}
