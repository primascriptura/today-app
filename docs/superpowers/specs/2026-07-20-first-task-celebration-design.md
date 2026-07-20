# First-task celebration — design

Status: approved by Ihor 2026-07-20

## Goal
The very first time someone ever completes a task in the app, show a small
one-time celebration: confetti in the app's brand tones + a badge card with
short congratulatory copy. Never fires again after that first time.

## Reference
Tiimo app screenshot (shared 2026-07-20) — confetti bursting near the header
of the day view. We're borrowing the "confetti near the top of the screen"
idea and the on-brand (not rainbow) coloring; we are not adopting a
persistent/decorative confetti background, a daily "X/Y done" counter pill,
or any streak/badge-collection system — this is a single one-time moment.

## Trigger
`usePlanner.ts`'s `complete()` action already increments a lifetime counter,
`state.done`, which is persisted to `localStorage` (`today.v1`) and never
decremented or reset. That makes the transition **`done === 0` → `done === 1`**
an exact, already-reliable signal for "this person has never completed a
task before, until right now" — no new persisted flag required.

Add a transient (non-persisted) state field, e.g. `celebrate: boolean`, set
`true` in the same `setState` call inside `complete()` that currently sets
`leaving` and increments `done`, gated on `s.done === 0`. Clear it via the
existing `later()` timer helper after ~3.2s, and immediately on tap-dismiss
(mirrors `ConfirmationToast`'s dismiss behavior).

This fires immediately when the checkmark is tapped — it does not wait for
the row's 340ms leave animation to finish.

## Component
New component, e.g. `FirstTaskCelebration.tsx`, mounted in `Planner.tsx`
alongside `ConfirmationToast` (sibling overlay, same conditional-render
pattern), rendered when `state.celebrate` is true. Takes an `onDismiss`
action, same shape as `ConfirmationToast`'s `actions.dismiss`.

### Layout / positioning
Same top anchor as the existing `ConfirmationToast` (`position: absolute,
top: 120`, centered, `zIndex` above the task list) — reuses an established
pattern rather than inventing a new placement. Tapping anywhere on it
dismisses immediately, same as the existing toast.

### Badge
A white rounded card, same visual family as `ConfirmationToast` (rotated
slightly, drop shadow, `boxShadow: 0 12px 32px rgba(46,43,37,.2)`), containing:
- A small circular icon chip (celebratory glyph — new bespoke inline SVG,
  not added to the shared `IconKey` set since it's used nowhere else; drawn
  in the same stroke style as `Icon.tsx`: `viewBox 0 0 24 24`, `strokeWidth
  2.2`, round caps/joins)
- Headline: **"First task done"**
- Subline: **"Nice start — keep it up."**

Copy locked in (option A from the brainstorm, approved 2026-07-20).

### Confetti
12–18 small rectangular/circular pieces, absolutely positioned within the
badge's overlay area, generated in React with per-piece randomized
horizontal offset, rotation, size, and a color pulled from a fixed 3-tone
on-brand palette (cycled, not random-picked, so the distribution stays even):
- `#3b4b8c` (`--app-accent`)
- `#2c3866` (`--app-accent-strong`)
- `#b7bfe4` (light lavender, from `--app-grad`)

No rainbow / off-brand colors, no external confetti library — hand-rolled
CSS keyframes, consistent with how every other animation in this codebase
(`toastIn`, `taskEnter`, `taskLeave`, etc.) is built directly in
`globals.css`.

## Motion
This is a once-ever, first-run moment, which (per animation best practice)
is the one case in this app where fuller, more expressive motion is
appropriate — everyday actions elsewhere in the app correctly stay quick
and subtle, and this shouldn't change that.

- **Badge entrance:** reuse `toastIn`'s easing family
  (`cubic-bezier(.2,.7,.2,1)`), drop in from `translateY(-10px) scale(0.96)`
  to resting position — never animate from `scale(0)`.
- **Confetti pieces:** each piece fades in, arcs/falls a short distance
  with a slight rotation, then fades out — one keyframe, per-piece
  `animation-delay` staggered ~40–70ms apart so the burst reads as
  orchestrated rather than a single flat pop. Total confetti motion settles
  within roughly 1–1.5s; the badge itself stays on screen for the full
  ~3.2s dismiss window.
- **Reduced motion:** already handled for free by the existing global
  `prefers-reduced-motion` media query in `globals.css`, which zeroes all
  animation durations — the badge and confetti pieces will simply appear at
  their end state (final opacity/position) instead of animating. No
  additional code needed, but keep every keyframe's `to`/`100%` state fully
  opaque and correctly positioned so the reduced-motion snap-to-end-state
  looks intentional, not broken.

## Out of scope
- No streaks, no 2nd/10th/50th-task milestones, no badge-collection screen.
- No persistent/decorative confetti background (unlike the Tiimo
  reference's continuous confetti motif).
- No new dependency (no `canvas-confetti` or similar).

## Verification
- `npm run build` / typecheck green.
- Manual check in the running app (`today` preview, port 3210): clear
  `localStorage` (or use a fresh profile), complete the first task of a
  fresh session, confirm the celebration plays once and never again on
  subsequent completions or after a reload.
- Confirm `prefers-reduced-motion: reduce` (via devtools emulation) shows
  the end state without animating.
