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
- **Decided (2026-07-19) — priority comes from words only, never from voice
  delivery.** AI reads the transcribed text for explicit/implicit urgency
  language (e.g. "терміново", "asap", "before Friday's meeting"); it does not
  use tone, pace, volume, or other paralinguistic signal from the audio itself.
  Keeps the model deterministic and debuggable from the transcript alone —
  tone-based inference would be unreliable and impossible to explain if wrong.

## Assistant posture
Reactive on the core flow — triggered by the user's dictation, not proactive.
(Whether the AI ever proactively nudges — e.g. reminders, re-prioritization
suggestions — is a separate, later question.)

## Trust & transparency
**Confirm-before-commit is the core trust mechanism.**

**Decided (2026-07-19) — hybrid confirmation.** After dictation, show a card
list ("AI recognized N tasks"). Each card = title + date + priority as
inline-editable fields (tap to fix in place, no separate edit screen). One
primary CTA at the bottom, thumb-zone, full-width: "Add all (N)". Per-card
dismiss to drop a single misheard task without blocking the rest.

**Why this over the alternatives:**
- Pure batch (one blanket confirm, no per-field editing) is fastest but risky —
  users skim lists and miss a wrong field buried in item 2 of 3; dangerous
  given AI can hallucinate.
- Pure sequential (confirm each task one at a time) catches errors better but
  turns "one sentence → 3 tasks" into 3 separate confirm actions — undermines
  the speed that's the entire point of voice capture.
- Hybrid keeps the fast path (one tap when parsing was correct) while putting
  the fix right where the error is seen (Direct Manipulation + Forgiveness),
  instead of a separate edit flow.

**Revisit if:** real-world parsing accuracy turns out low — then add a
low-confidence field indicator (not colour alone, per accessibility) or fall
back toward sequential review until accuracy improves.

## Model & prompt design
**Open.** Model choice, prompt structure, cost/latency tradeoffs — to define
once the feature set is scoped.

## Anti-patterns to avoid
_(none logged yet)_
