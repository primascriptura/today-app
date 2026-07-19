// Core domain types for Today. Mirrors brain/Concept-Model.md: a Task is the
// one concrete thing to do; a Dictation (voice) is stubbed for now (no AI yet).

export type IconKey =
  | "brief"
  | "mail"
  | "users"
  | "card"
  | "home"
  | "sunrise"
  | "sun"
  | "moon"
  | "clock"
  | "dot";

export type SlotKey = "morning" | "afternoon" | "evening" | "anytime";

/** today = due today, later = due on a future/other day (drives the meta color). */
export type WhenKind = "today" | "later";

export interface Task {
  id: number;
  title: string;
  /** Short human label shown under the title, e.g. "11:00 AM" or "Friday". */
  meta: string | null;
  when: WhenKind;
  slot: SlotKey;
  /** Index into the day strip (0–6) this task belongs to. */
  day: number;
  icon: IconKey;
  /** Pastel background behind the task's icon. */
  tint: string;
  priority?: boolean;
  /** Optional execution detail parsed from a dictation. Stored; not yet rendered. */
  notes?: string | null;
}

/** The top-level screen the app is showing. */
export type Screen =
  | "tasks"
  | "listening"
  | "processing"
  | "error"
  | "confirmation";

export interface DayInfo {
  /** Day-of-month number shown in the strip chip. */
  n: number;
  /** Short weekday label (Sun, Mon, …). */
  wd: string;
  /** Full weekday name used in the header title. */
  full: string;
}

export interface SlotInfo {
  key: SlotKey;
  label: string;
  tint: string;
  ic: IconKey;
}
