"use client";

import { useRef, useState } from "react";
import SheetShell from "./SheetShell";
import MonthCalendar from "./MonthCalendar";
import { Card, OptionRow, divider } from "./ui";
import { formatTime } from "@/lib/dates";
import type { Reminder } from "@/lib/types";

interface ReminderSheetProps {
  value: Reminder[];
  today: Date;
  onChange: (reminders: Reminder[]) => void;
  onClose: () => void;
}

function isoOf(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function hhmm(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function ReminderSheet({ value, today, onChange, onClose }: ReminderSheetProps) {
  const [custom, setCustom] = useState(false);
  const [iso, setIso] = useState<string | null>(null);
  const [time, setTime] = useState("09:00");
  // Monotonic id source, so ids stay unique across adds/removes without Date.now.
  const seq = useRef(1);

  const at = (offsetDays: number, hours: number, minutes: number): { iso: string; time: string } => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays, hours, minutes);
    return { iso: isoOf(d), time: hhmm(d) };
  };
  const in5 = new Date(today.getTime() + 5 * 60000);

  const SUGGESTIONS: { label: string; value: string; make: () => { iso: string; time: string } }[] = [
    { label: "In 5 minutes", value: formatTime(hhmm(in5)), make: () => ({ iso: isoOf(in5), time: hhmm(in5) }) },
    { label: "Later", value: formatTime("14:00"), make: () => at(0, 14, 0) },
    { label: "Tomorrow", value: formatTime("09:00"), make: () => at(1, 9, 0) },
    { label: "Next week", value: formatTime("10:00"), make: () => at(7, 10, 0) },
  ];

  const add = (r: { iso: string; time: string }) => {
    onChange([...value, { id: seq.current++, iso: r.iso, time: r.time }]);
  };
  const remove = (id: number) => onChange(value.filter((r) => r.id !== id));

  return (
    <SheetShell title="Reminders" onClose={onClose} onSave={onClose} zIndex={9}>
      {/* Already-added reminders */}
      {value.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          {value.map((r, i) => (
            <div key={r.id}>
              {i > 0 && <div style={divider} />}
              <div style={{ display: "flex", alignItems: "center", height: 52, padding: "0 16px", gap: 12 }}>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#201e1d", fontVariantNumeric: "tabular-nums" }}>
                  {r.iso} · {formatTime(r.time)}
                </span>
                <button
                  aria-label="Remove reminder"
                  onClick={() => remove(r.id)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {!custom ? (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: "color-mix(in srgb, var(--color-text) 50%, transparent)", margin: "0 4px 8px" }}>
            Suggestions
          </div>
          <Card>
            {SUGGESTIONS.map((s, i) => (
              <div key={s.label}>
                {i > 0 && <div style={divider} />}
                <OptionRow label={s.label} value={s.value} onClick={() => add(s.make())} />
              </div>
            ))}
          </Card>
          <Card style={{ marginTop: 12 }}>
            <OptionRow
              label="Custom Date & Time"
              showChevron
              onClick={() => setCustom(true)}
            />
          </Card>
        </>
      ) : (
        <>
          <MonthCalendar value={iso} onChange={setIso} today={today} allowed={(d) => d >= isoOf(today)} />
          <Card style={{ marginTop: 16, padding: "0 4px" }}>
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
          </Card>
          <button
            disabled={!iso}
            onClick={() => {
              if (!iso) return;
              add({ iso, time });
              setCustom(false);
              setIso(null);
            }}
            style={{
              display: "block",
              width: "100%",
              marginTop: 16,
              height: 50,
              borderRadius: 999,
              border: "none",
              background: iso ? "var(--app-accent)" : "color-mix(in srgb, var(--color-text) 16%, transparent)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: iso ? "pointer" : "default",
            }}
          >
            Add reminder
          </button>
        </>
      )}
    </SheetShell>
  );
}
