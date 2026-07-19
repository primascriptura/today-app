import { STRIP_LENGTH } from "./dates";
import type { IconKey, SlotKey } from "./types";

/** Valid day indices (0…STRIP_LENGTH-1) — the fixed size of the rolling strip. */
const DAY_INDICES = Array.from({ length: STRIP_LENGTH }, (_, i) => i);

/**
 * Category glyphs Claude may pick for a task (time-of-day icons are excluded —
 * those belong to slot headers, not tasks). `dot` is the neutral fallback.
 */
export const TASK_ICON_KEYS = [
  "brief",
  "mail",
  "users",
  "card",
  "home",
  "phone",
  "cart",
  "heart",
  "activity",
  "book",
  "plane",
  "food",
  "doc",
  "pen",
  "gift",
  "calendar",
  "dot",
] as const satisfies readonly IconKey[];

/** One task as returned by the Claude parser (before it becomes a full Task). */
export interface ParsedTask {
  title: string;
  /** Index into the demo strip (0…DAYS.length-1) in data.ts. */
  day: number;
  slot: SlotKey;
  /** Short human label, e.g. "6:00 PM" or "Friday", or null. */
  meta: string | null;
  priority: boolean;
  notes: string | null;
  /** Category glyph chosen by the parser (one of TASK_ICON_KEYS). */
  icon: IconKey;
}

export interface ParseResponse {
  tasks: ParsedTask[];
}

/**
 * Strict JSON schema Claude must fill. `day` uses an enum of every valid index in
 * DAYS (schema forbids min/max), so the model can only land tasks on real strip days.
 */
export const TASK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["tasks"],
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "day", "slot", "meta", "priority", "notes", "icon"],
        properties: {
          title: { type: "string" },
          day: { type: "integer", enum: DAY_INDICES },
          slot: {
            type: "string",
            enum: ["morning", "afternoon", "evening", "anytime"],
          },
          meta: { type: ["string", "null"] },
          priority: { type: "boolean" },
          notes: { type: ["string", "null"] },
          icon: { type: "string", enum: TASK_ICON_KEYS },
        },
      },
    },
  },
} as const;
