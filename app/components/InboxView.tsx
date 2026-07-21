"use client";

import Icon from "./Icon";
import TaskRow from "./TaskRow";
import { PRIORITY_META } from "./pickers/ui";
import { completedTasks, groupActiveByPriority } from "@/lib/inbox";
import type { DayInfo, Task } from "@/lib/types";
import type { PlannerActions } from "@/lib/usePlanner";

interface InboxViewProps {
  tasks: Task[];
  days: DayInfo[];
  collapsed: Record<string, boolean>;
  swipe: { id: number; dx: number } | null;
  leaving: { id: number; kind: "complete" | "delete" } | null;
  actions: PlannerActions;
}

const DONE_KEY = "inbox:done";

export default function InboxView({
  tasks,
  days,
  collapsed,
  swipe,
  leaving,
  actions,
}: InboxViewProps) {
  const groups = groupActiveByPriority(tasks);
  const done = completedTasks(tasks);
  // Done starts collapsed; its key is an "expanded" flag (opposite of the
  // priority groups) so a single toggle from the initial undefined opens it.
  const doneCollapsed = !collapsed[DONE_KEY];

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
            Inbox
          </div>
          <div
            style={{
              fontSize: 16,
              color: "color-mix(in srgb, var(--color-text) 52%, transparent)",
              marginTop: 4,
            }}
          >
            All tasks by priority
          </div>
        </div>

        {/* Groups */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 0 116px" }}>
          {groups.map((g) => {
            const isCollapsed = !!collapsed[g.key];
            const meta = PRIORITY_META[g.priority];
            const neutral = g.priority === 4;
            return (
              <div key={g.key} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <button
                    onClick={() => actions.toggleGroup(g.key)}
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
                      background: neutral
                        ? "color-mix(in srgb, var(--color-text) 7%, transparent)"
                        : `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                      color: neutral ? "#201e1d" : meta.color,
                      fontSize: 12.5,
                      fontWeight: 800,
                      letterSpacing: ".06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g.label + " (" + g.tasks.length + ")"}
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
                    aria-label={"Add a " + g.label + " task"}
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
                  g.tasks.map((t) => (
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
          })}

          {/* Done */}
          {done.length > 0 && (
            <div style={{ marginBottom: 14, marginTop: 6 }}>
              <button
                onClick={() => actions.toggleGroup(DONE_KEY)}
                aria-expanded={!doneCollapsed}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 34,
                  padding: "0 13px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: "color-mix(in srgb, var(--color-text) 7%, transparent)",
                  color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                  fontSize: 12.5,
                  fontWeight: 800,
                  letterSpacing: ".06em",
                  whiteSpace: "nowrap",
                  marginBottom: 10,
                }}
              >
                {"DONE (" + done.length + ")"}
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
                    transform: doneCollapsed ? "rotate(-90deg)" : "none",
                    transition: "transform .18s ease",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {!doneCollapsed && done.map((t) => <DoneRow key={t.id} task={t} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** A completed task: filled check, dimmed strikethrough title. Display-only. */
function DoneRow({ task }: { task: Task }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#fff",
        borderRadius: 18,
        boxShadow: "var(--shadow-sm)",
        padding: "14px 16px",
        marginBottom: 12,
        opacity: 0.62,
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          flex: "none",
          borderRadius: 14,
          background: task.tint,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon name={task.icon} color="#4a4f6b" />
      </span>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 16,
          fontWeight: 600,
          color: "#201e1d",
          textDecoration: "line-through",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {task.title}
      </div>
      <span
        aria-label="Completed"
        style={{
          flex: "none",
          width: 26,
          height: 26,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: "var(--app-accent)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </div>
  );
}
