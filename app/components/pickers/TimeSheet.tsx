"use client";

import { useState } from "react";
import SheetShell from "./SheetShell";
import { Card, pill } from "./ui";
import { formatDuration } from "@/lib/dates";
import type { TaskTime } from "@/lib/types";

interface TimeSheetProps {
  value: TaskTime | null;
  onSave: (time: TaskTime | null) => void;
  /** Return to the Date sheet this was opened from. */
  onBack: () => void;
}

const DURATIONS = [15, 30, 60, 90, 120];

export default function TimeSheet({ value, onSave, onBack }: TimeSheetProps) {
  const [start, setStart] = useState(value?.start ?? "09:00");
  const [hasDuration, setHasDuration] = useState(value?.durationMin != null);
  const [durationMin, setDurationMin] = useState(value?.durationMin ?? 60);

  const save = () => {
    onSave({ start, durationMin: hasDuration ? durationMin : null });
    onBack();
  };
  const clear = () => {
    onSave(null);
    onBack();
  };

  return (
    <SheetShell title="Time" onClose={onBack} onBack={onBack} onSave={save} zIndex={10}>
      <Card style={{ padding: "4px 4px" }}>
        {/* Start time */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 54,
            padding: "0 14px",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: "#201e1d" }}>Start</span>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={{
              border: "none",
              background: "color-mix(in srgb, var(--color-text) 6%, transparent)",
              borderRadius: 10,
              padding: "6px 12px",
              fontSize: 16,
              fontWeight: 600,
              color: "#201e1d",
              fontVariantNumeric: "tabular-nums",
            }}
          />
        </label>

        <div style={{ height: 1, background: "color-mix(in srgb, var(--color-text) 9%, transparent)", marginLeft: 14 }} />

        {/* Add duration toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 54,
            padding: "0 14px",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: "#201e1d" }}>Add duration</span>
          <button
            role="switch"
            aria-checked={hasDuration}
            aria-label="Add duration"
            onClick={() => setHasDuration((v) => !v)}
            style={{
              width: 50,
              height: 30,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: hasDuration ? "var(--app-accent)" : "color-mix(in srgb, var(--color-text) 20%, transparent)",
              position: "relative",
              transition: "background .18s ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: hasDuration ? 23 : 3,
                width: 24,
                height: 24,
                borderRadius: 999,
                background: "#fff",
                transition: "left .18s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,.2)",
              }}
            />
          </button>
        </div>
      </Card>

      {/* Duration options */}
      {hasDuration && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "color-mix(in srgb, var(--color-text) 50%, transparent)", margin: "0 4px 10px" }}>
            Duration · {formatDuration(durationMin)}
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {DURATIONS.map((d) => (
              <button key={d} style={pill(durationMin === d)} onClick={() => setDurationMin(d)}>
                {formatDuration(d)}
              </button>
            ))}
          </div>
        </div>
      )}

      {value && (
        <button
          onClick={clear}
          style={{
            display: "block",
            margin: "18px auto 4px",
            border: "none",
            background: "transparent",
            color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Clear time
        </button>
      )}
    </SheetShell>
  );
}
