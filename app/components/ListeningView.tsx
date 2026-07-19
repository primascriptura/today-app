"use client";

import type { RefObject } from "react";
import TaskRow from "./TaskRow";
import Waveform from "./Waveform";
import type { Task } from "@/lib/types";
import type { PlannerActions } from "@/lib/usePlanner";

interface ListeningViewProps {
  paused: boolean;
  /** Tasks recognized so far this session (newest first) — the live card stack. */
  liveTasks: Task[];
  /** Live mic loudness + spectrum driving the waveform. */
  levelRef: RefObject<number>;
  bandsRef: RefObject<number[]>;
  actions: PlannerActions;
}

// No-op handlers: cards are display-only while dictating (they become fully
// swipeable/completable once committed to the task list).
const noop = () => {};

// Voice-capture screen. As phrases are recognized, the "Try saying" prompt
// cross-fades out and recognized task cards drop into a live stack.
export default function ListeningView({ paused, liveTasks, levelRef, bandsRef, actions }: ListeningViewProps) {
  const hasCards = liveTasks.length > 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: "62px 24px 46px",
        animation: "layerIn .45s ease",
      }}
    >
      <div>
        <button
          onClick={actions.cancel}
          aria-label="Cancel"
          style={roundGlass(56)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#201e1d" strokeWidth="2.75" strokeLinecap="round">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {/* "Try saying" prompt — blur-bridges out the moment the first card lands. */}
        <div
          aria-hidden={hasCards}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            opacity: hasCards ? 0 : 1,
            filter: hasCards ? "blur(4px)" : "blur(0)",
            transform: hasCards ? "translateY(-8px)" : "translateY(0)",
            transition: "opacity .2s ease-out, filter .2s ease-out, transform .2s ease-out",
            pointerEvents: hasCards ? "none" : "auto",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: ".06em",
                color: "var(--app-accent-strong)",
                marginBottom: 18,
              }}
            >
              Try saying
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading), serif",
                fontSize: 40,
                lineHeight: 1.12,
                color: "var(--app-accent-strong)",
                maxWidth: 320,
              }}
            >
              &ldquo;I need to follow up on my job interview&rdquo;
            </div>
          </div>
        </div>

        {/* Live card stack — newest on top, each card drops in as it's parsed. */}
        {hasCards && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflowY: "auto",
              paddingTop: 4,
            }}
          >
            {liveTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                leavingKind={null}
                dx={0}
                entering
                onComplete={noop}
                onSwipeStart={noop}
                onSwipeMove={noop}
                onSwipeEnd={noop}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#201e1d" }}>
          Listening…
        </div>
        {!hasCards && (
          <div
            style={{
              fontSize: 15,
              color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
              marginTop: 4,
            }}
          >
            Say everything you need to get done.
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <button
          onClick={actions.togglePause}
          aria-label={paused ? "Resume" : "Pause"}
          style={roundGlass(68, "rgba(255,255,255,.72)")}
        >
          {paused ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#201e1d">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#201e1d">
              <rect x="6" y="5" width="4" height="14" rx="1.3" />
              <rect x="14" y="5" width="4" height="14" rx="1.3" />
            </svg>
          )}
        </button>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Waveform paused={paused} levelRef={levelRef} bandsRef={bandsRef} />
        </div>

        <button
          onClick={actions.finish}
          aria-label="Finish and save"
          style={{
            width: 68,
            height: 68,
            flex: "none",
            border: "none",
            borderRadius: 999,
            background: "var(--app-accent)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 8px 22px rgba(60,66,110,.34)",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function roundGlass(size: number, bg = "rgba(255,255,255,.85)"): React.CSSProperties {
  return {
    width: size,
    height: size,
    flex: "none",
    border: "none",
    borderRadius: 999,
    background: bg,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 2px 10px rgba(40,44,70,.16)",
  };
}
