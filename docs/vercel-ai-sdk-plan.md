# Vercel AI SDK + Gemini Migration Plan

## Summary

Two changes: (1) add theme toggle, (2) migrate from raw OpenAI SDK to Vercel AI SDK to enable Gemini as a provider option.

---

## 1. Theme Toggle

**Current state:** Tailwind v4 uses `@media (prefers-color-scheme: dark)` — system-level only, no manual toggle.

**Change:** Switch to class-based dark mode (`<html class="dark">`), persist preference in `localStorage`.

### Changes needed:

| File | What |
|---|---|
| `app/globals.css` | Replace `@media (prefers-color-scheme: dark)` with `@custom-variant dark (&:where(.dark, .dark *))` |
| `components/ThemeToggle.tsx` | New — button that toggles `dark` class on `<html>` and writes to `localStorage` |
| `app/layout.tsx` | Add inline `<script>` to read `localStorage` before paint (avoids flash) |
| `components/chat/ChatView.tsx` | Add ThemeToggle to header |
| `components/canvas/Toolbar.tsx` | Add ThemeToggle |

### How it works:
- `<script>` in `<head>` checks `localStorage.theme` and sets `document.documentElement.className` before React hydrates
- ThemeToggle button cycles: light → dark → system
- `useEffect` syncs to `localStorage`

---

## 2. Vercel AI SDK Migration (OpenAI + Gemini Support)

### Why?

| Before (raw OpenAI) | After (Vercel AI SDK) |
|---|---|
| ~60 lines manual prompt + parse + validate | ~30 lines, automatic Zod validation |
| OpenAI only | OpenAI + Gemini (swap via `AI_PROVIDER` env) |
| `response_format: { type: "json_object" }` | `Output.object({ schema: zodSchema })` |
| Must manually handle missing fields | SDK validates + throws typed errors |

### New dependencies

```
ai          @ai-sdk/openai    @ai-sdk/google    zod
```

Remove: `openai` (raw SDK is replaced by `@ai-sdk/openai`)

### Architecture

```
AI_PROVIDER=openai|google   (in .env.local)
    │
    ▼
lib/ai/provider.ts          ← Returns the right model: openai('gpt-4o') or google('gemini-2.5-flash')
    │
    ▼
lib/ai/generate.ts          ← Uses generateText() + Output.object() with Zod schema
    │
    ▼
app/api/generate/route.ts   ← Unchanged interface, but calls new generate functions
app/api/refine/route.ts     ← Same
```

### Files to create/modify:

| File | Action |
|---|---|
| `lib/ai/provider.ts` | **New** — Factory that returns correct provider model based on `AI_PROVIDER` env |
| `lib/ai/schema.ts` | **New** — Zod schemas for `LayoutElement`, `ScreenLayout` |
| `lib/ai/generate.ts` | **Rewrite** — Use `generateText()` + `Output.object()` instead of raw OpenAI |
| `app/api/generate/route.ts` | **Update** — Use new generate function |
| `app/api/refine/route.ts` | **Update** — Use new generate function |
| `package.json` | Add `ai`, `@ai-sdk/openai`, `@ai-sdk/google`, `zod`; remove `openai` |

### Env vars (.env.local)

```env
# Provider selection
AI_PROVIDER=openai           # or 'google'

# OpenAI
OPENAI_API_KEY=sk-...

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=...
```

### Zod Schema (replaces manual JSON.parse + validation)

```typescript
// lib/ai/schema.ts
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
```

### Example: new `generateLayout()`

```typescript
// lib/ai/generate.ts
import { generateText, Output } from "ai";
import { getModel } from "./provider";
import { screenLayoutSchema } from "./schema";

export async function generateLayout({ prompt, previousMessages }) {
  const model = getModel();
  
  const { output } = await generateText({
    model,
    system: SYSTEM_PROMPT, // Same system prompt
    output: Output.object({ schema: screenLayoutSchema }),
    temperature: 0.8,
    maxTokens: 4096,
    prompt, // AI SDK handles message formatting
  });

  return output; // Fully typed, validated ScreenLayout
}
```

---

## Provider Swap Behavior

| `AI_PROVIDER` | Model Used | Env Var Required |
|---|---|---|
| `openai` (default) | `openai("gpt-4o")` | `OPENAI_API_KEY` |
| `google` | `google("gemini-2.5-flash")` | `GOOGLE_GENERATIVE_AI_API_KEY` |

Error handling: if `AI_PROVIDER` is `google` but `GOOGLE_GENERATIVE_AI_API_KEY` is missing, throw a clear error at startup.

---

## Gemini Caveats

- Gemini doesn't support `z.union()` in structured output mode. Our schema doesn't use unions (we use `z.enum()` for discriminated fields), so this shouldn't be an issue.
- Gemini 2.5 Flash is **free tier** available (great for prototyping). Gemini 2.5 Pro is better quality.
- If structured output fails, we can disable it with `providerOptions: { google: { structuredOutputs: false } }` and rely on JSON parsing fallback.

---

## Rollback / Safety

The old OpenAI-only code path can be kept as a fallback by checking `AI_PROVIDER`:
- `openai` → Vercel AI SDK with `@ai-sdk/openai`
- `openai-legacy` → Original raw OpenAI SDK (if we want a fallback, but probably not needed)

---

## Implementation Order

1. Install new deps (`bun add ai @ai-sdk/openai @ai-sdk/google zod`)
2. Create `lib/ai/provider.ts` (model factory)
3. Create `lib/ai/schema.ts` (Zod schemas)
4. Rewrite `lib/ai/generate.ts` (use AI SDK)
5. Update API routes
6. Update `.env.local` template with `AI_PROVIDER`
7. Add theme toggle system CSS + component
8. Build + verify

---

## Questions for Approval

1. Default provider: `openai` or `google`?
2. Keep the raw `openai` SDK as a fallback, or remove it entirely?
3. For Gemini: use `gemini-2.5-flash` (fast/free) or `gemini-2.5-pro` (best quality)?
