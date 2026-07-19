"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { DAYS, DEFAULT_DAY } from "@/lib/data";
import type { PlannerActions } from "@/lib/usePlanner";

interface ComposeSheetProps {
  draft: string;
  chipDate: boolean;
  chipPriority: boolean;
  sel: number;
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
  chipDate,
  chipPriority,
  sel,
  actions,
}: ComposeSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasDraft = draft.trim().length > 0;
  const composeTarget = sel === DEFAULT_DAY ? "Today" : DAYS[sel].full;

  useEffect(() => {
    // Open the keyboard as soon as the sheet appears.
    const id = setTimeout(() => inputRef.current?.focus(), 70);
    return () => clearTimeout(id);
  }, []);

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
          <div
            style={{
              fontSize: 15,
              color: "color-mix(in srgb, var(--color-text) 42%, transparent)",
              margin: "12px 0 18px",
            }}
          >
            Description
          </div>

          {/* Attribute chips */}
          <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 2 }}>
            <button style={chipDate ? chipOn : chipOff} onClick={actions.toggleDate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              Date
            </button>
            <button style={chipOff} disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2 2" />
                <path d="M9 2h6" />
              </svg>
              Deadline
            </button>
            <button style={chipPriority ? chipOn : chipOff} onClick={actions.togglePriority}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22V4h12l-2 4 2 4H4" />
              </svg>
              Priority
            </button>
            <button style={chipOff} disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
              </svg>
              Reminder
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 18,
            }}
          >
            <button
              disabled
              aria-label="Schedule day"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                height: 38,
                padding: "0 14px",
                borderRadius: 999,
                border: "1px solid color-mix(in srgb, var(--color-text) 14%, transparent)",
                background: "transparent",
                cursor: "default",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--app-accent-strong)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              {composeTarget}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

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
    </div>
  );
}
