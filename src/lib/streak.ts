export type Streak = { last: string; count: number; days: string[] };

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Record a visit on `today`: same day is a no-op, the next day extends the streak, a gap restarts it. */
export function recordVisit(prev: Streak | null, today: Date): Streak {
  const key = dayKey(today);
  if (prev?.last === key) return prev;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const count = prev?.last === dayKey(yesterday) ? prev.count + 1 : 1;
  return { last: key, count, days: [...(prev?.days ?? []), key].slice(-7) };
}

/** Monday-first keys for the week containing `today`. */
export function weekKeys(today: Date) {
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return dayKey(d);
  });
}
