---
type: design-prompt
project: todo-app
status: draft — ready to run staged (see §11)
updated: 2026-07-19
---

# Design Prompt — Today (voice capture flow), v2

> Structured per the polished-UI playbook Ihor provided (product context →
> art direction → constraints → hierarchy → typography → spacing → color →
> motion → states → accessibility → staged process). Built from
> [[Concept-Model]], [[Flow-Voice-Capture]], [[References]], [[Strategy]].
> App name **Today** and visual direction (closely replicate Todoist's
> "Ramble" flow) both confirmed 2026-07-19 — see [[Decisions]].

---

## 1. Product context
- **Product:** Today — a mobile web to-do app. Voice dictation is the
  headline capture method; AI parses speech into structured tasks and
  saves immediately, no blocking confirmation.
- **User:** anyone with a phone — not a power-user/productivity-nerd
  audience (deliberately not chasing Todoist's own positioning, even though
  we're borrowing its visual language — see [[Project]]).
- **Main task, per screen:**
  - Capture → say a task in one breath
  - Listening → confirm speech is actually being heard
  - Task List → scan what's still open
  - Recently Captured → optionally fix a misheard field
  - Manual Entry → add a task by typing (fallback path)
- **Primary action:** tap the mic, speak, trust it saved.
- **What the user should understand in 3 seconds:** "I can just talk, and
  it's already saved — I don't need to check."

## 2. Art direction
- **Adjectives:** calm, fast, warm, minimal, trustworthy.
- **Mood:** closer to iPhone Reminders/Siri than to a power-user
  productivity tool (see [[Project]] competitive set).
- **Should resemble:** Todoist's "Ramble" voice flow — primary reference,
  match closely (layout, chrome, gradient, card shape, controls). Tiimo's
  task-card/chat shape — secondary (icon circle + checkbox + duration).
- **Should not resemble:** dense power-user dashboards (Notion/Things-style
  clutter), generic purple-gradient AI-SaaS templates.

## 3. Visual constraints / anti-patterns
- No purple/blue-gradient AI-SaaS aesthetic — the gradient family here is
  Todoist's own warm off-white → peach, not violet.
- The gradient only appears in voice-mode states (Listening / Processing /
  Error / Ramble-paused) — it's functional (signals "voice mode is live"),
  never decorative on Task List or Manual Entry.
- No decorative blobs, glows, or gimmick effects beyond that gradient.
- No generic hero + 3-cards + CTA marketing template — this is a utility
  app, not a landing page.
- No oversized radii beyond what the reference actually uses (cards ≈
  16–20px radius, not 32px+).
- No purely decorative icon-in-circle "feature card" pattern — the one
  icon-in-circle we do use (Tiimo-style task card icon) carries real
  meaning (task category), not decoration.

## 4. Hierarchy
| Screen | 1st thing seen | 2nd | Tertiary / quiet |
|---|---|---|---|
| Capture | mic button | small link to Task List | nothing else |
| Listening | waveform + example prompt | "Listening..." label | cancel affordance |
| Confirmation | "✓ Saved: ..." text | — | auto-dismiss, no other content |
| Error/Retry | "Couldn't catch that" message | Retry action | "type it instead" (secondary) |
| Task List | task titles | date/priority tags per row | project/list label |
| Recently Captured | task cards | editable fields | dismiss affordance |
| Manual Entry | title field | date/priority/notes fields | Save vs Cancel |

## 5. Typography
- iOS-native system-font feel, matching the reference's actual choice.
- One strong style for the "Try saying" prompt (Listening state), one
  clean body style for task titles and list rows, one small utility style
  for metadata (dates, tags, project labels).
- Restrained: no more than 3 text styles per screen.

## 6. Density & spacing
- Listening / Confirmation / Error / Ramble-paused: spacious, almost
  empty — nothing to scan, just one message and a control.
- Task List / Recently Captured: balanced density, comfortable row height,
  clear separators — not cramped.
- Manual Entry: balanced, generous tap targets (it's the fallback path,
  should still feel easy, not penalized).

## 7. Color
- **Neutral foundation:** white cards, warm-off-white/light-gray page
  background outside the gradient states.
- **Gradient** (Listening/Processing/Error/Ramble-paused only): warm
  off-white → peach/coral, matching the reference. Functional, not
  decorative — signals "voice mode active."
- **One accent color — PLACEHOLDER: deep indigo/blue (#3B4B8C)** replacing
  Todoist's red. Used for: primary buttons (finish/checkmark), active tab,
  priority flags, links. Swap for Ihor's real choice later — not decided
  yet, this is a placeholder so the prompt is runnable now.
- **Status colors:** keep functional date-tag colors (e.g. today = green,
  later-date = purple) as in the reference — these encode meaning, not
  decoration, and aren't part of the accent-color swap.

## 8. Motion
- Waveform animates continuously while listening — functional, proves the
  mic is live.
- During batch dictation, task cards animate in one at a time as each is
  recognised (slide/fade up) — never all at once.
- Confirmation toast fades/slides in, auto-dismisses after ~3s with a
  gentle fade out.
- Pause ↔ resume: icon swap only, no elaborate transition.
- No flashy, bouncy, or playful motion — everything reinforces "this is
  working," nothing decorative.

## 9. States — full inventory and dependencies

### 9.1 Dictation states (system-level; drives what's on screen)
Idle (before mic tap) → Recording/Listening → [Paused, batch only] →
Processing (brief, near-instant) → **Resolved** (≥1 task extracted) or
**Failed** (nothing understood at all).

### 9.2 Task states
Active (default, shown in Task List) → Archived (after Complete, removed
from Task List — not shown crossed-out). See [[Concept-Model]].

### 9.3 Screen-by-screen states and what triggers them

**Capture**
- Default/only state: mic button, idle. Always the app's landing screen.
- → Listening on mic tap.

**Listening**
- Default: waveform + example prompt ("Try saying: ...") shown before any
  speech is detected.
- Active: waveform responds to live audio; example prompt fades once
  speech starts.
- Depends on: Dictation.state = Recording.
- → Processing when a pause is detected or user taps finish.
- → Capture on cancel tap (Dictation discarded, nothing saved).

**Processing**
- Single transient state: brief in-progress indicator. Depends on
  Dictation.state = Processing.
- → Confirmation when Dictation.state becomes Resolved.
- → Error when Dictation.state becomes Failed.
- Hard constraint: no "slow loading" visual treatment — if this takes
  more than a beat, that's a product bug, not a design opportunity.

**Confirmation (overlay)**
- Only renders on success: "✓ Saved: `<title>`, `<date>`" (single task) or
  "✓ Saved `<N>` tasks" (batch). Depends on Dictation.state = Resolved and
  ≥1 Task created.
- No empty/error version — it never renders otherwise.
- → Capture, auto-dismiss ~3s.
- → Recently Captured on tap.

**Ramble-paused (batch dictation only)**
- Populated: shows every task card created so far this session. Depends
  on Dictation.state = Paused and ≥1 Task already created in-session.
- → Listening on resume tap.
- → Confirmation on finish/checkmark tap.

**Error / Retry (overlay)**
- Only renders on total failure: "Couldn't catch that — tap to retry or
  type it." Depends on Dictation.state = Failed.
- Does **not** auto-dismiss (unlike Confirmation) — requires
  acknowledgment, since nothing was saved.
- → Listening on retry tap.
- → Manual Entry on "type it instead" tap.

**Task List**
- Empty: first-ever open, zero tasks exist — needs real empty-state
  copy/illustration ("Nothing yet — dictate your first task"), not a
  blank white screen.
- Populated: Active tasks only — Archived tasks never appear here.
- Loading: not applicable for MVP (optimistic local save, no network
  round-trip expected on this screen).
- Row interaction: tapping Complete moves a Task Active → Archived; the
  row disappears (not strikethrough).
- "Recently captured" banner: its own hidden/shown state, appears only
  if something was captured recently and not yet reviewed.
- → Manual Entry on "+" tap.
- → Recently Captured via the banner, when shown.

**Recently Captured**
- Empty: nothing captured recently — this screen should be unreachable in
  that state (no entry point shown), rather than rendering an empty state.
- Populated: inline-editable cards for recently-created tasks.
- Validation: only the title field is required (per [[Concept-Model]]) —
  clearing it should block/undo, not silently save a blank title.
- → Task List when a card is dismissed (the task itself is untouched,
  only leaves this review surface).

**Manual Entry**
- Default: empty form (title, date, priority, notes).
- Validation: title required — Save stays disabled/inert until a title is
  entered. This is the one screen with a real disabled state.
- → Task List on Save (Task created, Active) or Cancel (nothing created).

### 9.4 Standard UI states, applied to this product
- **Hover:** not applicable — touch-first mobile web app. Skip unless a
  desktop breakpoint gets added later (still an open platform question,
  see [[Project]]).
- **Focus:** needed on Manual Entry's fields and both overlays' buttons
  (Retry, Type instead, Resume, Finish) — visible focus ring, keyboard
  reachable.
- **Disabled:** Manual Entry's Save button before a title is entered.
- **Active/selected:** the bottom tab bar's current tab; a Task List row
  mid-interaction if a swipe-to-complete gesture is used.

## 10. Accessibility
- Contrast: dark text on white cards must hold up even over the lightest
  part of the gradient background, not just against plain white.
- Visible focus states on all Manual Entry fields and on every overlay
  button (Retry, Type instead, Resume, Finish).
- Labeled controls: the mic, pause, finish/checkmark, and retry controls
  are icon-only — each needs an accessible label, easy to miss otherwise.
- Touch targets: mic button and the pause/finish circles should stay
  large and comfortable (the reference uses large circular hit areas —
  keep that, don't shrink for density).

## 11. How to actually run this (staged — not one giant prompt)
Per the playbook: don't generate all 7 screens in a single pass.
1. **Define** — this document.
2. **Generate** — start with just Capture → Listening → Confirmation (the
   flagship single-task happy path, Strategy Opportunity A's top
   priority). Treat the output as a draft, not final.
3. **Audit** — check hierarchy, state completeness, color restraint, and
   whether it reads as a generic AI template.
4. **Polish pass** — a separate prompt, scope-locked to spacing,
   typography, and consistency only — no new features.
5. **Repeat Generate → Audit → Polish** for: batch dictation (Listening's
   progressive cards + Ramble-paused), then Task List, Recently Captured,
   Manual Entry, and Error/Retry.
6. **Validate** — final pass before treating anything as done.

## Open / placeholders
- Accent color (§7) is a placeholder — swap when Ihor decides on one.
- App name **Today** is confirmed (2026-07-19); logo/icon not designed yet.
- Desktop/native platform question still open (see [[Project]]) — this
  prompt assumes mobile-only for now.
