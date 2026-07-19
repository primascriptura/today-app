---
type: project
status: early / discovery
client: personal project
updated: 2026-07-18
---

# Project: To-do App

**App name: Today** (decided 2026-07-19, see [[Decisions]]) — "To-do App" in
this doc's title is the working/project name, not the product name.

## Context
A mobile web app in the to-do / task-management space (Todoist-like), with
AI integration built in. Ihor is the creator and final decision-maker; his
own background is design.

## Vision
Speed of capture is the whole pitch. The app opens fast and the primary action
is **voice** — you dictate the tasks you need to do, AI parses and structures
them (due date, priority, execution notes) and saves them immediately, no
review step required in the moment. Manual/typed entry exists as a secondary
path, not the main one. This is the differentiator vs Todoist/Things/TickTick/
Notion, which are all typing/tapping-first — closer in spirit to iPhone
Reminders + Siri, but with real structure (dates, priority, notes) instead of
a flat list.

## Platform
Mobile web app (confirmed). Desktop/native — open.

## Key flows

### Primary — voice capture (flagship flow)
1. Open app → dictate one or more tasks in natural speech.
2. AI parses the dictation into structured task(s): title, due date, priority,
   plus any extra execution notes mentioned.
3. **Saved immediately, no blocking confirmation** — see [[AI-Features]] §Trust
   & transparency (reverses the earlier confirm-before-commit decision). A
   passive, dismissible "✓ Saved: …" note appears; nothing blocks on it.
4. Task lands in the list. Reviewing/editing/organizing is a separate,
   optional, later step (the "recently captured" surface), not part of capture.

**"On the go, just remembered something" is the single most frequent
situation** (see User needs below) — design and polish this path first. The
other three situations (evening planning, in the car, mid-conversation) are
the *same action* under different physical constraints, not separate flows to
design independently.

### Secondary — manual entry
Typed/tapped task creation still exists as a fallback, but voice is the
headline action the product is built around.

## Audience
**Maximally broad — anyone with a phone.** Not a niche productivity-nerd tool
(unlike Todoist's power-user positioning); this is an everyday app for general
phone users. No segment/persona narrowing yet.

## User needs (job stories — 2026-07-19 session)
Confidence: *observed* for Ihor's own behaviour (self-reported, real current
habit); *assumed* that it generalizes to the broader "anyone with a phone"
audience — not yet validated with anyone else.

1. **On the go, just remembered something (most frequent).** "When I remember
   something while I'm out and worry I'll forget it, I want to dictate it in a
   second, so I can immediately stop thinking about it and trust it's saved
   correctly." Emotional: urgency, fear of forgetting, occasional spark of
   inspiration. Functional: hands-free, no screen-checking, no review in the
   moment.
2. **Evening, planning tomorrow.** Dictate a stream of tasks lying down, so
   the day is off the mind before sleep.
3. **In the car.** Hands-free, eyes-free capture — a safety constraint, not
   just convenience.
4. **Mid-conversation.** Fast, unobtrusive capture of a commitment that comes
   up while talking to someone. **No social self-consciousness component** —
   purely about speed, not about looking rude/awkward.

**Current workaround (today, without this app):** iPhone Reminders, typed
manually or added via Siri. Liked specifically for being minimal, simple,
easy to understand.

**Worst failure, ranked:** silent task loss (nothing saved) ≫ wrong parsed
field (noticeable, fixable). This ranking is *why* the confirm-before-commit
model was reversed — see [[Decisions]] 2026-07-19.

**Contradiction surfaced and resolved:** the original ask ("AI must never
commit without explicit confirmation," from the very first product
conversation) directly conflicted with the real primary job story once
elicited. Resolved by reversing the confirm-gate — see [[Decisions]].

## Competitive set
- **Todoist, Things, TickTick, Notion** — named but not yet analysed; the
  established task-manager space.
- **iPhone Reminders + Siri** — not a market competitor, but Ihor's own daily
  driver and the explicit UX benchmark: minimal, simple, "just works," saves
  immediately and optionally tells you what it did.

## Repo
- **One repo for the whole project** (unlike aqua, which splits app code and
  design-brain into two separate repos): `git@github.com:primascriptura/today-app.git`.
- Layout: `~/Sites/todo-app/` is the repo root — `brain/` (this vault) and
  `app/` (code, not started yet) are subfolders of the same repo.
- **GitHub account = `primascriptura` only.** `ihorkh-design` is the Goodface/aqua account — never use it for this project. See [[Decisions]] 2026-07-18.

## Related docs

**Core (read every session):**
- [[Architecture]] — stack, technical decisions, constraints
- [[Status]] — current work, blockers, up next
- [[Decisions]] — design decisions log (recent + still-active only; older → [[Decisions-Archive]])
- [[Ideas]] — living idea backlog

**Feature specs:**
- [[AI-Features]] — AI integration: behaviour, automation boundaries, prompt design, AI UX patterns

**Strategy & model:**
- [[Strategy]] — desired outcome, opportunity tree, prioritized solution bets
- [[Concept-Model]] — objects, states, vocabulary (Task, Dictation)
- [[Flow-Voice-Capture]] — breadboard for the flagship voice-capture flow
- [[References]] — visual/interaction references collected for the surface layer
- [[Design-Prompt]] — draft prompt for generating screens in an AI design tool

**Plans (active):**
_(none yet — plans move to `plans/_archive/` once fully executed)_

## How to work in this vault
See [[../../me/Designer|Designer]] for how Ihor wants AI to operate on this
project (ask before executing, present options with tradeoffs, push back when
warranted, defer the final call to him). Read it before doing substantive work.
