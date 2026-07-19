"use client";

import { useCallback, useRef } from "react";

export type SpeechError = "no-mic" | "no-speech" | "unsupported" | "aborted";

// The Web Speech API isn't in the standard TS lib, so we declare the minimal
// shapes we actually touch rather than pulling in the full (non-standard) types.
interface SRAlternative {
  readonly transcript: string;
}
interface SRResult {
  readonly isFinal: boolean;
  readonly [index: number]: SRAlternative;
}
interface SRResultList {
  readonly length: number;
  readonly [index: number]: SRResult;
}
interface SRResultEvent {
  readonly resultIndex: number;
  readonly results: SRResultList;
}
interface SRErrorEvent {
  readonly error: string;
}

// Minimal shape of the browser SpeechRecognition we rely on.
interface SR {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SRResultEvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getCtor(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SR;
    webkitSpeechRecognition?: new () => SR;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useSpeech() {
  const recRef = useRef<SR | null>(null);
  const finalRef = useRef("");
  // Fires once per finalized utterance (after a natural pause), so the caller
  // can parse each phrase live instead of waiting for stop(). Set by start().
  const onChunkRef = useRef<((text: string) => void) | null>(null);
  // Fires continuously with the in-progress (not-yet-final) transcript, so a
  // card can appear and stream text WHILE the user is still speaking.
  const onInterimRef = useRef<((text: string) => void) | null>(null);
  // Resolver for stop(): set when recognition ends.
  const endResolveRef = useRef<((t: string) => void) | null>(null);
  const endRejectRef = useRef<((e: SpeechError) => void) | null>(null);
  const errorRef = useRef<SpeechError | null>(null);

  const isSupported = useCallback(() => getCtor() !== null, []);

  const start = useCallback(
    (onChunk?: (text: string) => void, onInterim?: (text: string) => void) => {
    return new Promise<void>((resolve, reject) => {
      const Ctor = getCtor();
      if (!Ctor) {
        reject("unsupported" as SpeechError);
        return;
      }
      const rec = new Ctor();
      rec.lang = "uk-UA";
      rec.continuous = true;
      // Interim results stream partial text as the user speaks, so a card can
      // appear immediately instead of waiting for the phrase to finalize.
      rec.interimResults = true;
      finalRef.current = "";
      errorRef.current = null;
      onChunkRef.current = onChunk ?? null;
      onInterimRef.current = onInterim ?? null;

      rec.onresult = (e: SRResultEvent) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const result = e.results[i];
          if (result.isFinal) {
            const chunk = result[0].transcript.trim();
            finalRef.current += chunk + " ";
            // Emit the just-finalized phrase so the caller can parse it live.
            if (chunk) onChunkRef.current?.(chunk);
          } else {
            // Accumulate the in-progress phrase for a live-updating card.
            interim += result[0].transcript;
          }
        }
        const partial = interim.trim();
        if (partial) onInterimRef.current?.(partial);
      };
      rec.onerror = (e: SRErrorEvent) => {
        const code = e?.error;
        errorRef.current =
          code === "not-allowed" || code === "service-not-allowed"
            ? "no-mic"
            : code === "no-speech"
              ? "no-speech"
              : code === "aborted"
                ? "aborted"
                : "no-speech";
      };
      rec.onend = () => {
        const text = finalRef.current.trim();
        if (endResolveRef.current) {
          if (!text && errorRef.current) {
            endRejectRef.current?.(errorRef.current);
          } else if (!text) {
            endRejectRef.current?.("no-speech");
          } else {
            endResolveRef.current(text);
          }
          endResolveRef.current = null;
          endRejectRef.current = null;
        }
      };
      rec.onstart = () => resolve();

      recRef.current = rec;
      try {
        rec.start();
      } catch {
        reject("no-mic" as SpeechError);
      }
    });
  }, []);

  const stop = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      const rec = recRef.current;
      if (!rec) {
        reject("aborted" as SpeechError);
        return;
      }
      endResolveRef.current = resolve;
      endRejectRef.current = reject;
      rec.stop(); // triggers onend → resolves/rejects above
    });
  }, []);

  const abort = useCallback(() => {
    const rec = recRef.current;
    endResolveRef.current = null;
    endRejectRef.current = null;
    onChunkRef.current = null;
    onInterimRef.current = null;
    if (rec) rec.abort();
    recRef.current = null;
  }, []);

  return { isSupported, start, stop, abort };
}
