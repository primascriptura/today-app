"use client";

import { useEffect, useRef } from "react";
import { DAYS } from "@/lib/data";

interface DayStripProps {
  sel: number;
  onSelect: (i: number) => void;
}

export default function DayStrip({ sel, onSelect }: DayStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);

  // Keep the selected chip centered, matching the design's centerDay().
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const chip = strip.children[sel] as HTMLElement | undefined;
    if (!chip) return;
    const target = chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2;
    strip.scrollTo({
      left: Math.max(0, target),
      behavior: readyRef.current ? "smooth" : "auto",
    });
    readyRef.current = true;
  }, [sel]);

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
      {DAYS.map((d, i) => {
        const on = i === sel;
        return (
          <button
            key={d.n}
            onClick={() => onSelect(i)}
            aria-pressed={on}
            aria-label={d.full + " " + d.n}
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
                color: on ? "#fff" : "var(--color-text)",
                transition: "all .18s ease",
              }}
            >
              {d.n}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: on
                  ? "var(--app-accent-strong)"
                  : "color-mix(in srgb, var(--color-text) 45%, transparent)",
              }}
            >
              {d.wd}
            </span>
          </button>
        );
      })}
    </div>
  );
}
