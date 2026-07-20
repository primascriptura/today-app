"use client";

import { useState, type CSSProperties } from "react";
import { buildMonth, shiftMonth } from "@/lib/dates";

interface MonthCalendarProps {
  /** Currently-selected date as "YYYY-MM-DD", or null. */
  value: string | null;
  onChange: (iso: string) => void;
  /** Reference "now" — sets the today marker and the initial visible month. */
  today: Date;
  /** Returns whether a given ISO date can be selected. Defaults to all-enabled. */
  allowed?: (iso: string) => boolean;
}

const WD = ["M", "T", "W", "T", "F", "S", "S"];

const navBtn: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  color: "var(--app-accent-strong)",
};

export default function MonthCalendar({ value, onChange, today, allowed }: MonthCalendarProps) {
  // Start on the selected date's month, else the current month.
  const init = value ? new Date(value + "T00:00:00") : today;
  const [view, setView] = useState({ year: init.getFullYear(), month: init.getMonth() });
  const grid = buildMonth(view.year, view.month, today);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "16px 16px 20px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Month title + prev / next */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#201e1d" }}>{grid.title}</div>
        <div style={{ display: "flex", gap: 4 }}>
          <button aria-label="Previous month" style={navBtn} onClick={() => setView((v) => shiftMonth(v.year, v.month, -1))}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button aria-label="Next month" style={navBtn} onClick={() => setView((v) => shiftMonth(v.year, v.month, 1))}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday header (Monday-first) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {WD.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "color-mix(in srgb, var(--color-text) 42%, transparent)",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 4 }}>
        {grid.cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const isSelected = value === cell.iso;
          const enabled = allowed ? allowed(cell.iso) : true;
          const color = isSelected
            ? "#fff"
            : !enabled
              ? "color-mix(in srgb, var(--color-text) 26%, transparent)"
              : cell.isToday
                ? "var(--app-accent-strong)"
                : "#201e1d";
          return (
            <button
              key={i}
              disabled={!enabled}
              aria-label={cell.iso}
              aria-pressed={isSelected}
              onClick={() => enabled && onChange(cell.iso)}
              style={{
                height: 40,
                border: "none",
                background: "transparent",
                cursor: enabled ? "pointer" : "default",
                display: "grid",
                placeItems: "center",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 15,
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: cell.isToday || isSelected ? 700 : 500,
                  color,
                  background: isSelected ? "var(--app-accent)" : "transparent",
                }}
              >
                {cell.n}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
