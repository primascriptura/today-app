"use client";

import type { PlannerActions } from "@/lib/usePlanner";

interface ConfirmationToastProps {
  actions: PlannerActions;
}

// Passive, dismissible "✓ Saved" note — the optimistic-save confirmation.
// Auto-dismisses after ~3s (handled in usePlanner); tap dismisses immediately.
export default function ConfirmationToast({ actions }: ConfirmationToastProps) {
  return (
    <div
      onClick={actions.dismiss}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 120,
        display: "flex",
        justifyContent: "center",
        padding: "0 22px",
        cursor: "pointer",
        zIndex: 7,
      }}
    >
      <div
        role="status"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          maxWidth: 330,
          background: "#fff",
          borderRadius: 22,
          padding: "15px 20px",
          boxShadow: "0 12px 32px rgba(46,43,37,.2)",
          animation: "toastIn .35s cubic-bezier(.2,.7,.2,1)",
          transform: "rotate(-3deg)",
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            flex: "none",
            borderRadius: 999,
            background: "#e4f3e6",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f9d55" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#201e1d" }}>
            Saved · Follow up on job interview
          </div>
          <div
            style={{
              fontSize: 13,
              color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
              marginTop: 1,
            }}
          >
            Tomorrow, 11:00 AM
          </div>
        </div>
      </div>
    </div>
  );
}
