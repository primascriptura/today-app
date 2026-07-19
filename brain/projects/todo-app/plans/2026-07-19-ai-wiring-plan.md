# AI Wiring (voice → structured tasks) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stubbed voice flow so a spoken Ukrainian phrase becomes real, correctly-structured tasks — title, day, time-of-day, priority, notes — saved immediately, with a visible error when nothing is understood.

**Architecture:** Two halves. In the **browser**, the Web Speech API (`uk-UA`) turns speech into text. On the **server** (a Next.js Route Handler), Claude Haiku 4.5 turns that text into a JSON array of tasks against a strict schema. The Claude API key never leaves the server. The existing optimistic-save + confirmation-toast behaviour is reused unchanged.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, `@anthropic-ai/sdk`, browser Web Speech API (`webkitSpeechRecognition`).

## Global Constraints

- **Model:** `claude-haiku-4-5` only. No `thinking`, no `output_config.effort` (Haiku 4.5 rejects effort). Non-streaming (`messages.create`).
- **Structured output:** `output_config: { format: { type: "json_schema", schema: TASK_SCHEMA } }`. JSON-schema limits: no `minimum`/`maximum`/`minLength` — use `enum` for the day index.
- **Key security:** `ANTHROPIC_API_KEY` is read only inside the route handler via `process.env`. Never import the SDK or the key into any `"use client"` file.
- **Dictation language:** locked to `uk-UA`.
- **Priority source:** transcribed **words only** (e.g. «терміново», «asap», «до п'ятниці») — never audio tone.
- **Day model:** the week is the fixed demo week in `app/lib/data.ts` (`DAYS`, `DEFAULT_DAY = 4` = Thursday). "Today" = index 4. Claude maps relative day words to an index 0–6 against `DAYS`; no real-date math.
- **Never fail silently:** any failure (mic denied, nothing understood, network/parse error) routes to the existing `error` screen. Silent task loss is the worst outcome.
- **Next.js 16 caveat:** route-handler and config APIs differ from older Next. Before writing the route, skim `app/node_modules/next/dist/docs/` (per `app/AGENTS.md`).

---

### Task 1: Dependencies, env, shared parse types + schema

**Files:**
- Modify: `app/package.json` (add dependency)
- Create: `app/.env.local` (git-ignored; holds the key)
- Create: `app/lib/parse.ts` (shared types + JSON schema, imported by the route)
- Modify: `app/lib/types.ts` (add `notes` to `Task`)

**Interfaces:**
- Produces: `ParsedTask` (`{ title: string; day: number; slot: SlotKey; meta: string | null; priority: boolean; notes: string | null }`), `ParseResponse` (`{ tasks: ParsedTask[] }`), and `TASK_SCHEMA` (the JSON schema object) — all consumed by Task 2 and Task 4.

- [ ] **Step 1: Install the Anthropic SDK**

Run in `app/`:
```bash
npm install @anthropic-ai/sdk
```
Expected: `package.json` gains `"@anthropic-ai/sdk"` under `dependencies`; no errors.

- [ ] **Step 2: Create the local env file with the key**

Create `app/.env.local` (Ihor pastes his real key from console.anthropic.com):
```
ANTHROPIC_API_KEY=sk-ant-REPLACE_WITH_REAL_KEY
```
Confirm it is git-ignored — run in `app/`:
```bash
git check-ignore .env.local
```
Expected output: `.env.local` (meaning it is ignored). If nothing prints, add `.env*.local` to `app/.gitignore`.

- [ ] **Step 3: Add `notes` to the Task type**

In `app/lib/types.ts`, inside `interface Task`, add after the `priority?: boolean;` line:
```typescript
  /** Optional execution detail parsed from a dictation. Stored; not yet rendered. */
  notes?: string | null;
```

- [ ] **Step 4: Create the shared parse module**

Create `app/lib/parse.ts`:
```typescript
import type { SlotKey } from "./types";

/** One task as returned by the Claude parser (before it becomes a full Task). */
export interface ParsedTask {
  title: string;
  /** Index 0–6 into the fixed demo week (DAYS in data.ts). */
  day: number;
  slot: SlotKey;
  /** Short human label, e.g. "6:00 PM" or "Friday", or null. */
  meta: string | null;
  priority: boolean;
  notes: string | null;
}

export interface ParseResponse {
  tasks: ParsedTask[];
}

/** Strict JSON schema Claude must fill. `day` uses enum (schema forbids min/max). */
export const TASK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["tasks"],
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "day", "slot", "meta", "priority", "notes"],
        properties: {
          title: { type: "string" },
          day: { type: "integer", enum: [0, 1, 2, 3, 4, 5, 6] },
          slot: {
            type: "string",
            enum: ["morning", "afternoon", "evening", "anytime"],
          },
          meta: { type: ["string", "null"] },
          priority: { type: "boolean" },
          notes: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;
```

- [ ] **Step 5: Typecheck**

Run in `app/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/package.json app/package-lock.json app/lib/parse.ts app/lib/types.ts
git commit -m "feat: add Anthropic SDK + shared parse types and schema"
```
> Note: do not `git add app/.env.local` — it must stay out of git.

---

### Task 2: The `/api/parse` route (Claude call)

**Files:**
- Create: `app/app/api/parse/route.ts`

**Interfaces:**
- Consumes: `TASK_SCHEMA`, `ParseResponse` from `app/lib/parse.ts`; `DAYS`, `DEFAULT_DAY` from `app/lib/data.ts`.
- Produces: a `POST /api/parse` endpoint. Request body: `{ transcript: string }`. Response 200: `{ tasks: ParsedTask[] }`. Response 400 `{ error: "empty" }` for blank transcript; 502 `{ error: "parse" }` if Claude/JSON fails.

- [ ] **Step 1: Write the route handler**

Create `app/app/api/parse/route.ts`:
```typescript
import Anthropic from "@anthropic-ai/sdk";
import { DAYS, DEFAULT_DAY } from "@/lib/data";
import { TASK_SCHEMA, type ParseResponse } from "@/lib/parse";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

// The fixed demo week as context for relative-day resolution.
const WEEK = DAYS.map((d, i) => ({ index: i, weekday: d.full }));

const SYSTEM_PROMPT = `You turn a spoken Ukrainian to-do dictation into structured tasks.

The user dictates in Ukrainian; the transcript may contain ONE or SEVERAL tasks.
Extract every distinct task. For each task, return:
- title: a short, clean action in the user's language. Strip filler like
  "нагадай мені", "мені треба", "не забути".
- day: an integer 0–6 indexing this week. Resolve relative words against the
  week you are given and "today". "сьогодні" = today's index; "завтра" = the
  next index; a named weekday ("у п'ятницю") = that weekday's index. If no day
  is mentioned, use today's index.
- slot: "morning" (until ~11:59), "afternoon" (12:00–16:59), "evening"
  (17:00+), or "anytime" if no time is mentioned.
- meta: a short human label for the time/day if one was mentioned
  (e.g. "6:00 PM", "Friday"), otherwise null.
- priority: true ONLY when the words signal urgency ("терміново", "asap",
  "негайно", "до п'ятниці", "перш за все"). Judge by the words alone.
- notes: any extra execution detail mentioned, otherwise null.

If the transcript contains nothing task-like, return an empty tasks array.
Return ONLY the structured object.`;

export async function POST(req: Request) {
  let transcript = "";
  try {
    const body = await req.json();
    transcript = typeof body?.transcript === "string" ? body.transcript.trim() : "";
  } catch {
    return Response.json({ error: "empty" }, { status: 400 });
  }
  if (!transcript) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const userContent = [
    `Today is index ${DEFAULT_DAY} (${DAYS[DEFAULT_DAY].full}).`,
    `This week: ${JSON.stringify(WEEK)}.`,
    `Transcript: "${transcript}"`,
  ].join("\n");

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      output_config: { format: { type: "json_schema", schema: TASK_SCHEMA } },
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "parse" }, { status: 502 });
    }
    const parsed = JSON.parse(textBlock.text) as ParseResponse;
    return Response.json(parsed satisfies ParseResponse);
  } catch (err) {
    console.error("parse route error", err);
    return Response.json({ error: "parse" }, { status: 502 });
  }
}
```
> If TypeScript flags `output_config`, confirm `@anthropic-ai/sdk` is current (`npm view @anthropic-ai/sdk version` vs installed); the field is supported by structured outputs. Do not silently drop it.

- [ ] **Step 2: Typecheck**

Run in `app/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Smoke-test the route against real Claude**

Start the dev server (leave it running):
```bash
npm run dev
```
In a second terminal, POST a sample Ukrainian dictation:
```bash
curl -s -X POST http://localhost:3210/api/parse \
  -H "Content-Type: application/json" \
  -d '{"transcript":"завтра о шостій ранку купити молоко і терміново подзвонити в банк"}' | python3 -m json.tool
```
Expected: JSON with `tasks` containing **two** items — one "buy milk" style task with `day` = 5 (Friday), `slot` = "morning"; one "call the bank" task with `priority: true`. (Port is 3210 per the project's dev-server config; adjust if different.)

- [ ] **Step 4: Verify the empty-input guard**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3210/api/parse \
  -H "Content-Type: application/json" -d '{"transcript":"   "}'
```
Expected: `400`.

- [ ] **Step 5: Commit**

```bash
git add app/app/api/parse/route.ts
git commit -m "feat: add /api/parse route (Claude Haiku 4.5, uk-UA parsing)"
```

---

### Task 3: `useSpeech` — Web Speech API wrapper (uk-UA)

**Files:**
- Create: `app/lib/useSpeech.ts`

**Interfaces:**
- Produces: `useSpeech()` returning `{ isSupported: () => boolean; start: () => Promise<void>; stop: () => Promise<string>; abort: () => void }`. `start` resolves once recognition has begun (rejects `"no-mic"` / `"unsupported"`). `stop` resolves the accumulated final transcript (rejects `"no-speech"` if nothing was heard). Consumed by Task 4.

- [ ] **Step 1: Write the hook**

Create `app/lib/useSpeech.ts`:
```typescript
"use client";

import { useCallback, useRef } from "react";

export type SpeechError = "no-mic" | "no-speech" | "unsupported" | "aborted";

// Minimal shape of the browser SpeechRecognition we rely on.
interface SR {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getCtor(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

export function useSpeech() {
  const recRef = useRef<SR | null>(null);
  const finalRef = useRef("");
  // Resolver for stop(): set when recognition ends.
  const endResolveRef = useRef<((t: string) => void) | null>(null);
  const endRejectRef = useRef<((e: SpeechError) => void) | null>(null);
  const errorRef = useRef<SpeechError | null>(null);

  const isSupported = useCallback(() => getCtor() !== null, []);

  const start = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const Ctor = getCtor();
      if (!Ctor) {
        reject("unsupported" as SpeechError);
        return;
      }
      const rec = new Ctor();
      rec.lang = "uk-UA";
      rec.continuous = true;
      rec.interimResults = false;
      finalRef.current = "";
      errorRef.current = null;

      rec.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalRef.current += e.results[i][0].transcript + " ";
          }
        }
      };
      rec.onerror = (e: any) => {
        const code = e?.error;
        errorRef.current =
          code === "not-allowed" || code === "service-not-allowed"
            ? "no-mic"
            : code === "no-speech"
              ? "no-speech"
              : code === "aborted"
                ? "aborted"
                : "no-speech";
      };
      rec.onend = () => {
        const text = finalRef.current.trim();
        if (endResolveRef.current) {
          if (!text && errorRef.current) {
            endRejectRef.current?.(errorRef.current);
          } else if (!text) {
            endRejectRef.current?.("no-speech");
          } else {
            endResolveRef.current(text);
          }
          endResolveRef.current = null;
          endRejectRef.current = null;
        }
      };
      rec.onstart = () => resolve();

      recRef.current = rec;
      try {
        rec.start();
      } catch {
        reject("no-mic" as SpeechError);
      }
    });
  }, []);

  const stop = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      const rec = recRef.current;
      if (!rec) {
        reject("aborted" as SpeechError);
        return;
      }
      endResolveRef.current = resolve;
      endRejectRef.current = reject;
      rec.stop(); // triggers onend → resolves/rejects above
    });
  }, []);

  const abort = useCallback(() => {
    const rec = recRef.current;
    endResolveRef.current = null;
    endRejectRef.current = null;
    if (rec) rec.abort();
    recRef.current = null;
  }, []);

  return { isSupported, start, stop, abort };
}
```

- [ ] **Step 2: Typecheck**

Run in `app/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/lib/useSpeech.ts
git commit -m "feat: add useSpeech hook (Web Speech API, uk-UA, isolated for later swap)"
```

---

### Task 4: Wire speech + parsing into `usePlanner`

**Files:**
- Modify: `app/lib/usePlanner.ts` (replace the stubbed `tapMic` / `finish` / `retry` / `cancel`; lines ~99–146)

**Interfaces:**
- Consumes: `useSpeech()` from `app/lib/useSpeech.ts`; `ParseResponse`, `ParsedTask` from `app/lib/parse.ts`; `DEFAULT_DAY` from `app/lib/data.ts`.
- Produces: the same `actions` surface (`tapMic`, `cancel`, `finish`, `retry`, …) so no view component changes.

- [ ] **Step 1: Import the hook and parse types**

At the top of `app/lib/usePlanner.ts`, add to the existing imports:
```typescript
import { DEFAULT_DAY } from "./data";
import type { ParseResponse, ParsedTask } from "./parse";
import { useSpeech } from "./useSpeech";
```
(`DEFAULT_DAY` may already be imported via `./data` alongside `SEED_TASKS` — merge, don't duplicate.)

- [ ] **Step 2: Instantiate the speech hook inside `usePlanner`**

Immediately after `const [hydrated, setHydrated] = useState(false);`, add:
```typescript
  const speech = useSpeech();
```

- [ ] **Step 3: Add the ParsedTask → Task mapper**

Above the `tapMic` definition, add a helper:
```typescript
  // Turn a parsed task into a full Task landing on the correct demo-week day.
  const toTask = useCallback((p: ParsedTask, offset: number): Task => ({
    id: Date.now() + offset,
    title: p.title,
    meta: p.meta,
    when: p.day === DEFAULT_DAY ? "today" : "later",
    slot: p.slot,
    day: p.day,
    icon: "dot",
    tint: "#e6e9f7",
    priority: p.priority,
    notes: p.notes,
  }), []);
```

- [ ] **Step 4: Replace `tapMic` to start real listening**

Replace the existing `tapMic` with:
```typescript
  const tapMic = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, screen: "listening", paused: false, composing: false }));
    speech.start().catch(() => {
      // Mic denied or unsupported → surface the error screen, never silent.
      setState((s) => ({ ...s, screen: "error" }));
    });
  }, [clearTimers, speech]);
```

- [ ] **Step 5: Replace `finish` to stop, parse, and append real tasks**

Replace the existing `finish` (the hardcoded "Follow up on job interview" block) with:
```typescript
  const finish = useCallback(async () => {
    clearTimers();
    setState((s) => ({ ...s, screen: "processing" }));
    try {
      const transcript = await speech.stop();
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) throw new Error("parse failed");
      const data = (await res.json()) as ParseResponse;
      if (!data.tasks.length) throw new Error("no tasks");

      const newTasks = data.tasks.map((p, i) => toTask(p, i));
      setState((s) => ({ ...s, screen: "confirmation", tasks: [...newTasks, ...s.tasks] }));
      later(() => {
        setState((s) => (s.screen === "confirmation" ? { ...s, screen: "tasks" } : s));
      }, 3000);
    } catch {
      // Nothing understood / network / parse error → visible error, never silent.
      setState((s) => ({ ...s, screen: "error" }));
    }
  }, [clearTimers, later, speech, toTask]);
```

- [ ] **Step 6: Update `cancel` and `retry` to drive real recognition**

Replace `cancel`:
```typescript
  const cancel = useCallback(() => {
    clearTimers();
    speech.abort();
    setState((s) => ({ ...s, screen: "tasks" }));
  }, [clearTimers, speech]);
```
Replace `retry`:
```typescript
  const retry = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, screen: "listening", paused: false }));
    speech.start().catch(() => {
      setState((s) => ({ ...s, screen: "error" }));
    });
  }, [clearTimers, speech]);
```

- [ ] **Step 7: Typecheck**

Run in `app/`:
```bash
npx tsc --noEmit
```
Expected: no errors. (If `Task` complains about `notes`, confirm Task 1 Step 3 was applied.)

- [ ] **Step 8: Commit**

```bash
git add app/lib/usePlanner.ts
git commit -m "feat: wire real speech capture + Claude parsing into the voice flow"
```

---

### Task 5: End-to-end verification on a real browser + confirmation-count copy

**Files:**
- Modify: `app/components/ConfirmationToast.tsx` (show the real task count — verify current copy first)

**Interfaces:**
- Consumes: everything from Tasks 1–4.

- [ ] **Step 1: Confirm the confirmation copy reflects count**

Read `app/components/ConfirmationToast.tsx`. If it hardcodes a single-task message, update it to read the count (e.g. "Saved" for one, "Saved N tasks" for many). If it already renders from state, leave it. Keep the change minimal — copy only.

- [ ] **Step 2: Build check**

Run in `app/`:
```bash
npm run build
```
Expected: build succeeds (this also compiles the route handler).

- [ ] **Step 3: Manual voice test — REAL browser (not the automated preview)**

> The automated preview browser is headless and has no microphone; Web Speech API cannot be tested there. Test in **desktop Chrome** (or a phone) with a mic.

Recipe:
1. `npm run dev`, open `http://localhost:3210` in **Chrome**.
2. Tap the mic → allow microphone access when prompted.
3. Say (Ukrainian): «завтра о шостій вечора зустріч з Сергієм і купити подарунок».
4. Tap Finish.
5. Expected: two tasks appear — a "meeting with Serhii" task on Friday/evening and a "buy a gift" task; a "✓ Saved 2 tasks" confirmation shows, then dismisses after ~3s.

- [ ] **Step 4: Manual error-path tests — REAL browser**

1. **Mic denied:** in Chrome site settings block the mic, reload, tap mic → the Error/Retry screen appears (not a silent nothing).
2. **Nothing said:** tap mic, stay silent, tap Finish → Error/Retry screen.
3. **No network:** DevTools → Network → Offline, dictate, Finish → Error/Retry screen.

- [ ] **Step 5: Commit**

```bash
git add app/components/ConfirmationToast.tsx
git commit -m "feat: confirmation reflects parsed task count; verify AI voice flow end-to-end"
```

---

## Notes for the implementer

- **iOS Safari + Ukrainian** is the known weak spot in Step 3/4 of Task 5 (browser transcription, not Claude). If quality is poor on iPhone, that is the trigger to add a paid transcription API behind the *same* `useSpeech` interface — no other file changes needed. Deferred by decision (see the design spec).
- **Pause button** stays visual-only in this pass (Web Speech API has no clean pause). Not wired to recognition.
- **Do not commit `app/.env.local`.**
- Verification here is typecheck + `build` + a real-Claude route smoke test + manual real-browser voice testing — the project has no unit-test runner, and the voice path is mic/permission-bound, so a jest/vitest harness would add nothing testable for this feature.
