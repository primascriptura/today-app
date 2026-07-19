---
type: status
project: todo-app
updated: 2026-07-19
---

# Project Status

> Update at the end of every session.
> Historical shipped features → [[Status-Archive]].
> Every line below is ONE line — max ~15 words. Full narrative belongs in the git commit (once there is one), not here.

---

## In progress
- Voice→AI wiring code-complete on main; ⚠️ blocked on real key in `app/.env.local` + real-browser mic test

## Recent shipped work
- 2026-07-19 — Voice→Claude Haiku parsing wired (useSpeech uk-UA + /api/parse + usePlanner); build green, mic path untested headless
- 2026-07-19 — Today UI skeleton scaffolded in `app/` (Next.js 16, no AI/backend), verified + pushed [[Decisions#2026-07-19 — Stack: Next.js 16 (App Router) + React state + localStorage, no backend, no Tailwind]]

## Pending product questions
- Job stories are self-reported (Ihor only) — accepted risk, not validated
- Batch dictation (Opp B) and error-craft (Opp C) flows not yet breadboarded
- Eyes-free retry/cancel while driving — unresolved (see Flow-Voice-Capture)
- Priority scale, archive-reopen, raw transcript visibility — open (see Concept-Model)

---

## Deploy
_(not applicable yet)_
