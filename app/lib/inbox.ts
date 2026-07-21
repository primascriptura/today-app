import type { Priority, Task } from "./types";

/** A priority section in the Inbox, in fixed HIGH → MEDIUM → LOW → TO-DO order. */
export interface InboxGroup {
  /** Namespaced collapse key, e.g. "inbox:1". */
  key: string;
  priority: Priority;
  /** Header word: HIGH / MEDIUM / LOW / TO-DO. */
  label: string;
  tasks: Task[];
}

const GROUP_LABEL: Record<Priority, string> = {
  1: "HIGH",
  2: "MEDIUM",
  3: "LOW",
  4: "TO-DO",
};

/** Priority level, treating missing/invalid as 4 (no priority). */
export function taskPriority(t: Task): Priority {
  const p = t.priority;
  return p === 1 || p === 2 || p === 3 ? p : 4;
}

const isActive = (t: Task) => t.completedAt == null;

/**
 * Group active (not-completed) tasks by priority. All four sections are always
 * returned — including empty ones — so the Inbox mirrors Tiimo's persistent
 * HIGH/MEDIUM/LOW/TO-DO pills.
 */
export function groupActiveByPriority(tasks: Task[]): InboxGroup[] {
  const order: Priority[] = [1, 2, 3, 4];
  return order.map((priority) => ({
    key: `inbox:${priority}`,
    priority,
    label: GROUP_LABEL[priority],
    tasks: tasks.filter((t) => isActive(t) && taskPriority(t) === priority),
  }));
}

/** Completed tasks, most-recently-completed first (for the Done section). */
export function completedTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => t.completedAt != null)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
}
