---
type: status
project: todo-app
updated: 2026-07-20
---

# Project Status

> Update at the end of every session.
> Historical shipped features → [[Status-Archive]].
> Every line below is ONE line — max ~15 words. Full narrative belongs in the git commit (once there is one), not here.

---

## In progress
- Voice→AI + voice-reactive waveform live; ⚠️ only real-browser mic test left (dictation + waveform reaction)

## Recent shipped work
- 2026-07-20 — Fixed dictation not applying AI: an interim phrase that never fired a final chunk committed raw on today; finish() now parses the dangling interim so day/time/priority apply. Also: live card wraps full text + no corner clip; voice "high priority" → P1. Verified via fake-SR interim-only sim + real /api/parse
- 2026-07-20 — First-task celebration: confetti + badge on first-ever completion, one-time, no new persisted flag [[Decisions#2026-07-20 — First-ever task completion gets a one-time confetti + badge]]
- 2026-07-20 — Manual-entry pickers made real: Date (quick opts + calendar + nested Time/Repeat), Deadline, Priority P1–P4, Reminders; removed duplicate day pill (Date chip = sole "when"); voice parse extended (time/repeat/deadline); verified live [[Decisions#2026-07-20 — Task-creation badges are real pickers; Date chip is the single "when"]]
- 2026-07-19 — Real dates: strip centered on real today (Today/Yesterday/Tomorrow labels + real date, today ring+dot marker); seeds + parser use real todayIndex; verified in prod build [[Decisions#2026-07-19 — Real current date replaces the fixed Jan-2026 demo range]]
- 2026-07-19 — Waveform now reacts to real speech: Web Audio mic meter drives the bars, calm "breathing" baseline in silence (was a fixed decorative cadence); idle render verified, live reaction needs browser mic
- 2026-07-19 — Real-time dictation: `interimResults` streams a card while speaking + optimistic card enriched in place, so nothing waits on a pause or the Claude round-trip; typecheck + build + /api/parse (client-strip payload) verified
- 2026-07-19 — Live dictation: cards appear per phrase during listening (Ramble-style), placeholder cross-fades out, Finish commits w/o Processing; verified via simulated speech + real /api/parse [[Decisions#2026-07-19 — Dictation shows task cards live, per recognized phrase]]
- 2026-07-19 — Per-task icons: parser now picks a category glyph (16 icons + dot); Icon set + ICON_TINTS expanded; verified via /api/parse + DOM render
- 2026-07-19 — Fixed day switching: `selectDay` guard was `i>6`, rejected days 7–20 on the 21-day strip; now `i>=DAYS.length`
- 2026-07-19 — Fixed day-index mismatch: parser `day` enum now derived from `DAYS` (was hardcoded 0–6 vs DEFAULT_DAY=11), so voice tasks render on the right day/slot instead of vanishing
- 2026-07-19 — Voice→Claude Haiku parsing wired (useSpeech uk-UA + /api/parse + usePlanner); build green, mic path untested headless
- 2026-07-19 — Today UI skeleton scaffolded in `app/` (Next.js 16, no AI/backend), verified + pushed [[Decisions#2026-07-19 — Stack: Next.js 16 (App Router) + React state + localStorage, no backend, no Tailwind]]

## Pending product questions
- Job stories are self-reported (Ihor only) — accepted risk, not validated
- Batch dictation (Opp B) and error-craft (Opp C) flows not yet breadboarded
- Eyes-free retry/cancel while driving — unresolved (see Flow-Voice-Capture)
- Archive-reopen, raw transcript visibility — open (see Concept-Model); priority scale decided (P1–P4)

---

## Deploy
_(not applicable yet)_
