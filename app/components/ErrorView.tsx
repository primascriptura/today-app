"use client";

import type { PlannerActions } from "@/lib/usePlanner";

interface ErrorViewProps {
  actions: PlannerActions;
}

// "Nothing understood" state. Not auto-reachable in the stub (the fake voice
// flow always succeeds, per the optimistic-save decision), but fully wired:
// Retry → Listening, Type instead → compose sheet. This is where the real
// transcription's total-failure branch will land once AI is added.
export default function ErrorView({ actions }: ErrorViewProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: "62px 28px 52px",
        animation: "layerIn .4s ease",
      }}
    >
      <div>
        <button
          onClick={actions.cancel}
          aria-label="Close"
          style={{
            width: 56,
            height: 56,
            border: "none",
            borderRadius: 999,
            background: "rgba(255,255,255,.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 2px 10px rgba(40,44,70,.16)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#201e1d" strokeWidth="2.75" strokeLinecap="round">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 22,
        }}
      >
        <span
          style={{
            width: 76,
            height: 76,
            borderRadius: 999,
            background: "rgba(255,255,255,.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 2px 10px rgba(40,44,70,.12)",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--app-accent-strong)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v5" />
            <path d="M15 5.5V10a3 3 0 0 1-.35 1.4" />
            <path d="M19 10v2a7 7 0 0 1-1.1 3.75" />
            <path d="M5 10v2a7 7 0 0 0 7 7" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="3" y1="3" x2="21" y2="21" />
          </svg>
        </span>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#201e1d" }}>
            Couldn&rsquo;t catch that
          </div>
          <div
            style={{
              fontSize: 16,
              color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
              marginTop: 8,
              maxWidth: 280,
            }}
          >
            Nothing was saved — give it another go.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={actions.retry}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            height: 54,
            border: "none",
            borderRadius: 999,
            background: "var(--app-accent)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 8px 22px rgba(60,66,110,.28)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <polyline points="3 3 3 6 6 6" />
          </svg>
          Try again
        </button>
        <button
          onClick={actions.typeInstead}
          style={{
            height: 54,
            border: "1px solid color-mix(in srgb, var(--color-text) 18%, transparent)",
            borderRadius: 999,
            background: "transparent",
            color: "var(--app-accent-strong)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Type it instead
        </button>
      </div>
    </div>
  );
}
