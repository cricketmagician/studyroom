export type Task = { id: string; title: string; done: boolean; due: string | null; createdAt?: { toMillis(): number } | null };

export type TaskGroup = "overdue" | "today" | "upcoming" | "someday" | "done";

export const GROUP_LABELS: Record<TaskGroup, string> = {
  overdue: "Overdue",
  today: "Today",
  upcoming: "Upcoming",
  someday: "No date",
  done: "Completed",
};

/** `today` is a local YYYY-MM-DD key; `due` uses the same format, so plain string comparison orders dates. */
export function groupOf(t: Task, today: string): TaskGroup {
  if (t.done) return "done";
  if (!t.due) return "someday";
  if (t.due < today) return "overdue";
  return t.due === today ? "today" : "upcoming";
}

/** Tasks bucketed by group; dated groups sorted soonest first, others newest first. */
export function groupTasks(tasks: Task[], today: string) {
  const groups: Record<TaskGroup, Task[]> = { overdue: [], today: [], upcoming: [], someday: [], done: [] };
  for (const t of tasks) groups[groupOf(t, today)].push(t);
  const newest = (a: Task, b: Task) => (b.createdAt?.toMillis() ?? Infinity) - (a.createdAt?.toMillis() ?? Infinity);
  for (const g of ["overdue", "upcoming"] as const) groups[g].sort((a, b) => a.due!.localeCompare(b.due!));
  for (const g of ["today", "someday", "done"] as const) groups[g].sort(newest);
  return groups;
}
