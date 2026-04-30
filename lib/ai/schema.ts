import { z } from "zod";

export const layoutElementSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "image", "button", "shape", "icon"]),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string().optional(),
  fontSize: z.number().optional(),
  fontWeight: z.number().optional(),
  fontFamily: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.number().optional(),
  borderWidth: z.number().optional(),
  borderColor: z.string().optional(),
  src: z.string().optional(),
  objectFit: z.enum(["cover", "contain", "fill"]).optional(),
  opacity: z.number().optional(),
  rotation: z.number().optional(),
  zIndex: z.number().optional(),
  placeholder: z.string().optional(),
});

export const screenLayoutSchema = z.object({
  width: z.number().default(360),
  height: z.number().default(640),
  background: z.string(),
  themeName: z.string().optional(),
  elements: z.array(layoutElementSchema),
});
