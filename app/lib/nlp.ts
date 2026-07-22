import type { DayInfo, Priority, TaskTime } from "./types";

// Local, synchronous natural-language parsing for the typed compose field.
// Recognises date / time / priority words as the user types, so the title can be
// cleaned and the matching chips populated without a network round-trip. Voice
// keeps using /api/parse — this is text-only.

export type SegmentKind = "plain" | "date" | "time" | "priority";

export interface Segment {
  text: string;
  kind: SegmentKind;
}

export interface NlpResult {
  /** The input split into runs; matched runs tagged by kind (for the highlight mirror). */
  segments: Segment[];
  /** Strip index of the recognised day, or null. */
  date: number | null;
  time: TaskTime | null;
  priority: Priority | null;
  /** Title with every matched token removed and whitespace collapsed. */
  cleanTitle: string;
}

// ── Matcher plumbing ────────────────────────────────────────────────────────
type Kind = Exclude<SegmentKind, "plain">;

interface Matcher {
  kind: Kind;
  re: RegExp;
  /** Turn a successful match into the field value, or null to reject it. */
  resolve: (m: RegExpExecArray, ctx: Ctx) => number | TaskTime | Priority | null;
}

interface Ctx {
  days: DayInfo[];
  todayIndex: number;
}

// Unicode-aware word boundaries: \b is ASCII-only, so it misbehaves around
// Cyrillic. Wrap every pattern so a token can't start/end inside another word.
const NB = "(?<![\\p{L}\\p{N}])";
const NA = "(?![\\p{L}\\p{N}])";
// Optional leading connector consumed WITH the token so it's stripped too
// ("meeting at 4pm" → "meeting", "здати у пʼятницю" → "здати").
const CONN = "(?:(?:on|at|у|в|о|на)\\s+)?";

const boundary = (core: string, flags = "") =>
  new RegExp(`${NB}${core}${NA}`, `gdu${flags}`);

const pad = (n: number) => String(n).padStart(2, "0");
const time = (h: number, m: number): TaskTime => ({ start: `${pad(h)}:${pad(m)}`, durationMin: null });

// Weekday → JS getDay() index isn't needed; we match against days[].full names.
const WEEKDAYS: { name: string; alt: string }[] = [
  { name: "Monday", alt: "monday|mon|понеділ\\p{L}*|пн" },
  { name: "Tuesday", alt: "tuesday|tue|вівтор\\p{L}*|вт" },
  { name: "Wednesday", alt: "wednesday|wed|серед\\p{L}*|ср" },
  { name: "Thursday", alt: "thursday|thu|четвер\\p{L}*|чт" },
  { name: "Friday", alt: "friday|fri|п['ʼ’]?ятниц\\p{L}*|пт" },
  { name: "Saturday", alt: "saturday|sat|субот\\p{L}*|сб" },
  { name: "Sunday", alt: "sunday|sun|неділ\\p{L}*|нд" },
];

function upcomingWeekday(name: string, ctx: Ctx): number | null {
  for (let i = ctx.todayIndex; i < ctx.days.length; i++) {
    if (ctx.days[i].full === name) return i;
  }
  return null;
}

const clampDay = (i: number, ctx: Ctx): number =>
  Math.max(0, Math.min(ctx.days.length - 1, i));

// Convert an Ukrainian "<hour> <part-of-day>" pair to a 24h hour.
function ukHour(h: number, part: string): number {
  if (/ранку|ранок|вранці/.test(part)) return h === 12 ? 0 : h;
  if (/дня|день/.test(part)) return h === 12 ? 12 : h + 12;
  if (/вечора|вечір|ввечері/.test(part)) return h < 12 ? h + 12 : h;
  // ночі / ніч: early hours stay AM, late hours are PM-side.
  if (h === 12) return 0;
  return h >= 9 ? h + 12 : h;
}

const MATCHERS: Matcher[] = [
  // Priority: !!N, pN, explicit words → level.
  {
    kind: "priority",
    re: boundary("!{1,2}([1-4])"),
    resolve: (m) => Number(m[1]) as Priority,
  },
  {
    kind: "priority",
    re: boundary("p([1-4])", "i"),
    resolve: (m) => Number(m[1]) as Priority,
  },
  {
    kind: "priority",
    re: boundary("urgent|high priority|терміново|важливо", "i"),
    resolve: () => 1,
  },
  // Time: clock with colon (optional am/pm), hour+am/pm, Ukrainian hour+part.
  {
    kind: "time",
    re: boundary(`${CONN}([01]?\\d|2[0-3]):([0-5]\\d)\\s*(am|pm)?`, "i"),
    resolve: (m) => {
      let h = Number(m[1]);
      const min = Number(m[2]);
      const mer = m[3]?.toLowerCase();
      if (mer === "pm") h = h === 12 ? 12 : h + 12;
      else if (mer === "am") h = h === 12 ? 0 : h;
      if (h > 23) return null;
      return time(h, min);
    },
  },
  {
    kind: "time",
    re: boundary(`${CONN}(\\d{1,2})\\s*(am|pm)`, "i"),
    resolve: (m) => {
      let h = Number(m[1]);
      if (h < 1 || h > 12) return null;
      const mer = m[2].toLowerCase();
      h = mer === "pm" ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
      return time(h, 0);
    },
  },
  {
    kind: "time",
    re: boundary(`${CONN}(\\d{1,2})\\s*(ранку|ранок|вранці|дня|день|вечора|вечір|ввечері|ночі|ніч)`, "i"),
    resolve: (m) => {
      const h = Number(m[1]);
      if (h < 1 || h > 12) return null;
      return time(ukHour(h, m[2].toLowerCase()), 0);
    },
  },
  // Date: relative words + weekdays.
  {
    kind: "date",
    re: boundary(`${CONN}(today|сьогодн\\p{L}*)`, "i"),
    resolve: (_m, ctx) => ctx.todayIndex,
  },
  {
    kind: "date",
    re: boundary(`${CONN}(tomorrow|завтра)`, "i"),
    resolve: (_m, ctx) => clampDay(ctx.todayIndex + 1, ctx),
  },
  {
    kind: "date",
    re: boundary(`${CONN}(післязавтра|day after tomorrow)`, "i"),
    resolve: (_m, ctx) => clampDay(ctx.todayIndex + 2, ctx),
  },
  ...WEEKDAYS.map<Matcher>((wd) => ({
    kind: "date",
    re: boundary(`${CONN}(?:${wd.alt})`, "i"),
    resolve: (_m, ctx) => upcomingWeekday(wd.name, ctx),
  })),
];

interface Hit {
  start: number;
  end: number;
  kind: Kind;
  value: number | TaskTime | Priority;
}

export function parse(text: string, days: DayInfo[], todayIndex: number): NlpResult {
  const ctx: Ctx = { days, todayIndex };
  const hits: Hit[] = [];

  for (const matcher of MATCHERS) {
    matcher.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = matcher.re.exec(text)) !== null) {
      if (m[0].length === 0) {
        matcher.re.lastIndex++;
        continue;
      }
      const value = matcher.resolve(m, ctx);
      if (value === null) continue;
      hits.push({ start: m.index, end: m.index + m[0].length, kind: matcher.kind, value });
    }
  }

  // Earliest first, then longest, and accept greedily so overlaps can't
  // double-count a span.
  hits.sort((a, b) => a.start - b.start || b.end - a.end);
  const accepted: Hit[] = [];
  let cursor = -1;
  for (const h of hits) {
    if (h.start < cursor) continue;
    accepted.push(h);
    cursor = h.end;
  }

  // Last-mentioned value per field wins (Todoist behaviour).
  let date: number | null = null;
  let taskTime: TaskTime | null = null;
  let priority: Priority | null = null;
  for (const h of accepted) {
    if (h.kind === "date") date = h.value as number;
    else if (h.kind === "time") taskTime = h.value as TaskTime;
    else priority = h.value as Priority;
  }

  // Build segments (matched runs keep their original text) + clean title.
  const segments: Segment[] = [];
  let last = 0;
  const kept: string[] = [];
  for (const h of accepted) {
    if (h.start > last) {
      const plain = text.slice(last, h.start);
      segments.push({ text: plain, kind: "plain" });
      kept.push(plain);
    }
    segments.push({ text: text.slice(h.start, h.end), kind: h.kind });
    last = h.end;
  }
  if (last < text.length) {
    const plain = text.slice(last);
    segments.push({ text: plain, kind: "plain" });
    kept.push(plain);
  }
  if (segments.length === 0) segments.push({ text, kind: "plain" });

  const cleanTitle = kept.join("").replace(/\s+/g, " ").trim();

  return { segments, date, time: taskTime, priority, cleanTitle };
}
