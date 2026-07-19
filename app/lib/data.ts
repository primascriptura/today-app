import type { IconKey, SlotInfo, Task } from "./types";

export const SLOTS: SlotInfo[] = [
  // Anytime first: newly captured / unscheduled tasks land here, so keeping the
  // group at the top means a just-added task is visible without scrolling.
  { key: "anytime", label: "ANYTIME", tint: "#efece6", ic: "clock" },
  { key: "morning", label: "MORNING", tint: "#fbe9dc", ic: "sunrise" },
  { key: "afternoon", label: "AFTERNOON", tint: "#e6ecf6", ic: "sun" },
  { key: "evening", label: "EVENING", tint: "#e9e6f2", ic: "moon" },
];

// Seed tasks — shown on first load, then persisted to localStorage. All land on
// the real current day (todayIndex) so a fresh install opens on a populated
// "Today" rather than a fixed demo date.
export function makeSeedTasks(todayIndex: number): Task[] {
  return [
    { id: 1, title: "Follow up on job interview", meta: "11:00 AM", when: "today", slot: "morning", day: todayIndex, icon: "brief", tint: "#e6e9f7" },
    { id: 2, title: "Reply to Sam about the invoice", meta: "Today", when: "today", slot: "morning", day: todayIndex, icon: "mail", tint: "#e4f3e6" },
    { id: 3, title: "Team standup", meta: "2:00 PM", when: "today", slot: "afternoon", day: todayIndex, icon: "users", tint: "#f6e7f0" },
    { id: 4, title: "Pay utility bills", meta: "10:00 AM", when: "today", slot: "afternoon", day: todayIndex, icon: "card", tint: "#fdeede" },
    { id: 5, title: "Do laundry", meta: "10:00 PM", when: "today", slot: "evening", day: todayIndex, icon: "home", tint: "#e9e6f7" },
  ];
}

export const DATE_COLOR: Record<string, string> = {
  today: "#1f9d55",
  later: "#6b4ea8",
};

// Soft pastel behind each task icon, keyed by category so a given kind of task
// always reads with the same colour. Falls back to lavender for anything unset.
export const ICON_TINTS: Record<IconKey, string> = {
  brief: "#e6e9f7",
  mail: "#e4f3e6",
  users: "#f6e7f0",
  card: "#fdeede",
  home: "#e9e6f7",
  phone: "#e2eef7",
  cart: "#eef3e0",
  heart: "#fce4e8",
  activity: "#e0f0ec",
  book: "#f3ecda",
  plane: "#e2edf7",
  food: "#fbeadb",
  doc: "#eceef2",
  pen: "#efe8f5",
  gift: "#f9e6ef",
  calendar: "#e6ecf6",
  sunrise: "#fbe9dc",
  sun: "#e6ecf6",
  moon: "#e9e6f2",
  clock: "#efece6",
  dot: "#e6e9f7",
};
