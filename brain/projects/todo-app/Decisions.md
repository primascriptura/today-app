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

### 2026-07-19 — Business outcome for MVP: portfolio/case-study, not growth
**Why:** First time this was discussed — chose a demonstrable design/product case study over user growth or personal validation; reprioritizes roadmap away from onboarding/retention/monetization toward flagship-flow craft. Full tree in [[Strategy]].

### 2026-07-19 — In-car capture: no dedicated eyes-free/audio-only mode
**Why:** General voice-capture flow (entry point + passive "✓ Saved") must hold up without a screen glance — not a separate bet or build, since driving is the same action under a stricter constraint, not a new flow.

### 2026-07-19 — Solution bet priority: flagship flow first, then error/retry craft, then batch dictation
**Why:** Case-study outcome rewards polish on the most-used flow and the unhappy path (rare in competitors) over range; batch dictation for evening planning can wait.

### 2026-07-19 — Completing a Task archives it, removes it from the active list
**Why:** First time task completion was defined at all — no archive-vs-delete debate yet, just: done means gone from the list, not shown crossed-out. Full model in [[Concept-Model]].

### 2026-07-19 — Entry point for voice capture: open app, then one tap on mic button
**Why:** Auto-start-on-open risks recording before the user's ready; OS-level shortcut (lock-screen-style) is unproven for a mobile web app. One tap is the simple, reliable middle ground. Full flow in [[Flow-Voice-Capture]].

### 2026-07-19 — Take Tiimo's chat/task-card visual style, drop its confirm-before-save gate
**Why:** Tiimo (reference) waits for a "Create tasks" tap before saving — reintroduces the confirm-gate already rejected. Borrow the look (chat thread, task card, Speak input), keep optimistic save: card appears as an already-saved fact.

### 2026-07-19 — Batch dictation ends with one tap to finish, not per-task confirmation
**Why:** Todoist's "Ramble" flow (see [[References]]) shows task cards progressively while listening, then one tap ends the session and saves all — a lighter middle ground than Tiimo's per-task gate, fits multi-task evening planning (Opportunity B) better than fully zero-touch.

### 2026-07-19 — App name: Today
**Why:** First name decided for the project — used from here on in place of "To-do App" placeholder.

### 2026-07-19 — Visual direction: closely replicate Todoist's "Ramble" flow, swap only the accent color
**Why:** Ihor's explicit call, overriding an earlier caution about portfolio originality — priority right now is that it works and looks Todoist-quality, not differentiation. Revisit if the case-study framing needs more visual distinctiveness later.

### 2026-07-19 — Stack: Next.js 16 (App Router) + React state + localStorage, no backend, no Tailwind
**Why:** Ihor's call. Next.js leaves room for the later AI/server work without a separate backend now; plain CSS on the Organic tokens keeps the design port 1:1 (the source design is inline-style based). Voice flow stubbed — no AI yet. Full detail in [[Architecture]].

### 2026-07-19 — Dictation shows task cards live, per recognized phrase
**Why:** Delivers the Ramble progressive flow anticipated in [[Decisions#2026-07-19 — Batch dictation ends with one tap to finish, not per-task confirmation]]: each finalized phrase parses on its own (serial queue, cards in spoken order), the "Try saying" placeholder cross-fades out on the first card, Finish just commits (no Processing screen — cards are already optimistic facts), and Cancel (✕) discards the session's cards. Full-transcript parse kept only as a fallback when nothing parsed live.

### 2026-07-19 — Real current date replaces the fixed Jan-2026 demo range
**Why:** App now reads real today (rolling 21-day strip centered on it, Today/Yesterday/Tomorrow labels + today marker); seeds land on today, and the parser resolves relative days against the client's own strip (sent in the request) so it's timezone-independent. Reverses the "fixed demo week / DEFAULT_DAY=11" placeholder. Task persistence is still index-based (a saved day drifts as the window rolls) — deferred, not addressed.

### 2026-07-20 — Task-creation badges are real pickers; Date chip is the single "when"
**Why:** The compose sheet's Date/Deadline/Priority/Reminder chips were half-stubbed toggles, and "Date" duplicated a separate disabled day pill. Removed the pill so the Date chip alone owns scheduling (opens a Todoist-style sheet with quick options + calendar + nested Time & Repeat); Deadline/Priority(P1–P4)/Reminder now open real pickers, all persisted on the Task and rendered in the row. Pickers are hand-rolled inline-style components (no shadcn/Tailwind), per the stack decision.

### 2026-07-20 — First-ever task completion gets a one-time confetti + badge
**Why:** Reuses the existing lifetime `done` counter's 0→1 transition as the trigger (no new persisted flag); scoped to just this one moment, no streaks/milestones. Full spec: `docs/superpowers/specs/2026-07-20-first-task-celebration-design.md`.
