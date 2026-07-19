"use client";

// Transient "parsing" indicator. STUBBED: no real work happens — it's a short
// timed step in usePlanner before the confirmation toast.
export default function ProcessingView() {
  const dot = (delay: string): React.CSSProperties => ({
    width: 12,
    height: 12,
    borderRadius: 999,
    background: "var(--app-accent)",
    animation: `dotPulse 1s ease-in-out ${delay} infinite`,
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "layerIn .3s ease",
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        <span style={dot("0s")} />
        <span style={dot(".16s")} />
        <span style={dot(".32s")} />
      </div>
    </div>
  );
}
