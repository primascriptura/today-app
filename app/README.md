# Today — app

Mobile-web UI for **Today**, a voice-first day planner. This is the front-end
skeleton: all screens and navigation work, state lives on the client
(`React` + `localStorage`), and there is **no backend and no AI yet** — the
voice-capture flow is stubbed.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Plain CSS + inline styles** using the "Organic" design tokens
  (Caprasimo + Figtree) — no Tailwind
- Client-only state via a `usePlanner` hook; tasks persist to `localStorage`
  under the key `today.v1`

## Run

```bash
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## What works

- **Today list** — day switcher, tasks grouped by Morning / Afternoon /
  Evening / Anytime, collapsible sections, swipe-to-delete, complete-to-archive
- **Manual entry** — the compose sheet (title + Date / Priority chips)
- **Voice flow (stubbed)** — Listening → Processing → "Saved" confirmation, or
  the wired-but-not-auto-reached Error/Retry screen. No microphone or parsing
  is involved yet; Finish appends a placeholder task (optimistic save).

## Structure

```
app/            App Router entry (layout, page, globals.css)
components/     Planner + one file per screen/piece
lib/            types, seed data, and the usePlanner state hook
```

## Not built yet (next steps)

- Real speech capture + AI parsing of a dictation into structured task(s)
- Real dates (the demo week is a fixed Jan 2026); accounts / sync
- The "recently captured" review surface

See `../brain/projects/todo-app/` for product context, the concept model, and
the voice-capture flow breadboard.
