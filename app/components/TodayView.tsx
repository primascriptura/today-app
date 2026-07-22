"use client";

import { useState } from "react";
import DayStrip from "./DayStrip";
import Icon from "./Icon";
import TaskRow from "./TaskRow";
import { SLOTS } from "@/lib/data";
import type { DayInfo, Task } from "@/lib/types";
import type { PlannerActions } from "@/lib/usePlanner";

interface TodayViewProps {
  tasks: Task[];
  sel: number;
  days: DayInfo[];
  todayIndex: number;
  collapsed: Record<string, boolean>;
  swipe: { id: number; dx: number } | null;
  leaving: { id: number; kind: "complete" | "delete" } | null;
  actions: PlannerActions;
}

export default function TodayView({
  tasks,
  sel,
  days,
  todayIndex,
  collapsed,
  swipe,
  leaving,
  actions,
}: TodayViewProps) {
  const day = days[sel];
  // Completed tasks stay in the store (for the Inbox Done section) but are
  // hidden from the day view — so a checked-off task still animates away here.
  const dayTasks = tasks.filter((t) => t.day === sel && t.completedAt == null);
  // The day-switcher circles are hidden by default; tapping the day title
  // reveals them, tapping again hides them. Resets to collapsed on remount.
  const [stripOpen, setStripOpen] = useState(false);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#f9f4ed" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "18px 20px 0",
        }}
      >
        {/* Header — day arrows step ±1 (selectDay clamps at the strip edges);
            tapping the title toggles the day-switcher circles below. */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
          <DayArrow
            direction="prev"
            disabled={sel <= 0}
            onClick={() => actions.selectDay(sel - 1)}
          />
          <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
            <button
              onClick={() => setStripOpen((o) => !o)}
              aria-expanded={stripOpen}
              aria-label="Toggle day picker"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                fontFamily: "var(--font-heading), serif",
                fontSize: 44,
                lineHeight: 1.05,
                color: "#201e1d",
              }}
            >
              {day.label}
            </button>
            <div
              suppressHydrationWarning
              style={{
                fontSize: 16,
                color: "color-mix(in srgb, var(--color-text) 52%, transparent)",
                marginTop: 4,
              }}
            >
              {day.dateLabel}
            </div>
          </div>
          <DayArrow
            direction="next"
            disabled={sel >= days.length - 1}
            onClick={() => actions.selectDay(sel + 1)}
          />
        </div>

        {/* Day switcher — revealed by the header toggle. */}
        <div
          style={{
            overflow: "hidden",
            maxHeight: stripOpen ? 96 : 0,
            opacity: stripOpen ? 1 : 0,
            marginTop: stripOpen ? 18 : 0,
            transition:
              "max-height .28s cubic-bezier(.23,1,.32,1), opacity .2s ease, margin-top .28s cubic-bezier(.23,1,.32,1)",
          }}
        >
          <DayStrip sel={sel} days={days} todayIndex={todayIndex} onSelect={actions.selectDay} />
        </div>

        {/* Task list */}
        <div style={{ flex: 1, overflow: "auto", padding: "18px 0 116px" }}>
          {dayTasks.length === 0 ? (
            <EmptyDay />
          ) : (
            SLOTS.map((sl) => {
              const group = dayTasks.filter((t) => t.slot === sl.key);
              if (group.length === 0) return null;
              const isCollapsed = !!collapsed[sl.key];
              return (
                <div key={sl.key} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <button
                      onClick={() => actions.toggleSlot(sl.key)}
                      aria-expanded={!isCollapsed}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        height: 34,
                        padding: "0 13px",
                        borderRadius: 999,
                        border: "none",
                        cursor: "pointer",
                        background: sl.tint,
                        fontSize: 12.5,
                        fontWeight: 700,
                        letterSpacing: ".06em",
                        whiteSpace: "nowrap",
                        color: "#201e1d",
                      }}
                    >
                      <Icon name={sl.ic} color="#201e1d" size={15} />
                      {sl.label + " (" + group.length + ")"}
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: isCollapsed ? "rotate(-90deg)" : "none",
                          transition: "transform .18s ease",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <button
                      onClick={actions.openCompose}
                      aria-label={"Add to " + sl.label}
                      style={{
                        width: 30,
                        height: 30,
                        border: "none",
                        borderRadius: 999,
                        background: "transparent",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                        color: "color-mix(in srgb, var(--color-text) 40%, transparent)",
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>

                  {!isCollapsed &&
                    group.map((t) => (
                      <TaskRow
                        key={t.id}
                        task={t}
                        days={days}
                        leavingKind={leaving && leaving.id === t.id ? leaving.kind : null}
                        dx={swipe && swipe.id === t.id ? swipe.dx : 0}
                        onComplete={actions.complete}
                        onSwipeStart={actions.swStart}
                        onSwipeMove={actions.swMove}
                        onSwipeEnd={actions.swEnd}
                        onTap={actions.editTask}
                      />
                    ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/** Chevron button that steps the day header ±1 day (selectDay clamps at the strip edges). */
function DayArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous day" : "Next day"}
      style={{
        flex: "none",
        width: 40,
        height: 40,
        border: "none",
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
        display: "grid",
        placeItems: "center",
        color: "color-mix(in srgb, var(--color-text) 38%, transparent)",
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {direction === "prev" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 6 15 12 9 18" />}
      </svg>
    </button>
  );
}

function EmptyDay() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "54px 20px",
        gap: 16,
      }}
    >
      <span
        style={{
          width: 68,
          height: 68,
          borderRadius: 999,
          background: "color-mix(in srgb, var(--app-accent) 12%, transparent)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon name="sun" color="var(--app-accent-strong)" />
      </span>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#201e1d" }}>
        Nothing planned
      </div>
      <div
        style={{
          fontSize: 15,
          color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
          maxWidth: 230,
        }}
      >
        A clear day. Tap + to add something.
      </div>
    </div>
  );
}
