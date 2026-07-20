"use client";

import { useMemo } from "react";
import { CONFETTI_COLORS } from "@/lib/data";
import type { PlannerActions } from "@/lib/usePlanner";

interface FirstTaskCelebrationProps {
  actions: PlannerActions;
}

interface ConfettiPiece {
  id: number;
  left: number; // % across the burst area
  size: number; // px, long edge
  color: string;
  delayMs: number;
  driftX: number; // px, horizontal settle
  rotate: number; // deg, total spin
  durationMs: number;
}

const PIECE_COUNT = 16;

function makePieces(): ConfettiPiece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: 6 + Math.random() * 88,
    size: 6 + Math.random() * 5,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delayMs: Math.round(Math.random() * 260),
    driftX: Math.round((Math.random() - 0.5) * 70),
    rotate: Math.round((Math.random() - 0.5) * 360),
    durationMs: 900 + Math.round(Math.random() * 400),
  }));
}

// One-time "first task ever completed" milestone: a confetti burst in the
// app's brand tones + a badge, same top-anchored drop-in family as
// ConfirmationToast. usePlanner clears `celebrate` on its own after ~3.2s;
// tapping dismisses immediately (mirrors ConfirmationToast's tap-to-dismiss).
export default function FirstTaskCelebration({ actions }: FirstTaskCelebrationProps) {
  // Generated once per mount (i.e. once per celebration), not per render.
  const pieces = useMemo(makePieces, []);

  return (
    <div
      onClick={actions.dismissCelebration}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 70,
        display: "flex",
        justifyContent: "center",
        padding: "0 22px",
        cursor: "pointer",
        zIndex: 8,
      }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: 330 }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: -40,
            height: 90,
            pointerEvents: "none",
          }}
        >
          {pieces.map((p) => (
            <span
              key={p.id}
              style={
                {
                  position: "absolute",
                  left: `${p.left}%`,
                  top: 0,
                  width: p.size,
                  height: p.size * 0.4,
                  borderRadius: 2,
                  background: p.color,
                  opacity: 0,
                  "--drift-x": `${p.driftX}px`,
                  "--rotate": `${p.rotate}deg`,
                  animation: `confettiFall ${p.durationMs}ms cubic-bezier(.23,1,.32,1) ${p.delayMs}ms forwards`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div
          role="status"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#fff",
            borderRadius: 22,
            padding: "15px 20px",
            boxShadow: "0 12px 32px rgba(46,43,37,.2)",
            animation: "toastIn .35s cubic-bezier(.2,.7,.2,1)",
            transform: "rotate(2deg)",
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              flex: "none",
              borderRadius: 999,
              background: "#e6e9f7",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--app-accent-strong)">
              <path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8z" />
            </svg>
          </span>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#201e1d" }}>
              First task done
            </div>
            <div
              style={{
                fontSize: 13,
                color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                marginTop: 1,
              }}
            >
              Nice start — keep it up.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
