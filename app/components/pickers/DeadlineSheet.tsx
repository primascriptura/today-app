"use client";

import { useState } from "react";
import SheetShell from "./SheetShell";
import MonthCalendar from "./MonthCalendar";
import { Card } from "./ui";
import type { Deadline } from "@/lib/types";

interface DeadlineSheetProps {
  value: Deadline | null;
  today: Date;
  onSave: (deadline: Deadline | null) => void;
  onClose: () => void;
}

function isoOf(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function DeadlineSheet({ value, today, onSave, onClose }: DeadlineSheetProps) {
  const todayIso = isoOf(today);
  const [iso, setIso] = useState<string | null>(value?.iso ?? null);
  const [hasTime, setHasTime] = useState(value?.time != null);
  const [time, setTime] = useState(value?.time ?? "09:00");

  const save = () => {
    if (!iso) return;
    onSave({ iso, time: hasTime ? time : null });
    onClose();
  };

  return (
    <SheetShell title="Deadline" onClose={onClose} onSave={save} saveDisabled={!iso} zIndex={9}>
      <MonthCalendar value={iso} onChange={setIso} today={today} allowed={(d) => d >= todayIso} />

      <Card style={{ marginTop: 16, padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54, padding: "0 14px" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#201e1d" }}>Add time</span>
          <button
            role="switch"
            aria-checked={hasTime}
            aria-label="Add time"
            onClick={() => setHasTime((v) => !v)}
            style={{
              width: 50,
              height: 30,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: hasTime ? "var(--app-accent)" : "color-mix(in srgb, var(--color-text) 20%, transparent)",
              position: "relative",
              transition: "background .18s ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: hasTime ? 23 : 3,
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
        {hasTime && (
          <>
            <div style={{ height: 1, background: "color-mix(in srgb, var(--color-text) 9%, transparent)", marginLeft: 14 }} />
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54, padding: "0 14px" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#201e1d" }}>Time</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
          </>
        )}
      </Card>

      {value && (
        <button
          onClick={() => {
            onSave(null);
            onClose();
          }}
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
          Clear deadline
        </button>
      )}
    </SheetShell>
  );
}
