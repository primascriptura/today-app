"use client";

import Icon from "./Icon";
import { DATE_COLOR } from "@/lib/data";
import type { Task } from "@/lib/types";

interface TaskRowProps {
  task: Task;
  /** How this row is animating out, if at all. */
  leavingKind: "complete" | "delete" | null;
  /** Current horizontal swipe offset (0 when not swiping this row). */
  dx: number;
  onComplete: (id: number) => void;
  onSwipeStart: (e: React.PointerEvent, id: number) => void;
  onSwipeMove: (e: React.PointerEvent) => void;
  onSwipeEnd: () => void;
}

export default function TaskRow({
  task,
  leavingKind,
  dx,
  onComplete,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
}: TaskRowProps) {
  const leaving = leavingKind !== null;
  const completing = leavingKind === "complete";

  return (
    <div
      style={{
        position: "relative",
        marginBottom: 12,
        borderRadius: 18,
        overflow: "hidden",
        animation: leaving ? "taskLeave .34s cubic-bezier(.4,0,.2,1) forwards" : "none",
      }}
    >
      {/* Red "delete" backdrop revealed by swiping left. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#d64545",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 24,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </div>

      {/* Foreground card. */}
      <div
        onPointerDown={(e) => onSwipeStart(e, task.id)}
        onPointerMove={onSwipeMove}
        onPointerUp={onSwipeEnd}
        onPointerCancel={onSwipeEnd}
        style={{
          position: "relative",
          transform: `translateX(${dx}px)`,
          transition: dx ? "none" : "transform .22s ease",
          touchAction: "pan-y",
          background: "#fff",
          borderRadius: 18,
          boxShadow: "var(--shadow-sm)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
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

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.3,
              color: "#201e1d",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {task.title}
          </div>
          {(task.priority || task.meta) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginTop: 3,
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              {task.priority && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d64545" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22V4h12l-2 4 2 4H4" />
                </svg>
              )}
              {task.meta && (
                <span
                  style={{
                    color:
                      DATE_COLOR[task.when] ||
                      "color-mix(in srgb, var(--color-text) 50%, transparent)",
                    fontWeight: 600,
                  }}
                >
                  {task.meta}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          aria-label={"Complete " + task.title}
          onClick={() => onComplete(task.id)}
          // Keep this tap from starting a swipe on the card: the card's
          // onPointerDown calls setPointerCapture, which would otherwise
          // steal this button's click (mouse and touch alike).
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            flex: "none",
            width: 26,
            height: 26,
            borderRadius: 999,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            transition: "all .18s ease",
            border: completing
              ? "2px solid var(--app-accent)"
              : "2px solid color-mix(in srgb, var(--color-text) 28%, transparent)",
            background: completing ? "var(--app-accent)" : "transparent",
          }}
        >
          {completing && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
