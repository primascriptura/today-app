"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import HighlightedInput from "./HighlightedInput";
import DateSheet from "./pickers/DateSheet";
import DeadlineSheet from "./pickers/DeadlineSheet";
import PrioritySheet from "./pickers/PrioritySheet";
import ReminderSheet from "./pickers/ReminderSheet";
import RepeatSheet from "./pickers/RepeatSheet";
import TimeSheet from "./pickers/TimeSheet";
import { Flag, PRIORITY_META } from "./pickers/ui";
import { formatShortDate } from "@/lib/dates";
import type { Segment } from "@/lib/nlp";
import type { DayInfo, Deadline, Priority, RepeatRule, Reminder, TaskTime } from "@/lib/types";
import type { PickerKind, PlannerActions } from "@/lib/usePlanner";

interface ComposeSheetProps {
  draft: string;
  /** Highlight runs for the title (matched date/time/priority tokens tagged). */
  draftSegments: Segment[];
  draftNotes: string;
  draftDate: number | null;
  draftTime: TaskTime | null;
  draftRepeat: RepeatRule;
  draftDeadline: Deadline | null;
  draftPriority: Priority;
  draftReminders: Reminder[];
  activePicker: PickerKind | null;
  /**
   * Editing an existing task rather than composing a new one. Suppresses the
   * keyboard-popping autofocus (so a metadata-only fix stays touch-only),
   * swaps the footer to a "Done" that saves back, and makes tapping the
   * backdrop save instead of discard.
   */
  editing: boolean;
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
  draftSegments,
  draftNotes,
  draftDate,
  draftTime,
  draftRepeat,
  draftDeadline,
  draftPriority,
  draftReminders,
  activePicker,
  editing,
  days,
  today,
  todayIndex,
  todayWeekday,
  actions,
}: ComposeSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasDraft = draft.trim().length > 0;

  useEffect(() => {
    // Compose (new task): open the keyboard immediately. Edit: leave it closed
    // so a metadata-only fix (wrong day/priority) never has to dismiss the
    // keyboard first — the chips are reachable at once; tap the title to type.
    if (editing) return;
    const id = setTimeout(() => inputRef.current?.focus(), 70);
    return () => clearTimeout(id);
  }, [editing]);

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
        onClick={editing ? actions.saveEdit : actions.closeCompose}
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
          {editing && (
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: ".07em",
                textTransform: "uppercase",
                color: "color-mix(in srgb, var(--color-text) 45%, transparent)",
                marginBottom: 10,
              }}
            >
              Edit task
            </div>
          )}
          <HighlightedInput
            inputRef={inputRef}
            value={draft}
            segments={draftSegments}
            onChange={actions.setDraft}
            onEnter={editing ? actions.saveEdit : actions.addTyped}
            placeholder="e.g., Clean out fridge tomorrow 6pm"
            textStyle={{
              width: "100%",
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
          <div
            className="chipRow"
            style={{ display: "flex", gap: 9, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}
          >
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

          {/* Footer — primary action, always full width. Done stays a compact
              right-aligned confirm (edit mode implies a focused, small fix). */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: editing ? "flex-end" : "stretch",
              marginTop: 18,
            }}
          >
            {editing ? (
              <button
                onClick={actions.saveEdit}
                aria-label="Save changes"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  height: 52,
                  padding: "0 24px",
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Done
              </button>
            ) : hasDraft ? (
              <button
                onClick={actions.addTyped}
                aria-label="Add task"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  width: "100%",
                  height: 56,
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
                Add task
              </button>
            ) : (
              <button
                onClick={actions.tapMic}
                aria-label="Dictate a task"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  width: "100%",
                  height: 56,
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
