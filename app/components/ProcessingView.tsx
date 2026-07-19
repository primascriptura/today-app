"use client";

// Transient "parsing" indicator, shown only on the finish() fallback path —
// while the whole transcript is parsed at once because nothing was recognized
// live. The live dictation path skips this entirely (cards already on screen).
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
