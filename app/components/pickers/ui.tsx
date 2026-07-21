"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Priority } from "@/lib/types";

/**
 * Per-level priority presentation. `label` is the long name used by the picker;
 * `short` is the badge word shown on task rows and Inbox group headers (empty
 * for P4 = no priority, which renders no badge).
 */
export const PRIORITY_META: Record<Priority, { color: string; label: string; short: string }> = {
  1: { color: "#d64545", label: "Priority 1", short: "HIGH" },
  2: { color: "#e8833a", label: "Priority 2", short: "MEDIUM" },
  3: { color: "#3b6fd6", label: "Priority 3", short: "LOW" },
  4: { color: "color-mix(in srgb, var(--color-text) 42%, transparent)", label: "Priority 4", short: "" },
};

/** Small colored priority badge (HIGH/MEDIUM/LOW). Renders nothing for P4. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  if (!meta.short) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        padding: "0 7px",
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: ".05em",
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
      }}
    >
      {meta.short}
    </span>
  );
}

/** A Todoist-style flag glyph, tinted per priority. */
export function Flag({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22V4h12l-2 4 2 4H4" />
    </svg>
  );
}

/** A tappable list row: [icon] label … [value] [chevron]. Used across pickers. */
export function OptionRow({
  icon,
  label,
  value,
  selected = false,
  showChevron = false,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  value?: ReactNode;
  selected?: boolean;
  showChevron?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        height: 54,
        padding: "0 16px",
        border: "none",
        background: "transparent",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      {icon && <span style={{ flex: "none", display: "grid", placeItems: "center", color: "var(--app-accent-strong)" }}>{icon}</span>}
      <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: "#201e1d" }}>{label}</span>
      {value != null && (
        <span style={{ fontSize: 15, fontWeight: 600, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
          {value}
        </span>
      )}
      {selected && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--app-accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {showChevron && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="color-mix(in srgb, var(--color-text) 40%, transparent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  );
}

/** White rounded container that groups rows (with hairline dividers between). */
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const divider: CSSProperties = {
  height: 1,
  background: "color-mix(in srgb, var(--color-text) 9%, transparent)",
  marginLeft: 16,
};

/** Small pill button used for quick options / time chips. */
export const pill = (active: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  height: 40,
  padding: "0 16px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  border: active
    ? "1px solid color-mix(in srgb, var(--app-accent) 45%, transparent)"
    : "1px solid color-mix(in srgb, var(--color-text) 14%, transparent)",
  background: active ? "color-mix(in srgb, var(--app-accent) 15%, transparent)" : "#fff",
  color: active ? "var(--app-accent-strong)" : "#201e1d",
});
