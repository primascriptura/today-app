---
type: feature-spec
project: todo-app
status: early / discovery
updated: 2026-07-18
---

# AI Integration — working spec

> Fill in as decisions get made. Don't invent answers to open questions below;
> they're prompts for a real conversation with Ihor.

## What should the AI do?
**Voice → structured task parsing.** User dictates one or more tasks in
natural speech; AI extracts, per task:
- Title
- Due date / day of execution
- Priority
- Execution notes (any extra detail mentioned about how to do it)

## Automate vs. leave manual
- **Voice is primary**, manual/typed entry is a secondary fallback path.
- **Superseded 2026-07-19 — see below.** ~~AI never commits a task without
  explicit user confirmation~~ — reversed once job-story work surfaced the
  real primary use case.
- **Decided (2026-07-19) — AI always saves immediately, fully automated, no
  blocking confirmation.** The most frequent scenario (quick capture on the
  go) needs zero friction — no hands, no screen-checking, no review step in
  the moment. Organizing/correcting happens later, if ever. The one hard
  automation boundary is now the opposite of before: **never silently fail**.
  If speech can't be parsed at all, surface a visible error/retry — don't just
  drop it.
- **Decided (2026-07-19) — priority comes from words only, never from voice
  delivery.** AI reads the transcribed text for explicit/implicit urgency
  language (e.g. "терміново", "asap", "before Friday's meeting"); it does not
  use tone, pace, volume, or other paralinguistic signal from the audio itself.
  Keeps the model deterministic and debuggable from the transcript alone —
  tone-based inference would be unreliable and impossible to explain if wrong.

## Assistant posture
Reactive on the core flow — triggered by the user's dictation, not proactive
— and now also **non-blocking**: it acts (saves) immediately without waiting
for the user's attention. (Whether the AI ever proactively nudges — e.g.
reminders, re-prioritization suggestions — is a separate, later question.)

## Trust & transparency
**Superseded 2026-07-19.** ~~Confirm-before-commit is the core trust
mechanism~~ — reversed. Real primary use case (quick capture on the go) needs
the opposite: save first, review never-or-later.

**Decided (2026-07-19) — optimistic save + passive confirmation.**
- Dictation ends → AI parses → task is **saved immediately**, no gate.
- A lightweight, dismissible confirmation appears (e.g. "✓ Saved: buy milk,
  tomorrow 6pm") — mirrors Siri's "here's what I did" pattern Ihor named as
  the loved reference. Not required reading; ignorable.
- The hybrid card list designed earlier (per-task, inline-editable) survives,
  but demoted from mandatory gate → **optional "recently captured" review
  surface** for the "organize later" step. Same UI, different job: no longer
  blocks saving, just makes correcting easy when the user chooses to look.
- **New hard constraint — never fail silently.** If speech recognition itself
  fails (can't make out what was said), the app must surface a visible,
  actionable error (e.g. "Couldn't catch that — tap to retry or type it").
  Silent loss was named as the worst possible outcome, worse than a wrong
  field, because a wrong field is noticeable and fixable — nothing is not.

**Why the reversal:** the original confirm-gate was reasoned from an abstract
worry (AI hallucinates) rather than the actual job. Job-story work on the most
frequent real scenario showed the opposite priority: speed and zero friction
beat correctness-checking in the moment; correctness gets handled later,
optionally, not as a precondition to saving.

## Model & prompt design
**Open.** Model choice, prompt structure, cost/latency tradeoffs — to define
once the feature set is scoped.

## Anti-patterns to avoid
_(none logged yet)_
