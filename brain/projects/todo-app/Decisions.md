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
