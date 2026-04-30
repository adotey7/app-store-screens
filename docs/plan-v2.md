# AI Play Store Screen Studio (Next.js 16) - v2

## Summary
- Build a public SaaS web app where users sign in, describe their app, optionally upload brand assets, generate a full Play Store asset pack, tweak outputs in a layer-based canvas, and export a submission-ready ZIP.
- v1 scope: full editor (layer-core), Play core asset set (phone screenshots + feature graphic + 7-inch and 10-inch tablet variants), async jobs with live progress, and free-tier monthly quotas.
- Delivery model for v1: ZIP export for manual Play Console upload (no direct Play API integration yet).

## Key Changes
- Platform architecture: Use Next.js App Router for UI and Route Handler APIs, plus an async job worker for generation.
- Generation pipeline: prompt planner -> asset generation -> asset packaging.
- Policy checks: enforce prompt and output checks aligned with Play listing preview-asset requirements and constraints.
- Public APIs: `POST /api/projects`, `POST /api/projects/:projectId/brand-assets`, `POST /api/generation-jobs`, `GET /api/generation-jobs/:jobId`, `POST /api/canvas-docs/:assetId`, `POST /api/exports/:projectId`.
- Shared contracts: `AssetPreset`, `GenerationStatus`, `CanvasDocument`, `UsageSnapshot`.
- Data model tables: `users`, `projects`, `brand_assets`, `generation_jobs`, `generated_assets`, `canvas_documents`, `usage_ledgers`.
- Quota control: enforce per-user monthly generation quotas at submission time.
- Frontend routes: `/dashboard` for projects/usage, `/projects/[id]` for composer/history/jobs, `/editor/[assetId]` for Konva layer editing.
- Editor capability level: move/resize/rotate, text edit, replace image, align/distribute, undo/redo, per-format export.
- Live updates: poll or stream generation state (queued, running, completed, failed).

## Test Plan
- Unit tests: prompt planner schema validity, quota accounting/hard-stop logic, canvas save/load parity.
- Integration tests: job lifecycle transitions, retry behavior, ZIP export completeness, access control isolation.
- End-to-end flow: sign up -> create project -> generate assets -> edit on canvas -> export ZIP.
- Failure scenarios: model failure and recovery, quota-exceeded messaging and generation block behavior.

## Assumptions and Defaults
- Auth model: email sign-in with persistent saved projects.
- Stack: Vercel + Postgres + Blob storage.
- AI strategy: OpenAI-based planner + image generation behind a provider abstraction.
- Orchestration: async queue with live status and a balanced quality/speed target (roughly 20-45 seconds typical completion).
- Output set default: Play core assets (phone screenshots + feature graphic + 7-inch and 10-inch tablet variants).
- Publish flow default: ZIP bundle for manual Play Console upload.

## References
- Google Play store listing graphics and preview asset guidance:
  - https://support.google.com/googleplay/android-developer/answer/9866151?hl=en
