"use client";

import { useCallback, useRef } from "react";

// Web Speech API doesn't expose input level, so to make the waveform react to
// real speech we open a second, parallel mic stream purely for metering: a
// Web Audio AnalyserNode over getUserMedia. The rAF loop keeps two refs live —
// an overall 0..1 level and a per-band spectrum — that the Waveform reads each
// frame. Metering is best-effort: if the mic is denied or unsupported, the refs
// stay at rest and the bars simply idle, never blocking the speech flow.

const BANDS = 26; // one value per waveform bar

interface AudioCtor {
  new (): AudioContext;
}

function getAudioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: AudioCtor;
    webkitAudioContext?: AudioCtor;
  };
  return w.AudioContext || w.webkitAudioContext || null;
}

export function useMicLevel() {
  // Smoothed overall loudness, 0..1. Read every frame by the waveform.
  const levelRef = useRef(0);
  // Per-bar spectrum, 0..1 each. Length === BANDS.
  const bandsRef = useRef<number[]>(new Array(BANDS).fill(0));

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    bufRef.current = null;
    const ctx = ctxRef.current;
    ctxRef.current = null;
    if (ctx && ctx.state !== "closed") void ctx.close();
    levelRef.current = 0;
    bandsRef.current = new Array(BANDS).fill(0);
  }, []);

  const start = useCallback(async () => {
    const Ctor = getAudioCtor();
    if (!Ctor || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new Ctor();
      ctxRef.current = ctx;
      // AudioContext may start suspended until a gesture — start() is called
      // from the mic tap (a gesture), so resume() is allowed here.
      if (ctx.state === "suspended") void ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128; // 64 frequency bins — plenty for 26 bars
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      bufRef.current = buf;

      const tick = () => {
        const a = analyserRef.current;
        const b = bufRef.current;
        if (!a || !b) return;
        a.getByteFrequencyData(b);

        // Voice energy sits low in the spectrum; skip the very lowest bin (DC /
        // rumble) and weight the speech-relevant range for the overall level.
        const bins = b.length;
        let sum = 0;
        for (let i = 1; i < bins; i++) sum += b[i];
        levelRef.current = sum / (bins - 1) / 255;

        // Map the low-frequency portion of the spectrum across the bars, so the
        // shape genuinely tracks the voice instead of a fixed cadence.
        const used = Math.max(1, Math.floor(bins * 0.7));
        const next = bandsRef.current;
        for (let i = 0; i < BANDS; i++) {
          const bin = 1 + Math.floor((i / BANDS) * used);
          next[i] = b[Math.min(bin, bins - 1)] / 255;
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Denied / unsupported — leave the refs at rest; bars idle.
      stop();
    }
  }, [stop]);

  return { start, stop, levelRef, bandsRef };
}

export type MicLevel = ReturnType<typeof useMicLevel>;
