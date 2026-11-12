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

const WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const shift = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

/**
 * Reads a due date out of what the student typed, in English or Hinglish, so they never have to pick a date:
 * "Mock test kal" -> tomorrow, "revise costing on sunday" -> next Sunday, "RTP in 3 days" -> +3.
 * `today` is YYYY-MM-DD. Returns the title without the date words.
 */
export function parseQuickTask(input: string, today: string): { title: string; due: string | null } {
  const rules: [RegExp, (m: RegExpMatchArray) => number][] = [
    [/\b(?:day after tomorrow|parso|parson)\b/i, () => 2],
    [/\b(?:today|aaj|tonight)\b/i, () => 0],
    [/\b(?:tomorrow|tmrw|kal)\b/i, () => 1],
    [/\bin (\d{1,2}) days?\b/i, (m) => Number(m[1])],
    [/\b(next )?(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/i, (m) => {
      const diff = (WEEK.indexOf(m[2].toLowerCase()) - new Date(`${today}T00:00:00Z`).getUTCDay() + 7) % 7;
      return m[1] || diff === 0 ? diff + 7 : diff;
    }],
  ];
  for (const [re, days] of rules) {
    const m = input.match(re);
    if (!m) continue;
    const title = input.replace(re, " ").replace(/\b(?:on|by|for|this)\s*$/i, "").replace(/\s+(?:on|by)\s+(?=\s|$)/i, " ").replace(/\s{2,}/g, " ").trim();
    return { title: title || input.trim(), due: shift(today, days(m)) };
  }
  return { title: input.trim(), due: null };
}
