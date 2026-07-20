import type { DayInfo, Task } from "./types";

// The day strip is a rolling window centered on the real current day: TODAY_OFFSET
// days of history on the left, today in the middle, the rest upcoming. Length is
// fixed so the parser's day-index schema (parse.ts) stays constant regardless of
// what today happens to be.
export const STRIP_LENGTH = 21;
export const TODAY_OFFSET = 10;

const WD_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WD_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Build the day strip and today's index from a reference date. Pure: same date
 * in → same strip out, so it's safe to call during render / on the server.
 */
export function buildStrip(today: Date): { days: DayInfo[]; todayIndex: number } {
  // Normalize to local midnight so day arithmetic never straddles a DST hour.
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const days: DayInfo[] = Array.from({ length: STRIP_LENGTH }, (_, i) => {
    const diff = i - TODAY_OFFSET;
    const d = new Date(base);
    d.setDate(base.getDate() + diff);
    const wd = d.getDay();
    const full = WD_FULL[wd];
    const label =
      diff === 0
        ? "Today"
        : diff === -1
          ? "Yesterday"
          : diff === 1
            ? "Tomorrow"
            : full;
    return {
      n: d.getDate(),
      wd: WD_SHORT[wd],
      full,
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      isToday: diff === 0,
      label,
      dateLabel: `${MONTHS[d.getMonth()]} ${d.getDate()}${ordinal(d.getDate())}, ${d.getFullYear()}`,
    };
  });

  return { days, todayIndex: TODAY_OFFSET };
}

// ── Month calendar (for the Date / Deadline / custom-reminder pickers) ────────

/** One cell in a month grid. */
export interface MonthCell {
  /** Day of month, 1–31. */
  n: number;
  /** Calendar date, "YYYY-MM-DD". */
  iso: string;
  /** True for the real current day. */
  isToday: boolean;
  /** True for days strictly before today (dimmed / not selectable). */
  isPast: boolean;
}

export interface MonthGrid {
  year: number;
  /** 0–11. */
  month: number;
  /** Header title, e.g. "March 2026". */
  title: string;
  /**
   * 42 slots (6 weeks), Monday-first to match the reference calendars. Leading
   * and trailing padding slots are null so the weekday columns line up.
   */
  cells: (MonthCell | null)[];
}

/**
 * Build a Monday-first month grid. Pure: same (year, month, today) in → same
 * grid out. `today` sets the isToday / isPast flags.
 */
export function buildMonth(year: number, month: number, today: Date): MonthGrid {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const first = new Date(year, month, 1);
  // JS getDay(): 0=Sun … 6=Sat. Convert to Monday-first column 0=Mon … 6=Sun.
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (MonthCell | null)[] = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - lead + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    const d = new Date(year, month, dayNum);
    return {
      n: dayNum,
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      isToday: d.getTime() === base.getTime(),
      isPast: d.getTime() < base.getTime(),
    };
  });

  return { year, month, title: `${MONTHS[month]} ${year}`, cells };
}

/** Advance a (year, month) pair by ±1 month, rolling the year over. */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

// ── Quick date options (Today / Tomorrow / This Weekend / Next Week) ──────────

export type QuickDate = "today" | "tomorrow" | "weekend" | "nextweek";

/**
 * Resolve a quick-date option to a strip index. `todayWeekday` is JS getDay()
 * for the current day (0=Sun … 6=Sat). "weekend" = nearest upcoming Saturday,
 * "nextweek" = next Monday (never today). Pure.
 */
export function resolveQuick(kind: QuickDate, todayIndex: number, todayWeekday: number): number {
  switch (kind) {
    case "today":
      return todayIndex;
    case "tomorrow":
      return todayIndex + 1;
    case "weekend": {
      const untilSat = (6 - todayWeekday + 7) % 7; // 0 when today is Saturday
      return todayIndex + untilSat;
    }
    case "nextweek": {
      const untilMon = (1 - todayWeekday + 7) % 7 || 7; // never 0 → next Monday
      return todayIndex + untilMon;
    }
  }
}

// ── Display formatters ────────────────────────────────────────────────────────

/** "10:28" (24h) → "10:28 AM"; "13:05" → "1:05 PM". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${period}`;
}

/** 60 → "1 hr"; 90 → "1 hr 30 min"; 30 → "30 min"; 0/null → "". */
export function formatDuration(min: number | null): string {
  if (!min || min <= 0) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h} hr`);
  if (m) parts.push(`${m} min`);
  return parts.join(" ");
}

const REPEAT_LABEL: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

/** Human label for a repeat rule; "" for "none"/undefined. */
export function formatRepeat(rule: string | undefined): string {
  return rule && rule !== "none" ? REPEAT_LABEL[rule] ?? "" : "";
}

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/** "2026-02-03" → "Feb 3". */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${d}`;
}

/**
 * Derive the short meta label shown under a task title from its structured
 * date/time. Falls back to the stored `meta` string (voice/legacy) when no
 * structured time is set. "Today" is implicit and omitted.
 */
export function formatTaskMeta(task: Task, days: DayInfo[]): string | null {
  const label = days[task.day]?.label;
  const timeStr = task.time?.start ? formatTime(task.time.start) : null;
  const parts: string[] = [];
  if (label && label !== "Today") parts.push(label);
  if (timeStr) parts.push(timeStr);
  if (parts.length) return parts.join(" ");
  return task.meta ?? null;
}
