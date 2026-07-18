---
type: project
status: early / discovery
client: personal project
updated: 2026-07-18
---

# Project: To-do App

## Context
A mobile web app in the to-do / task-management space (Todoist-like), with
AI integration built in. Ihor is the creator and final decision-maker; his
own background is design.

## Vision
Speed of capture is the whole pitch. The app opens fast and the primary action
is **voice** — you dictate the tasks you need to do, AI parses and structures
them (due date, priority, execution notes), you confirm, done. Manual/typed
entry exists as a secondary path, not the main one. This is the differentiator
vs Todoist/Things/TickTick/Notion, which are all typing/tapping-first.

## Platform
Mobile web app (confirmed). Desktop/native — open.

## Key flows

### Primary — voice capture
1. Open app → dictate one or more tasks in natural speech.
2. AI parses the dictation into structured task(s): title, due date, priority,
   plus any extra execution notes mentioned.
3. **User must confirm before anything is committed** — AI hallucinates
   sometimes, so nothing gets saved without an explicit confirm step. Exact
   confirmation UX (one-by-one vs batch review) — open, see [[AI-Features]].
4. Confirmed task(s) land in the list.

### Secondary — manual entry
Typed/tapped task creation still exists as a fallback, but voice is the
headline action the product is built around.

## Audience
**Open — to define.**

## Competitive set (named, not yet analysed)
Todoist, Things, TickTick, Notion.

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

**Plans (active):**
_(none yet — plans move to `plans/_archive/` once fully executed)_

## How to work in this vault
See [[../../me/Designer|Designer]] for how Ihor wants AI to operate on this
project (ask before executing, present options with tradeoffs, push back when
warranted, defer the final call to him). Read it before doing substantive work.
