// Core domain types for Today. Mirrors brain/Concept-Model.md: a Task is the
// one concrete thing to do; a Dictation (voice) is captured via the Web Speech
// API and parsed into Tasks live, one card per recognized phrase.

export type IconKey =
  // Task-category glyphs (seed data + AI-assigned per dictated task).
  | "brief"
  | "mail"
  | "users"
  | "card"
  | "home"
  | "phone"
  | "cart"
  | "heart"
  | "activity"
  | "book"
  | "plane"
  | "food"
  | "doc"
  | "pen"
  | "gift"
  | "calendar"
  // Time-of-day glyphs (used by the slot headers, not task categories).
  | "sunrise"
  | "sun"
  | "moon"
  | "clock"
  // Generic fallback when nothing fits.
  | "dot";

export type SlotKey = "morning" | "afternoon" | "evening" | "anytime";

/** today = due today, later = due on a future/other day (drives the meta color). */
export type WhenKind = "today" | "later";

/**
 * Priority level, Todoist-style: 1 = P1 (highest, red) … 4 = no priority
 * (default). Stored as a number so TaskRow can colour the flag per level.
 */
export type Priority = 1 | 2 | 3 | 4;

/** Time of day a task is scheduled for, with an optional duration. */
export interface TaskTime {
  /** Start time, 24h "HH:MM" (e.g. "10:28"). */
  start: string;
  /** Duration in minutes; null when no duration is set. */
  durationMin: number | null;
}

/** A hard due date (distinct from `day`, which is when you plan to do it). */
export interface Deadline {
  /** Calendar date, "YYYY-MM-DD". */
  iso: string;
  /** Optional time of day, 24h "HH:MM"; null for an all-day deadline. */
  time: string | null;
}

/** A single reminder alert at an absolute date + time. */
export interface Reminder {
  id: number;
  /** Calendar date, "YYYY-MM-DD". */
  iso: string;
  /** Time of day, 24h "HH:MM". */
  time: string;
}

/** How often a task recurs. "none" = one-off (the default). */
export type RepeatRule = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Task {
  id: number;
  title: string;
  /**
   * Short human label shown under the title, e.g. "11:00 AM" or "Friday".
   * Now derived from the structured date/time via formatTaskMeta; kept as a
   * field only as a fallback for voice/legacy data.
   */
  meta: string | null;
  when: WhenKind;
  slot: SlotKey;
  /** Index into the day strip this task belongs to — the "when" source of truth. */
  day: number;
  /** Optional time of day + duration for the scheduled day. */
  time?: TaskTime | null;
  /** Recurrence rule; defaults to "none". */
  repeat?: RepeatRule;
  /** Optional hard due date, separate from the planned `day`. */
  deadline?: Deadline | null;
  /** Zero or more reminder alerts. */
  reminders?: Reminder[];
  icon: IconKey;
  /** Pastel background behind the task's icon. */
  tint: string;
  /** Priority level 1–4 (4 = none); undefined is treated as 4. */
  priority?: Priority;
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
  /** Full weekday name (Sunday, …). */
  full: string;
  /** Calendar date as YYYY-MM-DD — the stable identity of this day. */
  iso: string;
  /** True for the real current day. Drives the "today" marker in the strip. */
  isToday: boolean;
  /**
   * Human title for the header: "Today" / "Yesterday" / "Tomorrow" for the
   * three days around now, otherwise the full weekday name.
   */
  label: string;
  /** Full date line under the header, e.g. "July 19th, 2026". */
  dateLabel: string;
}

export interface SlotInfo {
  key: SlotKey;
  label: string;
  tint: string;
  ic: IconKey;
}
