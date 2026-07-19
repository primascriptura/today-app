"use client";

import DayStrip from "./DayStrip";
import Icon from "./Icon";
import TaskRow from "./TaskRow";
import { DAYS, SLOTS } from "@/lib/data";
import type { Screen, Task } from "@/lib/types";
import type { PlannerActions } from "@/lib/usePlanner";

interface TodayViewProps {
  screen: Screen;
  tasks: Task[];
  sel: number;
  collapsed: Record<string, boolean>;
  swipe: { id: number; dx: number } | null;
  leaving: { id: number; kind: "complete" | "delete" } | null;
  composing: boolean;
  actions: PlannerActions;
}

export default function TodayView({
  screen,
  tasks,
  sel,
  collapsed,
  swipe,
  leaving,
  composing,
  actions,
}: TodayViewProps) {
  const day = DAYS[sel];
  const dayTasks = tasks.filter((t) => t.day === sel);
  const showComposerBar = screen === "tasks" && !composing;

  return (
    <div style={{ position: "absolute", inset: 0, background: "#f9f4ed" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "54px 20px 0",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <div
            style={{
              fontFamily: "var(--font-heading), serif",
              fontSize: 44,
              lineHeight: 1.05,
              color: "#201e1d",
            }}
          >
            {day.full}
          </div>
          <div
            style={{
              fontSize: 16,
              color: "color-mix(in srgb, var(--color-text) 52%, transparent)",
              marginTop: 4,
            }}
          >
            {"January " + day.n + "th, 2026"}
          </div>
        </div>

        {/* Day switcher */}
        <div style={{ marginTop: 18 }}>
          <DayStrip sel={sel} onSelect={actions.selectDay} />
        </div>

        {/* Task list */}
        <div style={{ flex: 1, overflow: "auto", padding: "18px 0 100px" }}>
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
                        leavingKind={leaving && leaving.id === t.id ? leaving.kind : null}
                        dx={swipe && swipe.id === t.id ? swipe.dx : 0}
                        onComplete={actions.complete}
                        onSwipeStart={actions.swStart}
                        onSwipeMove={actions.swMove}
                        onSwipeEnd={actions.swEnd}
                      />
                    ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Composer bar */}
      {showComposerBar && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "14px 18px 30px",
            display: "flex",
            gap: 10,
            alignItems: "center",
            background:
              "linear-gradient(to top, #f9f4ed 76%, rgba(249,244,237,0))",
          }}
        >
          <button
            onClick={actions.openCompose}
            style={{
              flex: 1,
              height: 56,
              border: "1px solid color-mix(in srgb, var(--color-text) 12%, transparent)",
              borderRadius: 999,
              background: "#fff",
              padding: "0 22px",
              textAlign: "left",
              fontSize: 16,
              color: "color-mix(in srgb, var(--color-text) 48%, transparent)",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            Add a task…
          </button>
          <button
            onClick={actions.tapMic}
            aria-label="Capture a task by voice"
            style={{
              height: 56,
              border: "none",
              borderRadius: 999,
              background: "var(--app-accent)",
              color: "#fff",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 22px rgba(60,66,110,.34)",
            }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="9" x2="4" y2="15" />
              <line x1="9" y1="5" x2="9" y2="19" />
              <line x1="14" y1="8" x2="14" y2="16" />
              <line x1="19" y1="6" x2="19" y2="18" />
            </svg>
            Speak
          </button>
        </div>
      )}
    </div>
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
        A clear day. Type below or tap Speak to add something.
      </div>
    </div>
  );
}
