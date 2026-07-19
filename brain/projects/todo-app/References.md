---
type: references
project: todo-app
status: early / discovery
updated: 2026-07-19
---

# Design References

> Visual/interaction references Ihor is collecting for the surface layer.
> A working list of what's borrowed from where and why — not decisions by
> themselves, but several have already fed real decisions (linked below).

## Todoist — "Ramble" voice task input
Mobbin: https://mobbin.com/flows/e28f61ad-01f0-4d3e-8c0c-74e4045a7eed

Flow: manual add-task sheet has a mic icon → full-screen permission-priming
("Dictate tasks with Ramble") → Listening (example prompt shown, waveform,
pause/finish controls) → task cards appear progressively as each is
recognised, while still listening → pause state ("Ramble paused — resume or
tap ✓ to save what you've got") → tap ✓ → toast "2 tasks added" → Inbox.

**Takeaways:**
- Progressive card creation *during* listening — good precedent for our
  passive-confirmation idea; makes multi-task dictation feel alive instead
  of a black box.
- Still has one explicit tap to end a multi-task session and commit — not
  per-task confirmation (unlike Tiimo), but not fully zero-touch either.
  **Adopted for Opportunity B** (batch/evening planning) — see
  [[Flow-Voice-Capture]] and [[Decisions]] 2026-07-19.
- Voice lives *inside* the manual add-task sheet, secondary to typing —
  the opposite of our positioning (voice-first, dedicated landing screen).
  Confirms we should keep diverging here, not copy this part.
- "Try saying: '...'" example prompt shown while listening — worth
  borrowing to reduce "what do I say?" hesitation. Candidate for Capture's
  Listening state.
- Additional concrete details confirmed from 3 more screenshots
  (2026-07-19): final Inbox shows a "2 tasks added" toast pill, a red
  circular FAB (+) bottom-right for manual add, and a 4-tab bottom nav
  (Inbox / Today / Upcoming / Browse — Today has a count badge). Task rows:
  circle checkbox, title, then inline tags (date in green/purple by
  recency, project, priority flag) on one line below the title.

**2026-07-19 — visual direction decided:** replicate this flow closely —
layout, chrome, gradient, card shapes, controls — swap only the accent
color (Todoist red → placeholder, see [[Design-Prompt]]). Priority is that
it works and reads as Todoist-quality, not portfolio-safe originality —
see [[Decisions]].

## Tiimo — chat-based task creation
(screenshot shared 2026-07-19, no link yet)

Chat-thread UI, task card with icon/checkbox/duration, "Speak" button next
to a text input. Waits for an explicit "Create tasks" tap before saving.
**Not adopting that gate** — keeping the visual language (chat thread, task
card, dual voice/text input row), dropping the wait-for-tap step. See
[[Decisions]] 2026-07-19.

## Granola — AI meeting notes chat
(screenshot shared 2026-07-19, no link yet)

Chat UI answering "what do I have planned" from existing data, with
citation-style links back to source. Relevant to the optional "ask AI"
query feature Ihor floated (see [[Ideas]]) — not the core capture flow.

## Next
More visual references incoming (Ihor searching). Add each here with a
short takeaway before it feeds any decision.
