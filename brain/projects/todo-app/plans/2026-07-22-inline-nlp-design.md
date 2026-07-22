---
type: design
project: todo-app
feature: inline-nlp
status: active
created: 2026-07-22
---

# Inline natural-language parsing (typed compose)

Todoist-style: as the user TYPES a task, recognise date / time / priority words,
highlight them inline in the brand colour, live-populate the matching chips, and
strip those words from the title on save. Local + synchronous — no network, no LLM
round-trip (the existing `/api/parse` is voice-only and stays untouched).

Example: `подзвонити мамі завтра о 16:00` → title `подзвонити мамі`, Date = Tomorrow,
Time = 4:00 PM, with `завтра` and `о 16:00` highlighted while typing.

## Scope (v1)

Recognise **date + time + priority** only. No repeat, no deadline, no per-token
"dismiss this detection" — deleting the word is the undo.

## Architecture

- **`app/lib/nlp.ts`** — pure, synchronous, React-free. Signature:
  ```ts
  parse(text: string, days: DayInfo[], todayIndex: number): NlpResult
  interface NlpResult {
    segments: { text: string; kind: "plain" | "date" | "time" | "priority" }[];
    date: number | null;      // strip index
    time: TaskTime | null;
    priority: Priority | null;
    cleanTitle: string;       // text with all matched tokens removed + whitespace collapsed
  }
  ```
  Type-only imports so `node --test` (Node 24 native type-strip) runs it directly.
- **`app/components/HighlightedInput.tsx`** — transparent native `<input>` (source of
  truth) over a mirror layer that redraws the same text as spans, matched words in the
  brand colour. Shares one style object between input + mirror so they align exactly.
  Props: `value`, `segments`, `onChange`, `inputRef`, `placeholder`, `style`.
- **`ComposeSheet.tsx`** — swap the title `<input>` for `<HighlightedInput>`. Notes
  field unchanged.
- **`usePlanner.ts`** — `setDraft` additionally runs `parse()` and updates
  `draftDate/draftTime/draftPriority` under provenance rules (below). Stores the
  latest `segments` in state for the mirror.

## Grammar (bilingual UK + EN)

**Date:** `today/сьогодні`, `tomorrow/завтра`, `післязавтра`, weekdays full + short
(`friday/fri/пʼятниця/пт`, all 7). Weekday → nearest upcoming; if today matches that
weekday → today. Resolve against the passed `days`/`todayIndex` so it lands on the
day the user sees.

**Time:** `4pm`, `4:30 pm`, `16:00`, `о 16:00`, `о 4 ранку/дня/вечора/ночі`.
**Bare numbers are NOT time** — a match needs one of: am/pm marker, `:MM`, 24h ≥13, or
a Ukrainian part-of-day word. (Guards against "купити 3 яблука" → 3:00.)

**Priority:** `!!1…!!4`, `p1…p4` / `P1…P4`, plus an explicit phrase set
`urgent / high priority / терміново / важливо` → P1.

## Data flow

1. type → `onChange` → `setDraft(text)`
2. `setDraft` runs `parse(text, days, todayIndex)`
3. mirror redraws `segments`; chips reflect `date/time/priority`
4. on **Add/Enter** (and **Done** in edit mode) the task gets `cleanTitle`; date/time/
   priority come from the chips. Stripping happens only here (variant A).

## Edge cases

- **Manual chip vs typed.** Parsing only *sets/updates* a chip, never clears a
  manually-set one. Provenance flags (`dateFromNlp` etc.): if the parser set a value
  and its token is later deleted from the text, that value is cleared; a value the
  user set via a picker is never touched by typing.
- **Multiple matches:** last-mentioned date/time/priority wins (Todoist behaviour).
- **Highlight colour:** background `color-mix(in srgb, var(--app-accent) 15%, transparent)`
  + text `var(--app-accent-strong)` — identical to the active `chipOn` pair. No new colour.
- **Voice untouched:** `/api/parse`, live dictation, `finish()` fallback all unchanged.

## Tests

`app/lib/nlp.test.ts` via `node --test`: a case table `string → {date,time,priority,
cleanTitle}` across both languages, plus anti-cases ("купити 3 яблука", "call 3 people"
→ nothing matched). Mirror/chips/provenance verified in the browser at the end
(highlight visible, strip-on-save, deleting a token reverts only auto values).
