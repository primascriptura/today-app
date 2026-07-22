"use client";

import { useRef, type CSSProperties, type RefObject } from "react";
import type { Segment } from "@/lib/nlp";

interface HighlightedInputProps {
  value: string;
  /** Runs to draw; matched runs (date/time/priority) render in the brand colour. */
  segments: Segment[];
  onChange: (value: string) => void;
  onEnter?: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  placeholder?: string;
  /** Typography shared by the real input and its highlight mirror. */
  textStyle: CSSProperties;
}

// Highlight chrome for a recognised token. No horizontal padding (that would
// shift glyph advance and break mirror↔input alignment); the box-shadow fakes
// the padded pill instead, so the text metrics stay identical to the input.
const TINT = "color-mix(in srgb, var(--app-accent) 15%, transparent)";
const tokenStyle: CSSProperties = {
  color: "var(--app-accent-strong)",
  background: TINT,
  borderRadius: 4,
  boxShadow: `0 0 0 2px ${TINT}`,
};

export default function HighlightedInput({
  value,
  segments,
  onChange,
  onEnter,
  inputRef,
  placeholder,
  textStyle,
}: HighlightedInputProps) {
  const mirrorRef = useRef<HTMLDivElement>(null);

  // The real input is the source of truth; its glyphs are transparent so the
  // mirror underneath shows the text (plain in the normal colour, tokens in the
  // brand colour). Keep the mirror's horizontal scroll locked to the input's so
  // a long, scrolled line stays aligned with the caret.
  const syncScroll = () => {
    const m = mirrorRef.current;
    const inp = inputRef.current;
    if (m && inp) m.scrollLeft = inp.scrollLeft;
  };

  // Single-line, no wrap — the mirror sits exactly under the input's own text.
  const shared: CSSProperties = {
    ...textStyle,
    whiteSpace: "pre",
    overflow: "hidden",
    margin: 0,
  };
  // Only hide the input's own glyphs once there's text for the mirror to show —
  // otherwise the transparent fill would swallow the placeholder too.
  const hideText = value.length > 0;
  const textColor = (textStyle.color as string) ?? "#201e1d";

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={mirrorRef}
        aria-hidden
        style={{
          ...shared,
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          color: textColor,
        }}
      >
        {segments.map((seg, i) => (
          <span key={i} style={seg.kind === "plain" ? undefined : tokenStyle}>
            {seg.text}
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          syncScroll();
        }}
        onScroll={syncScroll}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        placeholder={placeholder}
        style={{
          ...shared,
          position: "relative",
          border: "none",
          outline: "none",
          background: "transparent",
          // Glyphs transparent (the mirror shows them); the caret stays visible.
          color: hideText ? "transparent" : textColor,
          caretColor: textColor,
          WebkitTextFillColor: hideText ? "transparent" : undefined,
        }}
      />
    </div>
  );
}
