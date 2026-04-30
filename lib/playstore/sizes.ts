import type { ExportSize } from "@/types";

export const PLAY_STORE_SIZES: ExportSize[] = [
  { label: "Feature Graphic", width: 1024, height: 500, deviceType: "none" },
  { label: "Phone Screenshot", width: 1080, height: 1920, deviceType: "phone" },
  { label: "7-inch Tablet", width: 1280, height: 800, deviceType: "tablet7" },
  { label: "10-inch Tablet", width: 2560, height: 1800, deviceType: "tablet10" },
];

export const DEFAULT_CANVAS_WIDTH = 360;
export const DEFAULT_CANVAS_HEIGHT = 640;
