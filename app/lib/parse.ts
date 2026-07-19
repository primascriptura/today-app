import type { SlotKey } from "./types";

/** One task as returned by the Claude parser (before it becomes a full Task). */
export interface ParsedTask {
  title: string;
  /** Index 0–6 into the fixed demo week (DAYS in data.ts). */
  day: number;
  slot: SlotKey;
  /** Short human label, e.g. "6:00 PM" or "Friday", or null. */
  meta: string | null;
  priority: boolean;
  notes: string | null;
}

export interface ParseResponse {
  tasks: ParsedTask[];
}

/** Strict JSON schema Claude must fill. `day` uses enum (schema forbids min/max). */
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
        required: ["title", "day", "slot", "meta", "priority", "notes"],
        properties: {
          title: { type: "string" },
          day: { type: "integer", enum: [0, 1, 2, 3, 4, 5, 6] },
          slot: {
            type: "string",
            enum: ["morning", "afternoon", "evening", "anytime"],
          },
          meta: { type: ["string", "null"] },
          priority: { type: "boolean" },
          notes: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;
