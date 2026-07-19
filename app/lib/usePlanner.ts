"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_DAY, SEED_TASKS } from "./data";
import type { ParseResponse, ParsedTask } from "./parse";
import type { Screen, SlotKey, Task } from "./types";
import { useSpeech } from "./useSpeech";

const STORAGE_KEY = "today.v1";

interface Persisted {
  tasks: Task[];
  done: number;
}

interface PlannerState {
  screen: Screen;
  tasks: Task[];
  sel: number;
  paused: boolean;
  composing: boolean;
  draft: string;
  chipDate: boolean;
  chipPriority: boolean;
  collapsed: Record<string, boolean>;
  swipe: { id: number; dx: number } | null;
  leaving: { id: number; kind: "complete" | "delete" } | null;
  done: number;
}

const initialState: PlannerState = {
  screen: "tasks",
  tasks: SEED_TASKS,
  sel: DEFAULT_DAY,
  paused: false,
  composing: false,
  draft: "",
  chipDate: false,
  chipPriority: false,
  collapsed: {},
  swipe: null,
  leaving: null,
  done: 0,
};

export function usePlanner() {
  const [state, setState] = useState<PlannerState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const speech = useSpeech();

  // Timers driving the stubbed voice flow + row-leave animations.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  // Pointer-swipe scratch state (mirrors the design's this._sw).
  const swipeRef = useRef<{ id: number; x0: number } | null>(null);

  // ── Persistence ──────────────────────────────────────────────────────────
  // Load once on mount (client only), so SSR + first render stay deterministic.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        if (Array.isArray(parsed.tasks)) {
          // SSR-safe rehydration: server + first client render use the seed
          // (so hydration matches); this swaps in stored data right after mount.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState((s) => ({
            ...s,
            tasks: parsed.tasks as Task[],
            done: typeof parsed.done === "number" ? parsed.done : 0,
          }));
        }
      }
    } catch {
      // Corrupt / unavailable storage — fall back to seed data.
    }
    setHydrated(true);
    return clearTimers;
  }, [clearTimers]);

  // Persist whenever the durable data changes (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: Persisted = { tasks: state.tasks, done: state.done };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota / privacy-mode errors.
    }
  }, [hydrated, state.tasks, state.done]);

  // ── Voice flow (real: Web Speech API → /api/parse → tasks) ────────────────
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

  const tapMic = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, screen: "listening", paused: false, composing: false }));
    speech.start().catch(() => {
      // Mic denied or unsupported → surface the error screen, never silent.
      setState((s) => ({ ...s, screen: "error" }));
    });
  }, [clearTimers, speech]);

  const cancel = useCallback(() => {
    clearTimers();
    speech.abort();
    setState((s) => ({ ...s, screen: "tasks" }));
  }, [clearTimers, speech]);

  const togglePause = useCallback(() => {
    setState((s) => ({ ...s, paused: !s.paused }));
  }, []);

  // Finish: stop listening, parse the transcript into structured tasks, and
  // append them optimistically. Any failure routes to the error screen.
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

  const dismiss = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, screen: "tasks" }));
  }, [clearTimers]);

  const retry = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, screen: "listening", paused: false }));
    speech.start().catch(() => {
      setState((s) => ({ ...s, screen: "error" }));
    });
  }, [clearTimers, speech]);

  // ── Day strip ─────────────────────────────────────────────────────────────
  const selectDay = useCallback((i: number) => {
    if (i < 0 || i > 6) return;
    setState((s) => ({ ...s, sel: i, swipe: null }));
  }, []);

  const toggleSlot = useCallback((k: SlotKey) => {
    setState((s) => ({
      ...s,
      collapsed: { ...s.collapsed, [k]: !s.collapsed[k] },
    }));
  }, []);

  // ── Compose (manual entry) ────────────────────────────────────────────────
  const openCompose = useCallback(() => {
    setState((s) => ({ ...s, composing: true }));
  }, []);

  const closeCompose = useCallback(() => {
    setState((s) => ({ ...s, composing: false }));
  }, []);

  const setDraft = useCallback((value: string) => {
    setState((s) => ({ ...s, draft: value }));
  }, []);

  const toggleDate = useCallback(() => {
    setState((s) => ({ ...s, chipDate: !s.chipDate }));
  }, []);

  const togglePriority = useCallback(() => {
    setState((s) => ({ ...s, chipPriority: !s.chipPriority }));
  }, []);

  const addTyped = useCallback(() => {
    setState((s) => {
      const title = s.draft.trim();
      if (!title) return s;
      const task: Task = {
        id: Date.now(),
        title,
        meta: s.chipDate ? "Today" : null,
        when: "today",
        slot: "anytime",
        day: s.sel,
        icon: "dot",
        tint: "#e6e9f7",
        priority: s.chipPriority,
      };
      return {
        ...s,
        tasks: [task, ...s.tasks],
        composing: false,
        draft: "",
        chipDate: false,
        chipPriority: false,
      };
    });
  }, []);

  const typeInstead = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, screen: "tasks", composing: true }));
  }, [clearTimers]);

  // ── Task actions ──────────────────────────────────────────────────────────
  const complete = useCallback(
    (id: number) => {
      setState((s) => {
        if (s.leaving) return s;
        return { ...s, leaving: { id, kind: "complete" }, done: s.done + 1 };
      });
      later(() => {
        setState((s) => ({
          ...s,
          tasks: s.tasks.filter((t) => t.id !== id),
          leaving: null,
        }));
      }, 340);
    },
    [later],
  );

  const remove = useCallback(
    (id: number) => {
      setState((s) => {
        if (s.leaving) return s;
        return { ...s, leaving: { id, kind: "delete" }, swipe: null };
      });
      later(() => {
        setState((s) => ({
          ...s,
          tasks: s.tasks.filter((t) => t.id !== id),
          leaving: null,
        }));
      }, 340);
    },
    [later],
  );

  // ── Swipe-to-delete ───────────────────────────────────────────────────────
  const swStart = useCallback((e: React.PointerEvent, id: number) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture unsupported — swipe still tracks via move events.
    }
    swipeRef.current = { id, x0: e.clientX };
  }, []);

  const swMove = useCallback((e: React.PointerEvent) => {
    const sw = swipeRef.current;
    if (!sw) return;
    let dx = e.clientX - sw.x0;
    if (dx > 0) dx = 0;
    if (dx < -170) dx = -170;
    setState((s) => ({ ...s, swipe: { id: sw.id, dx } }));
  }, []);

  const swEnd = useCallback(() => {
    const sw = swipeRef.current;
    if (!sw) return;
    swipeRef.current = null;
    setState((s) => {
      if (s.swipe && s.swipe.id === sw.id && s.swipe.dx < -95) {
        // Past threshold → delete (deferred so the animation can run).
        later(() => remove(sw.id), 0);
        return s;
      }
      return { ...s, swipe: null };
    });
  }, [later, remove]);

  return {
    state,
    hydrated,
    actions: {
      tapMic,
      cancel,
      togglePause,
      finish,
      dismiss,
      retry,
      selectDay,
      toggleSlot,
      openCompose,
      closeCompose,
      setDraft,
      toggleDate,
      togglePriority,
      addTyped,
      typeInstead,
      complete,
      remove,
      swStart,
      swMove,
      swEnd,
    },
  };
}

export type PlannerActions = ReturnType<typeof usePlanner>["actions"];
