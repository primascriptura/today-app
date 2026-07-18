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
- **AI never commits a task without explicit user confirmation** — the
  hallucination risk is real and named by Ihor as the reason confirm-before-save
  is non-negotiable. This is the one hard automation boundary set so far.
- **Open:** does the AI infer priority implicitly from language/tone (e.g. urgency
  cues), or only set it when the user states it explicitly? Implicit inference
  is more "magic" but more likely to be wrong and erode trust — worth deciding
  deliberately, not by default.

## Assistant posture
Reactive on the core flow — triggered by the user's dictation, not proactive.
(Whether the AI ever proactively nudges — e.g. reminders, re-prioritization
suggestions — is a separate, later question.)

## Trust & transparency
**Confirm-before-commit is the core trust mechanism.** Open sub-decision:
what does confirmation look like when one dictation session produces multiple
tasks?
- **(a) Batch review** — AI shows all parsed tasks at once (like an
  email-parsing "review & add" screen); one confirm commits the batch, edit
  any before confirming.
- **(b) Sequential one-by-one** — step through each parsed task individually
  (swipe/tap to confirm or fix), slower but lower cognitive load per task.
- **(c) Hybrid** — batch list view, but each row is individually editable/
  confirmable, with a single "Add all" as the fast path.
Matters a lot for how "fast" the flagship flow actually feels — worth deciding
before any screen gets designed. **Ihor to decide.**

## Model & prompt design
**Open.** Model choice, prompt structure, cost/latency tradeoffs — to define
once the feature set is scoped.

## Anti-patterns to avoid
_(none logged yet)_
