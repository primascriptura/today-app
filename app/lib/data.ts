import { STRIP_LENGTH } from "./dates";
import type { IconKey, SlotInfo, SlotKey, Task } from "./types";

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
    ...makeFillerTasks(todayIndex),
  ];
}

// Generic tasks scattered across the OTHER days of the strip, so paging to any
// day (past or future) never shows the empty state on a fresh install.
const FILLER_POOL: { title: string; slot: SlotKey; icon: IconKey; meta: string }[] = [
  { title: "Morning stretch", slot: "morning", icon: "activity", meta: "7:30 AM" },
  { title: "Check emails", slot: "morning", icon: "mail", meta: "9:00 AM" },
  { title: "Water the plants", slot: "morning", icon: "home", meta: "8:00 AM" },
  { title: "Read a chapter", slot: "morning", icon: "book", meta: "8:30 AM" },
  { title: "Grocery shopping", slot: "afternoon", icon: "cart", meta: "1:00 PM" },
  { title: "Call a friend", slot: "afternoon", icon: "phone", meta: "3:00 PM" },
  { title: "Gym session", slot: "afternoon", icon: "activity", meta: "5:00 PM" },
  { title: "Plan next trip", slot: "afternoon", icon: "plane", meta: "4:00 PM" },
  { title: "Cook dinner", slot: "evening", icon: "food", meta: "7:00 PM" },
  { title: "Journal for 10 min", slot: "evening", icon: "pen", meta: "9:00 PM" },
  { title: "Tidy up the house", slot: "evening", icon: "home", meta: "8:00 PM" },
  { title: "Watch an episode", slot: "evening", icon: "dot", meta: "9:30 PM" },
];

// Integer-only hash (no Math.random()/Date.now()) so the "shuffle" is a pure
// function of the day index — identical on the server render and the client
// hydration pass, unlike Math.random() which would mismatch between them.
function hash32(n: number): number {
  let a = n | 0;
  a = Math.imul(a ^ (a >>> 16), 0x45d9f3b);
  a = Math.imul(a ^ (a >>> 16), 0x45d9f3b);
  return (a ^ (a >>> 16)) >>> 0;
}

/** 2–3 deterministically-picked filler tasks for every day except today. */
function makeFillerTasks(todayIndex: number): Task[] {
  const tasks: Task[] = [];
  for (let day = 0; day < STRIP_LENGTH; day++) {
    if (day === todayIndex) continue;
    const count = 2 + (hash32(day * 97 + 1) % 2); // 2 or 3
    const used = new Set<number>();
    for (let i = 0; i < count; i++) {
      let idx = hash32(day * 97 + i * 13 + 7) % FILLER_POOL.length;
      while (used.has(idx)) idx = (idx + 1) % FILLER_POOL.length;
      used.add(idx);
      const f = FILLER_POOL[idx];
      tasks.push({
        id: 9000 + day * 10 + i,
        title: f.title,
        meta: f.meta,
        when: "later",
        slot: f.slot,
        day,
        icon: f.icon,
        tint: ICON_TINTS[f.icon],
      });
    }
  }
  return tasks;
}

export const DATE_COLOR: Record<string, string> = {
  today: "#1f9d55",
  later: "#6b4ea8",
};

// On-brand confetti palette for the one-time first-task-completion
// celebration — cycled per piece, never randomized off-brand/rainbow.
export const CONFETTI_COLORS = ["#3b4b8c", "#2c3866", "#b7bfe4"];

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
