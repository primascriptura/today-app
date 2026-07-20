"use client";

import { useRef } from "react";
import Icon from "./Icon";
import { PRIORITY_META } from "./pickers/ui";
import { DATE_COLOR } from "@/lib/data";
import { formatShortDate, formatTaskMeta } from "@/lib/dates";
import type { DayInfo, Task } from "@/lib/types";

interface TaskRowProps {
  task: Task;
  /** Day strip, used to derive the date/time meta label. */
  days: DayInfo[];
  /** How this row is animating out, if at all. */
  leavingKind: "complete" | "delete" | null;
  /** Current horizontal swipe offset (0 when not swiping this row). */
  dx: number;
  /** Play the "card drops in" enter animation once on mount (live dictation). */
  entering?: boolean;
  /** Stagger offset (ms) for the enter animation when several land at once. */
  enterDelayMs?: number;
  /**
   * Let the title wrap across lines instead of truncating with an ellipsis.
   * Used by the live-dictation card so the whole captured phrase stays visible.
   */
  titleWrap?: boolean;
  onComplete: (id: number) => void;
  onSwipeStart: (e: React.PointerEvent, id: number) => void;
  onSwipeMove: (e: React.PointerEvent) => void;
  onSwipeEnd: () => void;
  /**
   * Tap the card body (not a swipe, not the complete circle) to edit it. A
   * pointer that moves more than a few px is treated as a swipe/scroll and
   * never fires this.
   */
  onTap?: (id: number) => void;
}

// A pointer that travels further than this between down and up is a swipe or a
// scroll drag, not a tap — so it must not open the editor.
const TAP_SLOP = 8;

export default function TaskRow({
  task,
  days,
  leavingKind,
  dx,
  entering = false,
  enterDelayMs = 0,
  titleWrap = false,
  onComplete,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  onTap,
}: TaskRowProps) {
  const leaving = leavingKind !== null;
  const completing = leavingKind === "complete";

  // Track the pointer-down origin so pointer-up can tell a tap from a drag.
  const tapRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const metaLabel = formatTaskMeta(task, days);
  const hasPriority = task.priority != null && task.priority !== 4;
  const repeats = task.repeat && task.repeat !== "none";
  const reminderCount = task.reminders?.length ?? 0;
  const hasDeadline = task.deadline != null;
  const hasSubline =
    hasPriority || metaLabel || repeats || reminderCount > 0 || hasDeadline;

  const animation = leaving
    ? "taskLeave .34s cubic-bezier(.4,0,.2,1) forwards"
    : entering
      ? `taskEnter .24s cubic-bezier(.23,1,.32,1) ${enterDelayMs}ms both`
      : "none";

  return (
    <div
      style={{
        position: "relative",
        marginBottom: 12,
        borderRadius: 18,
        overflow: "hidden",
        animation,
      }}
    >
      {/* Red "delete" backdrop, only painted while actually revealed by a
          swipe — otherwise it sits full-bleed behind the resting white card
          and a hairline of it shows through at the shared rounded corners. */}
      {dx !== 0 && (
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
      )}

      {/* Foreground card. */}
      <div
        onPointerDown={(e) => {
          tapRef.current = { x: e.clientX, y: e.clientY, moved: false };
          onSwipeStart(e, task.id);
        }}
        onPointerMove={(e) => {
          const t = tapRef.current;
          if (t && !t.moved) {
            if (Math.abs(e.clientX - t.x) > TAP_SLOP || Math.abs(e.clientY - t.y) > TAP_SLOP) {
              t.moved = true;
            }
          }
          onSwipeMove(e);
        }}
        onPointerUp={() => {
          const t = tapRef.current;
          tapRef.current = null;
          if (t && !t.moved && onTap) onTap(task.id);
          onSwipeEnd();
        }}
        onPointerCancel={() => {
          tapRef.current = null;
          onSwipeEnd();
        }}
        style={{
          position: "relative",
          transform: dx ? `translateX(${dx}px)` : undefined,
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
              ...(titleWrap
                ? { whiteSpace: "normal", overflowWrap: "anywhere" }
                : { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }),
            }}
          >
            {task.title}
          </div>
          {hasSubline && (
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
              {hasPriority && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PRIORITY_META[task.priority!].color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22V4h12l-2 4 2 4H4" />
                </svg>
              )}
              {metaLabel && (
                <span
                  style={{
                    color:
                      DATE_COLOR[task.when] ||
                      "color-mix(in srgb, var(--color-text) 50%, transparent)",
                    fontWeight: 600,
                  }}
                >
                  {metaLabel}
                </span>
              )}
              {hasDeadline && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    color: "#d64545",
                    fontWeight: 600,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="13" r="8" />
                    <path d="M12 9v4l2 2" />
                    <path d="M9 2h6" />
                  </svg>
                  {formatShortDate(task.deadline!.iso)}
                </span>
              )}
              {repeats && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="color-mix(in srgb, var(--color-text) 45%, transparent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              )}
              {reminderCount > 0 && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="color-mix(in srgb, var(--color-text) 45%, transparent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                </svg>
              )}
            </div>
          )}
          {task.notes && (
            <div
              style={{
                fontSize: 13,
                color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                marginTop: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {task.notes}
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
