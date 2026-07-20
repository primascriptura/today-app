"use client";

import SheetShell from "./SheetShell";
import MonthCalendar from "./MonthCalendar";
import { Card, OptionRow, divider, pill } from "./ui";
import { formatDuration, formatRepeat, formatTime, resolveQuick, type QuickDate } from "@/lib/dates";
import type { DayInfo, RepeatRule, TaskTime } from "@/lib/types";

interface DateSheetProps {
  draftDate: number | null;
  draftTime: TaskTime | null;
  draftRepeat: RepeatRule;
  days: DayInfo[];
  today: Date;
  todayIndex: number;
  todayWeekday: number;
  onSetDate: (day: number | null) => void;
  onOpenTime: () => void;
  onOpenRepeat: () => void;
  onClose: () => void;
}

const QUICK: { kind: QuickDate; label: string }[] = [
  { kind: "today", label: "Today" },
  { kind: "tomorrow", label: "Tomorrow" },
  { kind: "weekend", label: "This Weekend" },
  { kind: "nextweek", label: "Next Week" },
];

export default function DateSheet({
  draftDate,
  draftTime,
  draftRepeat,
  days,
  today,
  todayIndex,
  todayWeekday,
  onSetDate,
  onOpenTime,
  onOpenRepeat,
  onClose,
}: DateSheetProps) {
  // Only days that exist in the rolling strip are selectable, since a task's
  // `day` is a strip index.
  const stripIsos = new Set(days.map((d) => d.iso));
  const selectedIso = draftDate != null ? days[draftDate]?.iso ?? null : null;

  const timeValue = draftTime
    ? formatTime(draftTime.start) + (draftTime.durationMin ? ` · ${formatDuration(draftTime.durationMin)}` : "")
    : "None";
  const repeatValue = formatRepeat(draftRepeat) || "None";

  return (
    <SheetShell title="Date" onClose={onClose} onSave={onClose} zIndex={9}>
      {/* Quick options */}
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 16 }}>
        {QUICK.map((q) => {
          const idx = resolveQuick(q.kind, todayIndex, todayWeekday);
          return (
            <button key={q.kind} style={pill(draftDate === idx)} onClick={() => onSetDate(idx)}>
              {q.label}
            </button>
          );
        })}
      </div>

      <MonthCalendar
        value={selectedIso}
        today={today}
        allowed={(iso) => stripIsos.has(iso)}
        onChange={(iso) => {
          const idx = days.findIndex((d) => d.iso === iso);
          if (idx >= 0) onSetDate(idx);
        }}
      />

      {/* Time + Repeat rows */}
      <Card style={{ marginTop: 16 }}>
        <OptionRow
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          }
          label="Time"
          value={timeValue}
          showChevron
          onClick={onOpenTime}
        />
        <div style={divider} />
        <OptionRow
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          }
          label="Repeat"
          value={repeatValue}
          showChevron
          onClick={onOpenRepeat}
        />
      </Card>

      {draftDate != null && (
        <button
          onClick={() => {
            onSetDate(null);
            onClose();
          }}
          style={{
            display: "block",
            margin: "18px auto 4px",
            border: "none",
            background: "transparent",
            color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Clear date
        </button>
      )}
    </SheetShell>
  );
}
