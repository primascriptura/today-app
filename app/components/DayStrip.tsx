"use client";

import { useEffect, useRef } from "react";
import type { DayInfo } from "@/lib/types";

interface DayStripProps {
  sel: number;
  days: DayInfo[];
  todayIndex: number;
  onSelect: (i: number) => void;
}

export default function DayStrip({ sel, days, onSelect }: DayStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  // Smooth-scroll only after a real tap. The initial center (and the post-
  // hydration re-render) must be instant — a smooth scroll there gets canceled
  // by React's reflow and lands back at 0, hiding today off-screen.
  const userInteracted = useRef(false);

  // Keep the selected chip centered, matching the design's centerDay().
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const center = (smooth: boolean) => {
      const chip = strip.children[sel] as HTMLElement | undefined;
      chip?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: smooth ? "smooth" : "auto",
      });
    };
    center(userInteracted.current);
    // The strip's own box is a fixed width, but its CONTENT widens when the web
    // fonts load after mount — only then do the chips overflow and become
    // scrollable. Until that happens the center call is a no-op (everything
    // "fits") and today ends up off-screen. Re-center once fonts are ready.
    if (userInteracted.current) return;
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled && !userInteracted.current) center(false);
    });
    return () => {
      cancelled = true;
    };
  }, [sel]);

  const handleSelect = (i: number) => {
    userInteracted.current = true;
    onSelect(i);
  };

  return (
    <div
      ref={stripRef}
      className="dayStrip"
      style={{
        display: "flex",
        gap: 10,
        overflowX: "auto",
        scrollSnapType: "x proximity",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        padding: "0 40px",
        margin: "0 -20px",
      }}
    >
      {days.map((d, i) => {
        const on = i === sel;
        const today = d.isToday;
        return (
          <button
            key={d.iso}
            onClick={() => handleSelect(i)}
            aria-pressed={on}
            aria-current={today ? "date" : undefined}
            aria-label={(today ? "Today, " : "") + d.full + " " + d.n}
            style={{
              flex: "none",
              width: 54,
              scrollSnapAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span
              suppressHydrationWarning
              style={{
                width: 37,
                height: 37,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                fontSize: 15,
                fontWeight: 700,
                background: on
                  ? "var(--app-accent)"
                  : "color-mix(in srgb, var(--color-text) 6%, transparent)",
                // Today, when not the active chip, gets an accent ring so it's
                // identifiable at a glance regardless of what's selected.
                boxShadow:
                  today && !on
                    ? "inset 0 0 0 2px var(--app-accent)"
                    : "none",
                color: on
                  ? "#fff"
                  : today
                    ? "var(--app-accent-strong)"
                    : "var(--color-text)",
                transition: "all .18s ease",
              }}
            >
              {d.n}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: today ? 700 : 600,
                color:
                  on || today
                    ? "var(--app-accent-strong)"
                    : "color-mix(in srgb, var(--color-text) 45%, transparent)",
              }}
            >
              {d.wd}
            </span>
            {/* Persistent dot under today — the "you are here" anchor. */}
            <span
              aria-hidden
              style={{
                width: 4,
                height: 4,
                borderRadius: 999,
                marginTop: 1,
                background: today ? "var(--app-accent)" : "transparent",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
