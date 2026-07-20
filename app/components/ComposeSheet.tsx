"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import DateSheet from "./pickers/DateSheet";
import DeadlineSheet from "./pickers/DeadlineSheet";
import PrioritySheet from "./pickers/PrioritySheet";
import ReminderSheet from "./pickers/ReminderSheet";
import RepeatSheet from "./pickers/RepeatSheet";
import TimeSheet from "./pickers/TimeSheet";
import { Flag, PRIORITY_META } from "./pickers/ui";
import { formatShortDate } from "@/lib/dates";
import type { DayInfo, Deadline, Priority, RepeatRule, Reminder, TaskTime } from "@/lib/types";
import type { PickerKind, PlannerActions } from "@/lib/usePlanner";

interface ComposeSheetProps {
  draft: string;
  draftNotes: string;
  draftDate: number | null;
  draftTime: TaskTime | null;
  draftRepeat: RepeatRule;
  draftDeadline: Deadline | null;
  draftPriority: Priority;
  draftReminders: Reminder[];
  activePicker: PickerKind | null;
  days: DayInfo[];
  today: Date;
  todayIndex: number;
  todayWeekday: number;
  actions: PlannerActions;
}

const chipBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  height: 38,
  padding: "0 15px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  flex: "none",
};

const chipOn: CSSProperties = {
  ...chipBase,
  background: "color-mix(in srgb, var(--app-accent) 15%, transparent)",
  color: "var(--app-accent-strong)",
  border: "1px solid color-mix(in srgb, var(--app-accent) 45%, transparent)",
};

const chipOff: CSSProperties = {
  ...chipBase,
  background: "transparent",
  color: "color-mix(in srgb, var(--color-text) 60%, transparent)",
  border: "1px solid color-mix(in srgb, var(--color-text) 16%, transparent)",
};

export default function ComposeSheet({
  draft,
  draftNotes,
  draftDate,
  draftTime,
  draftRepeat,
  draftDeadline,
  draftPriority,
  draftReminders,
  activePicker,
  days,
  today,
  todayIndex,
  todayWeekday,
  actions,
}: ComposeSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasDraft = draft.trim().length > 0;

  useEffect(() => {
    // Open the keyboard as soon as the sheet appears.
    const id = setTimeout(() => inputRef.current?.focus(), 70);
    return () => clearTimeout(id);
  }, []);

  const dateLabel = draftDate != null ? days[draftDate]?.label ?? "Date" : null;
  const priorityOn = draftPriority !== 4;
  const reminderCount = draftReminders.length;

  const chip = (opts: {
    kind: PickerKind;
    icon: ReactNode;
    fallback: string;
    active: boolean;
    activeLabel?: string;
  }) => (
    <button
      style={opts.active ? chipOn : chipOff}
      onClick={() => actions.openPicker(opts.kind)}
    >
      {opts.icon}
      {opts.active && opts.activeLabel ? opts.activeLabel : opts.fallback}
    </button>
  );

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 6 }}>
      <div
        onClick={actions.closeCompose}
        style={{ position: "absolute", inset: 0, background: "rgba(24,26,48,.32)" }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .28s cubic-bezier(.2,.7,.2,1)",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "26px 26px 0 0",
            padding: "24px 22px 22px",
            boxShadow: "0 -6px 24px rgba(24,26,48,.16)",
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => actions.setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                actions.addTyped();
              }
            }}
            placeholder="e.g., Clean out fridge Saturday evening"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 20,
              fontWeight: 600,
              color: "#201e1d",
              padding: "2px 0",
            }}
          />
          <input
            value={draftNotes}
            onChange={(e) => actions.setDraftNotes(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                actions.addTyped();
              }
            }}
            placeholder="Description (optional)"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
              fontWeight: 400,
              color: "#201e1d",
              margin: "12px 0 18px",
              padding: "2px 0",
            }}
          />

          {/* Attribute chips — each opens a real picker */}
          <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 2 }}>
            {chip({
              kind: "date",
              active: draftDate != null,
              activeLabel: dateLabel ?? undefined,
              fallback: "Date",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                </svg>
              ),
            })}
            {chip({
              kind: "deadline",
              active: draftDeadline != null,
              activeLabel: draftDeadline ? formatShortDate(draftDeadline.iso) : undefined,
              fallback: "Deadline",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 9v4l2 2" />
                  <path d="M9 2h6" />
                </svg>
              ),
            })}
            {chip({
              kind: "priority",
              active: priorityOn,
              activeLabel: `P${draftPriority}`,
              fallback: "Priority",
              icon: <Flag color={priorityOn ? PRIORITY_META[draftPriority].color : "currentColor"} size={16} />,
            })}
            {chip({
              kind: "reminder",
              active: reminderCount > 0,
              activeLabel: reminderCount === 1 ? "1 reminder" : `${reminderCount} reminders`,
              fallback: "Reminder",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                </svg>
              ),
            })}
          </div>

          {/* Footer — primary action */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 18 }}>
            {hasDraft ? (
              <button
                onClick={actions.addTyped}
                aria-label="Add task"
                style={{
                  width: 56,
                  height: 56,
                  border: "none",
                  borderRadius: 999,
                  background: "var(--app-accent)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 6px 16px rgba(60,66,110,.34)",
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            ) : (
              <button
                onClick={actions.tapMic}
                aria-label="Dictate a task"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  height: 52,
                  padding: "0 22px",
                  border: "none",
                  borderRadius: 999,
                  background: "var(--app-accent)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 700,
                  boxShadow: "0 6px 16px rgba(60,66,110,.34)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="9" x2="4" y2="15" />
                  <line x1="9" y1="5" x2="9" y2="19" />
                  <line x1="14" y1="8" x2="14" y2="16" />
                  <line x1="19" y1="6" x2="19" y2="18" />
                </svg>
                Dictate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Attribute pickers (stack above the compose sheet) ── */}
      {activePicker === "date" && (
        <DateSheet
          draftDate={draftDate}
          draftTime={draftTime}
          draftRepeat={draftRepeat}
          days={days}
          today={today}
          todayIndex={todayIndex}
          todayWeekday={todayWeekday}
          onSetDate={actions.setDraftDate}
          onOpenTime={() => actions.openPicker("time")}
          onOpenRepeat={() => actions.openPicker("repeat")}
          onClose={actions.closePicker}
        />
      )}
      {activePicker === "time" && (
        <TimeSheet
          value={draftTime}
          onSave={actions.setDraftTime}
          onBack={() => actions.openPicker("date")}
        />
      )}
      {activePicker === "repeat" && (
        <RepeatSheet
          value={draftRepeat}
          onSelect={actions.setDraftRepeat}
          onBack={() => actions.openPicker("date")}
        />
      )}
      {activePicker === "deadline" && (
        <DeadlineSheet
          value={draftDeadline}
          today={today}
          onSave={actions.setDraftDeadline}
          onClose={actions.closePicker}
        />
      )}
      {activePicker === "priority" && (
        <PrioritySheet
          value={draftPriority}
          onSelect={actions.setDraftPriority}
          onClose={actions.closePicker}
        />
      )}
      {activePicker === "reminder" && (
        <ReminderSheet
          value={draftReminders}
          today={today}
          onChange={actions.setDraftReminders}
          onClose={actions.closePicker}
        />
      )}
    </div>
  );
}
