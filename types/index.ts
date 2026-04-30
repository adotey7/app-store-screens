export type ElementType = "text" | "image" | "button" | "shape" | "icon";

export interface LayoutElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  src?: string;
  objectFit?: "cover" | "contain" | "fill";
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  placeholder?: string;
}

export interface ScreenLayout {
  width: number;
  height: number;
  background: string;
  scaleFactor?: number;
  themeName?: string;
  elements: LayoutElement[];
}

export type DeviceType = "phone" | "tablet7" | "tablet10" | "none";

export interface ExportSize {
  label: string;
  width: number;
  height: number;
  deviceType: DeviceType;
}

export type AppView = "chat" | "canvas";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  layout?: ScreenLayout;
}

export interface GenerationHistory {
  id: string;
  prompt: string;
  layout: ScreenLayout;
  timestamp: number;
}
