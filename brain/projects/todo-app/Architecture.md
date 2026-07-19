---
type: architecture
project: todo-app
status: active
updated: 2026-07-19
---

# Project Architecture

> First code landed 2026-07-19: the Today UI skeleton (no AI, no backend).
> Code lives in `app/`; this file records the decisions behind it.

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**. Chosen for the
  planned AI/server work later (route handlers / server actions) without a
  separate backend today.
- **Plain CSS + inline styles** on the "Organic" design tokens (Caprasimo +
  Figtree). **No Tailwind** — the source design (Claude Design "Today voice
  capture flow") is token + inline-style based, so a 1:1 port is cleaner
  without a utility layer.
- **No backend.** State is client-only.

## Data model
- **Task** — id, title, meta (label), when (today/later), slot (morning/
  afternoon/evening/anytime), day (index into the demo week), icon, tint,
  priority. Matches [[Concept-Model]].
- **Dictation** — not implemented yet; the voice flow is stubbed.
- Persistence: `localStorage` key `today.v1` = `{ tasks, done }`. Seed data
  loads on first run; SSR-safe rehydration (seed on server + first render,
  stored data swapped in after mount).

## Key component relationships
- `app/lib/usePlanner.ts` — single hook holding all UI + task state and the
  stubbed voice flow (timers, not AI); owns localStorage.
- `app/components/Planner.tsx` — screen switch (tasks / listening / processing /
  error / confirmation) + compose sheet overlay; sets the accent theme.
- One component per screen/piece under `app/components/`.

## What's stubbed (no AI yet)
- Voice capture is fake: Listening shows a decorative waveform, Finish runs a
  short timed "processing" then optimistically appends a fixed placeholder task
  and shows the "✓ Saved" toast. No microphone, no transcription, no parsing.
- The Error/Retry screen is built and wired (Retry → Listening, Type instead →
  compose) but not auto-reachable — it's where real transcription's
  total-failure branch will land. Matches the "always save, never fail
  silently" decision in [[Decisions]].

## Technical constraints
- No design system repo of its own — tokens are copied from the Organic system
  into `app/app/globals.css`.
- Platform: mobile web app (confirmed) — rendered full-viewport, max-width
  column on desktop.

## Preview
- Dev server config `today` (port 3210) lives in the machine's global
  `~/.claude/launch.json`, not in the repo.

## Competitor reference (to research, not yet analysed)
Todoist, Things, TickTick, Notion.
