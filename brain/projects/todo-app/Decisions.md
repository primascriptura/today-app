---
type: decisions-log
project: todo-app
---

# Design Decisions Log

> Only genuine decisions get an entry — a choice between real alternatives, a
> reversal, a stakeholder call. Routine work (bug fixes, applying an existing
> pattern) does NOT get an entry.
> AI agent appends at the bottom — never modifies previous entries.
> Entries older than ~3 weeks or about archived features move to [[Decisions-Archive]].

## Entry format — hard cap 3 lines
### YYYY-MM-DD — <the decision, one line>
**Why:** <the tradeoff/reason, one line — omit if obvious>
No files-touched / verification / alternatives-rejected essay.

---

## Log

<!-- AI appends new entries below -->

### 2026-07-18 — GitHub account for this project is `primascriptura` only
**Why:** Keeps this personal project separate from `ihorkh-design` (the Goodface/aqua-funded account) — never mix the two. Remote: `git@github.com:primascriptura/today-app.git`.

### 2026-07-18 — Core interaction: voice-first capture, AI parses into structured tasks, confirm-before-commit gate
**Why:** Speed of capture is the product's whole differentiator vs Todoist/Things/TickTick/Notion; explicit user confirmation is required before any task is saved because AI parsing can hallucinate.
**Still open:** batch vs sequential confirmation UX when one dictation yields multiple tasks; whether priority is inferred implicitly or only set from explicit language — see [[AI-Features]].

### 2026-07-19 — Confirmation UX: hybrid card list, not pure batch or pure sequential
**Why:** Pure batch risks users skimming past a wrong field; pure sequential kills the speed voice capture is built for. Hybrid = inline-editable card list + one "Add all" CTA, per-card dismiss. Full spec in [[AI-Features]].

### 2026-07-19 — Audience: maximally broad, not a power-user tool
**Why:** Everyday app for anyone with a phone — deliberately not chasing Todoist's productivity-nerd niche.

### 2026-07-19 — Priority is inferred from words only, never from voice tone/delivery
**Why:** Keeps parsing deterministic and explainable from the transcript; tone-based inference would be unreliable and impossible to debug.

### 2026-07-19 — REVERSES the 2026-07-18 "confirm-before-commit gate" and the 2026-07-19 "hybrid card list" decisions: AI always saves immediately, no blocking confirmation
**Why:** Job-story work surfaced a contradiction — the most frequent real scenario (quick capture on the go) needs zero friction; Ihor's own benchmark (iPhone Reminders + Siri) saves immediately and tells you what it did, optionally. Silent task loss ranked as the worst possible failure — far worse than a wrong field, which is noticeable and fixable. Blocking confirm directly contradicts that.
**New model:** optimistic save (task always created, never silently dropped) → passive, dismissible confirmation ("✓ Saved: buy milk, tomorrow 6pm") → the hybrid card list from the previous decision survives, but as an optional "review later" surface, not a mandatory gate. New hard constraint: AI must never fail silently — if speech can't be parsed at all, show a visible error/retry, don't drop it.
