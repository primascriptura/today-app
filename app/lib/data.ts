import type { DayInfo, SlotInfo, Task } from "./types";

// The demo week — a fixed Jan 2026 week, matching the source design.
// "Today" is index 4 (Thursday, Jan 15). Real date wiring comes later.
export const DEFAULT_DAY = 4;

export const DAYS: DayInfo[] = [
  { n: 11, wd: "Sun", full: "Sunday" },
  { n: 12, wd: "Mon", full: "Monday" },
  { n: 13, wd: "Tue", full: "Tuesday" },
  { n: 14, wd: "Wed", full: "Wednesday" },
  { n: 15, wd: "Thu", full: "Thursday" },
  { n: 16, wd: "Fri", full: "Friday" },
  { n: 17, wd: "Sat", full: "Saturday" },
];

export const SLOTS: SlotInfo[] = [
  // Anytime first: newly captured / unscheduled tasks land here, so keeping the
  // group at the top means a just-added task is visible without scrolling.
  { key: "anytime", label: "ANYTIME", tint: "#efece6", ic: "clock" },
  { key: "morning", label: "MORNING", tint: "#fbe9dc", ic: "sunrise" },
  { key: "afternoon", label: "AFTERNOON", tint: "#e6ecf6", ic: "sun" },
  { key: "evening", label: "EVENING", tint: "#e9e6f2", ic: "moon" },
];

// Seed tasks — shown on first load, then persisted to localStorage.
export const SEED_TASKS: Task[] = [
  { id: 1, title: "Follow up on job interview", meta: "11:00 AM", when: "later", slot: "morning", day: 4, icon: "brief", tint: "#e6e9f7" },
  { id: 2, title: "Reply to Sam about the invoice", meta: "Today", when: "today", slot: "morning", day: 4, icon: "mail", tint: "#e4f3e6" },
  { id: 3, title: "Team standup", meta: "2:00 PM", when: "today", slot: "afternoon", day: 4, icon: "users", tint: "#f6e7f0" },
  { id: 4, title: "Pay utility bills", meta: "Friday", when: "later", slot: "afternoon", day: 4, icon: "card", tint: "#fdeede" },
  { id: 5, title: "Do laundry", meta: "10:00 PM", when: "today", slot: "evening", day: 4, icon: "home", tint: "#e9e6f7" },
];

export const DATE_COLOR: Record<string, string> = {
  today: "#1f9d55",
  later: "#6b4ea8",
};
