"use client";

import type { CSSProperties, ReactNode } from "react";

interface SheetShellProps {
  title: string;
  /** Dismiss without saving (backdrop tap, X, or back chevron). */
  onClose: () => void;
  /**
   * When set, the left control is a back chevron (for sub-sheets opened from
   * another sheet) and calls this instead of showing an X.
   */
  onBack?: () => void;
  /** Primary confirm; when omitted, no right-hand button is shown. */
  onSave?: () => void;
  /** Grey out the confirm button when the current selection isn't valid yet. */
  saveDisabled?: boolean;
  /** Stacking order — sub-sheets pass a higher value to sit above their parent. */
  zIndex?: number;
  children: ReactNode;
}

const roundBtn: CSSProperties = {
  width: 40,
  height: 40,
  flex: "none",
  borderRadius: 999,
  border: "none",
  background: "#fff",
  boxShadow: "var(--shadow-sm)",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  color: "#201e1d",
};

export default function SheetShell({
  title,
  onClose,
  onBack,
  onSave,
  saveDisabled = false,
  zIndex = 8,
  children,
}: SheetShellProps) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(24,26,48,.32)" }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .28s cubic-bezier(.2,.7,.2,1)",
        }}
      >
        <div
          style={{
            background: "#f6f2ea",
            borderRadius: "26px 26px 0 0",
            padding: "14px 18px 22px",
            boxShadow: "0 -6px 24px rgba(24,26,48,.16)",
            maxHeight: "86dvh",
            overflowY: "auto",
          }}
        >
          {/* Grabber */}
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: "color-mix(in srgb, var(--color-text) 18%, transparent)",
              margin: "0 auto 12px",
            }}
          />
          {/* Header: left control · title · confirm */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 40px",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <button
              onClick={onBack ?? onClose}
              aria-label={onBack ? "Back" : "Close"}
              style={roundBtn}
            >
              {onBack ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              )}
            </button>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#201e1d" }}>
              {title}
            </div>
            {onSave ? (
              <button
                onClick={saveDisabled ? undefined : onSave}
                disabled={saveDisabled}
                aria-label="Save"
                style={{
                  ...roundBtn,
                  background: saveDisabled
                    ? "color-mix(in srgb, var(--color-text) 16%, transparent)"
                    : "var(--app-accent)",
                  color: "#fff",
                  cursor: saveDisabled ? "default" : "pointer",
                  boxShadow: saveDisabled ? "none" : "0 4px 12px rgba(60,66,110,.30)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            ) : (
              <span />
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
