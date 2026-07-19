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
