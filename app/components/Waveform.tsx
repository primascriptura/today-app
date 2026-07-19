"use client";

import { useEffect, useRef, type RefObject } from "react";

interface WaveformProps {
  paused: boolean;
  /** Live 0..1 loudness from the mic (useMicLevel). */
  levelRef: RefObject<number>;
  /** Per-bar 0..1 spectrum from the mic (useMicLevel). */
  bandsRef: RefObject<number[]>;
}

const BARS = 26;
const HEIGHT = 34;

// Resting scale — bars never collapse to nothing, they sit at a calm baseline.
const IDLE = 0.16;
// How much the idle "breathing" adds on top of IDLE during silence.
const BREATHE = 0.06;
// Above this loudness we treat it as real speech and let the spectrum drive.
const SPEAKING = 0.045;
// Spectrum → bar-height gain when speaking.
const GAIN = 1.7;
// Asymmetric smoothing: quick to rise (attack), slower to fall (decay) — reads
// like a real level meter instead of a jittery equalizer.
const ATTACK = 0.45;
const DECAY = 0.18;

// A voice-reactive meter. When the mic hears speech the bars track the live
// spectrum; in silence they ease down to a gentle breathing baseline. Driven by
// one rAF loop writing transforms straight to the DOM — no per-frame React state.
export default function Waveform({ paused, levelRef, bandsRef }: WaveformProps) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const curRef = useRef<number[]>(new Array(BARS).fill(IDLE));
  const opacityRef = useRef(0.55);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const tick = (now: number) => {
      const level = levelRef.current ?? 0;
      const bands = bandsRef.current ?? [];
      const speaking = !paused && level > SPEAKING;
      const cur = curRef.current;

      for (let i = 0; i < BARS; i++) {
        let target: number;
        if (paused) {
          target = IDLE; // frozen calm
        } else if (speaking) {
          target = Math.min(1, IDLE + (bands[i] ?? 0) * GAIN);
        } else if (reduced) {
          target = IDLE; // calm, no decorative motion
        } else {
          // Gentle travelling wave, low amplitude — "alive but quiet".
          const phase = now * 0.0022 + i * 0.35;
          target = IDLE + BREATHE * (0.5 + 0.5 * Math.sin(phase));
        }

        const k = target > cur[i] ? ATTACK : DECAY;
        cur[i] += (target - cur[i]) * k;

        const el = barsRef.current[i];
        if (el) el.style.transform = `scaleY(${cur[i].toFixed(3)})`;
      }

      // Dim the whole meter in silence, brighten with the voice.
      const targetOpacity = paused ? 0.4 : 0.55 + 0.45 * Math.min(1, level * 3);
      opacityRef.current += (targetOpacity - opacityRef.current) * 0.2;
      const wrap = barsRef.current[0]?.parentElement;
      if (wrap) wrap.style.opacity = opacityRef.current.toFixed(3);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, levelRef, bandsRef]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        height: 44,
        opacity: 0.55,
        transition: "opacity .2s ease",
      }}
    >
      {Array.from({ length: BARS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          style={{
            display: "block",
            width: 4,
            height: HEIGHT,
            borderRadius: 4,
            background: "var(--app-accent)",
            transformOrigin: "center",
            transform: `scaleY(${IDLE})`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
