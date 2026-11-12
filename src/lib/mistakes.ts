export type MistakeKind = "concept" | "calc" | "silly" | "read" | "formula" | "time";

export type Mistake = {
  id: string; paper: string; chapter: string; mock: string; kind: MistakeKind;
  question: string; wrong: string; fix: string; marks: number;
  box: number; due: string; mastered: boolean; createdAt?: { toMillis(): number } | null;
};

export const KINDS: { id: MistakeKind; label: string; hint: string; tint: string }[] = [
  { id: "concept", label: "Concept not clear", hint: "I did not understand the topic", tint: "violet" },
  { id: "calc", label: "Calculation error", hint: "Right method, wrong numbers", tint: "blue" },
  { id: "silly", label: "Silly mistake", hint: "I knew it, but slipped", tint: "pink" },
  { id: "read", label: "Misread the question", hint: "Missed a word or condition", tint: "amber" },
  { id: "formula", label: "Forgot a formula or rule", hint: "Could not recall it in the exam", tint: "green" },
  { id: "time", label: "Ran out of time", hint: "Knew it, could not finish", tint: "orange" },
];

/** Days until the next review after each correct recall. Five in a row and the mistake is fixed for good. */
export const INTERVALS = [1, 3, 7, 14, 30];

const shift = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

/** First review is tomorrow: write it down today, test yourself tomorrow. */
export const firstReview = (today: string) => ({ box: 0, due: shift(today, INTERVALS[0]), mastered: false });

/** Spaced repetition: "Got it" moves the mistake to a longer gap; "Still tricky" starts it again from tomorrow. */
export function afterReview(box: number, gotIt: boolean, today: string) {
  if (!gotIt) return { box: 0, due: shift(today, INTERVALS[0]), mastered: false };
  const next = box + 1;
  return next >= INTERVALS.length ? { box: INTERVALS.length, due: today, mastered: true } : { box: next, due: shift(today, INTERVALS[next]), mastered: false };
}

export const isDue = (m: Pick<Mistake, "mastered" | "due">, today: string) => !m.mastered && m.due <= today;

/** Where marks are lost: by kind of mistake and by paper, biggest first. */
export function leaks(list: Pick<Mistake, "kind" | "paper" | "marks">[]) {
  const by = <K extends string>(key: (m: Pick<Mistake, "kind" | "paper" | "marks">) => K) => {
    const out = new Map<K, { count: number; marks: number }>();
    for (const m of list) { const k = key(m); const v = out.get(k) ?? { count: 0, marks: 0 }; out.set(k, { count: v.count + 1, marks: v.marks + m.marks }); }
    return [...out.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.marks - a.marks || b.count - a.count);
  };
  return { kinds: by((m) => m.kind), papers: by((m) => m.paper), total: list.reduce((s, m) => s + m.marks, 0) };
}
