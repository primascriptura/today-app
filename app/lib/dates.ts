import type { DayInfo } from "./types";

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
