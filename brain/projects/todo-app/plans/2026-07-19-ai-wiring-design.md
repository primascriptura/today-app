---
type: design-spec
project: todo-app
status: active
updated: 2026-07-19
---

# Design Spec — Wire real AI (voice → structured tasks)

> Replaces the stubbed voice flow in `usePlanner.ts` with a real pipeline:
> browser speech-to-text (Ukrainian) → Claude parsing → structured tasks.
> Builds on [[AI-Features]] and [[Flow-Voice-Capture]]. Decisions confirmed
> with Ihor 2026-07-19 (see [[Decisions]]).

## Goal
Dictated Ukrainian speech becomes real, correctly-structured tasks — title,
day, time-of-day, priority, notes — saved immediately, with a visible error
when speech can't be understood (never a silent loss).

## The two halves (this is the core mental model)
"Connect AI" is **two** jobs, in two places:

1. **Ears — speech → text (transcription).** Runs in the browser.
   Web Speech API (`webkitSpeechRecognition`), language `uk-UA`. Free, built-in,
   near-instant. **Not Claude.**
2. **Brain — text → structured task(s).** Runs on the server.
   Claude Haiku 4.5, given the transcript + today's date, returns a JSON array
   of tasks. **This is Claude.**

The Claude API key lives only on the server route — never shipped to the browser.

## Data flow
```
Browser: tap mic → Web Speech API (uk-UA) → transcript text
   → POST /api/parse { transcript, todayISO, dayLabels }
Server (Next.js route): Claude Haiku 4.5 + JSON schema → Task[] → respond
Browser: append tasks (optimistic save, already built) → "✓ Saved N tasks" toast
   On failure (mic denied / nothing heard / network): Error/Retry screen
```

## Parsing contract (Claude input → output)
**Input to Claude:** the raw transcript, plus context so it can resolve relative
dates: `todayISO` (e.g. `2026-07-19`), today's weekday, and the day-strip labels
for indices 0–6.

**Output (strict JSON schema):** `{ "tasks": Task[] }`, each task:
- `title` — string, cleaned (no "нагадай мені", no filler)
- `day` — integer 0–6, index into the day strip. Claude resolves "завтра",
  "у п'ятницю", "сьогодні" → the right index; default = today's index.
- `slot` — `"morning" | "afternoon" | "evening" | "anytime"` from any time
  mentioned ("о 6 ранку" → morning; no time → anytime)
- `meta` — short human label or null (e.g. "6:00 PM", "Friday")
- `priority` — boolean, true only on explicit/implicit urgency words
  ("терміново", "asap", "до п'ятниці"). **Words only, never audio tone**
  (per [[AI-Features]] decision).
- `notes` — string or null, any extra execution detail mentioned

Priority comes from the transcribed **text** only — deterministic and debuggable.

## Files to change (5)
1. **`app/.env.local`** (new, git-ignored) — `ANTHROPIC_API_KEY=...`;
   add `@anthropic-ai/sdk` to `package.json`.
2. **`app/app/api/parse/route.ts`** (new) — POST handler. Reads `{ transcript,
   todayISO, dayLabels }`, calls Claude Haiku 4.5 with the system prompt +
   `output_config.format` JSON schema above, returns `{ tasks }` or a 4xx/5xx
   with a machine-readable error kind. Server-only; key from `process.env`.
   *(Next.js 16 route-handler API differs from older versions — verify against
   `node_modules/next/dist/docs/` before writing, per repo `AGENTS.md`.)*
3. **`app/lib/useSpeech.ts`** (new) — Web Speech API wrapper: start/stop,
   `uk-UA`, returns transcript + a typed failure (`no-mic` | `no-speech` |
   `unsupported`). Isolated so it can later be swapped for a paid transcription
   API without touching `usePlanner`.
4. **`app/lib/usePlanner.ts`** — rewrite `tapMic`/`finish`/`retry`:
   `tapMic` starts real listening; on pause, POST the transcript to `/api/parse`,
   then append the **returned** tasks (delete the hardcoded "Follow up on job
   interview" placeholder at lines ~120–129). Keep the existing optimistic-save
   + confirmation behaviour.
5. **Error wiring** — route real failures (mic denied, nothing understood,
   network/parse error) to the existing `error` screen + `ErrorView`. This is
   the hard "never fail silently" constraint from [[AI-Features]].

## Model & cost
- Model: **`claude-haiku-4-5`** — cheapest/fastest; latency is a hard
  requirement here ("Processing must be near-instant" — [[Flow-Voice-Capture]]).
- Structured output via `output_config.format` (Haiku 4.5 supports it).
- Cost: ~50–150 input + ~100–200 output tokens per dictation → fractions of a
  cent. Thousands/month = pennies. If Haiku mis-parses messy Ukrainian, bump to
  Sonnet later — one-line change, Ihor's call.

## Known risk (stated up front)
Browser transcription of **Ukrainian on iOS Safari** is the weak link (not
Claude — the "ears"). Works well on Chrome/Android; iOS non-English support is
inconsistent. This is the planned first upgrade trigger → paid transcription
(Whisper handles Ukrainian well). The `useSpeech.ts` isolation makes that swap
cheap. Decision "browser-first, upgrade later" stands.

## Out of scope (this pass)
- Paid transcription upgrade (deferred until iOS quality proves it necessary)
- Mixed uk/en dictation (locked to `uk-UA` for now)
- Eyes-free retry while driving (open in [[Flow-Voice-Capture]])
- Raw-transcript visibility in the UI (open in [[Concept-Model]])
- Proactive AI (reminders, re-prioritization) — separate later question
