"use client";

interface WaveformProps {
  paused: boolean;
}

// Purely decorative bars. With real audio these would be driven by input level;
// for the stub they animate on a fixed cadence, and freeze when paused.
export default function Waveform({ paused }: WaveformProps) {
  const bars = Array.from({ length: 26 }, (_, i) => {
    const dur = 0.62 + (i % 5) * 0.13;
    const delay = ((i * 7) % 9) * 0.05;
    return (
      <span
        key={i}
        style={{
          display: "block",
          width: 4,
          height: 34,
          borderRadius: 4,
          background: "var(--app-accent)",
          transformOrigin: "center",
          animation: `wave ${dur}s ease-in-out ${delay}s infinite`,
          animationPlayState: paused ? "paused" : "running",
          opacity: paused ? 0.4 : 1,
          transition: "opacity .2s ease",
        }}
      />
    );
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: 44 }}>
      {bars}
    </div>
  );
}
