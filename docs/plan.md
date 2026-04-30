# App Store Screens Generator — Plan

## Overview

A web app where you type an app concept into a chat composer, AI generates app store screen designs, and you can tweak them on an interactive canvas before exporting as Play Store-sized images.

---

## Core Flow

```
Chat Composer (landing) → AI generates layout JSON → Rendered as interactive preview
                                                            ↓
                                                    Canvas editor (tweak text, colors, positions)
                                                            ↓
                                                    Export as Play Store-sized PNGs
```

---

## AI Provider: OpenAI GPT-4o

| Reason               | Detail                                                |
| -------------------- | ----------------------------------------------------- |
| Structured output    | Reliable JSON schema adherence for layout definitions |
| UI generation        | Strong at generating well-designed HTML/CSS layouts   |
| Future extensibility | Option to add DALL-E 3 for custom background/images   |
| SDK                  | Official `openai` Node.js SDK                         |

---

## Tech Stack

| Layer               | Choice                                | Reason                                                                 |
| ------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| **Framework**       | Next.js 16 (App Router)               | Already initialized                                                    |
| **Styling**         | Tailwind CSS v4                       | Already initialized                                                    |
| **AI**              | OpenAI GPT-4o (`openai` SDK)          | Layout generation                                                      |
| **State**           | Zustand                               | Lightweight app state (layout, selection, history)                     |
| **Canvas renderer** | Custom HTML/CSS + `dom-to-image-more` | Layouts are HTML; direct DOM rendering is simpler than Fabric.js/Konva |
| **Drag/Resize**     | Custom hooks with pointer events      | Element repositioning/selection                                        |
| **Color picker**    | `react-colorful`                      | Lightweight color editing                                              |
| **Device frames**   | SVG bezels                            | Realistic phone/tablet bezel overlays                                  |

---

## Layout JSON Schema (AI Output)

```typescript
interface LayoutElement {
  id: string;
  type: "text" | "image" | "button" | "shape" | "icon";
  x: number; // px from left
  y: number; // px from top
  width: number; // px
  height: number; // px
  // Text-specific
  text?: string;
  fontSize?: number;
  fontWeight?: number; // 400-900
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  color?: string; // hex
  // Shape-specific
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  // Image/icon-specific
  src?: string; // URL or placeholder
  objectFit?: "cover" | "contain" | "fill";
  // Common
  opacity?: number; // 0-1
  rotation?: number; // degrees
  zIndex?: number;
}

interface ScreenLayout {
  width: number;
  height: number;
  background: string;
  scaleFactor?: number; // for render scaling
  elements: LayoutElement[];
}
```

---

## Play Store Image Sizes

| Type             | Size (px)   |
| ---------------- | ----------- |
| Feature Graphic  | 1024 x 500  |
| Phone Screenshot | 1080 x 1920 |
| 7" Tablet        | 1280 x 800  |
| 10" Tablet       | 2560 x 1800 |

---

## Project Structure

```
app/
├── page.tsx                          # Main app shell
├── layout.tsx                        # Root layout
├── globals.css                       # Tailwind
├── api/
│   ├── generate/route.ts             # POST /api/generate — calls OpenAI, returns layout JSON
│   └── export/route.ts               # POST /api/export — renders layout to PNG
components/
├── chat/
│   ├── ChatComposer.tsx              # Concept input + send button
│   ├── ChatPanel.tsx                 # Chat history sidebar
│   └── SystemPrompt.tsx              # Prompt refinement options
├── canvas/
│   ├── Canvas.tsx                    # Main interactive canvas (renders layout)
│   ├── CanvasElement.tsx             # Draggable/resizable element wrapper
│   ├── CanvasText.tsx                # Editable text renderer
│   ├── CanvasImage.tsx               # Image/icon placeholder
│   ├── PropertyPanel.tsx             # Edit selected element properties
│   ├── DeviceFrame.tsx              # Phone/tablet device bezel overlay
│   ├── DeviceSelector.tsx            # Switch device frame or none
│   └── Toolbar.tsx                   # Add element, undo, redo, zoom
├── export/
│   ├── ExportPanel.tsx               # Select Play Store sizes, preview thumbnails
│   ├── SizeCard.tsx                  # Individual size option card
│   └── DownloadButton.tsx            # Trigger download
├── layout/
│   └── ScreenRenderer.tsx            # Converts layout JSON → visual HTML/CSS
├── store/
│   └── useAppStore.ts                # Zustand store (layout, selection, history)
lib/
├── ai/
│   └── generate.ts                   # OpenAI client + system prompt + response parsing
├── layout/
│   ├── types.ts                      # LayoutElement, ScreenLayout, etc.
│   └── export.ts                     # dom-to-image-more capture logic
├── playstore/
│   └── sizes.ts                      # Dimension presets for Play Store
types/
└── index.ts                          # Shared TypeScript types
```

---

## Build Phases

### Phase 1: Chat + AI Generation (Core)

- ChatComposer component (landing state)
- OpenAI integration via `/api/generate`
- System prompt that instructs AI to output layout JSON
- ScreenRenderer component that renders JSON to visual HTML
- Basic chat panel showing generation history

### Phase 2: Canvas Editor (Core)

- Interactive canvas with click-to-select elements
- Drag to reposition elements
- PropertyPanel for editing text, colors, sizes, fonts
- DeviceFrame overlay (phone, tablet, none)
- DeviceSelector to switch frames

### Phase 3: Export System (Core)

- ExportPanel with Play Store size presets
- DOM-to-PNG capture via dom-to-image-more
- Download individual images or all as zip
- Preview thumbnails at each target size

### Phase 4: Polish

- Undo/redo history
- Better device frames (realistic bezels)
- Templates/presets
- Loading/error states
- Responsive layout improvements

### Phase 5: Play Store API Upload (Future)

- Google Play Console API integration
- OAuth2 authentication flow
- Screenshot upload endpoints

---

## Dependencies to Install

```bash
npm install openai zustand dom-to-image-more react-colorful jszip
```

---

## Environment Variables

Create `.env.local`:

```
OPENAI_API_KEY=sk-...
```

---

## Key Decisions

| Question          | Decision                                   |
| ----------------- | ------------------------------------------ |
| AI provider       | OpenAI GPT-4o                              |
| Canvas approach   | HTML/CSS DOM rendering (not Canvas API)    |
| Device frames     | Yes — realistic bezels via SVG overlays    |
| Landing state     | Chat composer as first screen              |
| API key           | Read from `.env.local`                     |
| Play Store upload | Download first, API upload as future phase |
