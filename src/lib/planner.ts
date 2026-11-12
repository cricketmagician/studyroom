import { SUBJECTS } from "./cma";
import { SYLLABUS_DATA } from "./syllabus-data";

export type PlanBlock = { subjectId: string; name: string; minutes: number; chapter: string; reason: string };
export type DayPlan = { day: string; blocks: PlanBlock[] };

/** Hard papers need more time; easier-to-score papers a little less. */
const EFFORT: Record<string, number> = { Hard: 1.3, Medium: 1, "Easier to score": 0.8 };
const ELECTIVE = /^20[ABC]$/;

/** The exam usually starts around the 10th of June or December. `term` looks like "Dec 2026 Term". */
export function examDate(term: string) {
  const m = /^(June|Dec)\s+(\d{4})/.exec(term);
  return m ? `${m[2]}-${m[1] === "June" ? "06" : "12"}-10` : null;
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

/** One chapter per paper per day, cycling through the syllabus with heavier sections first, so the whole paper gets covered. */
function chapterFor(subjectId: string, day: string) {
  const paper = SYLLABUS_DATA.find((p) => p.id === subjectId);
  const chapters = paper ? [...paper.sections].sort((a, b) => b.weight - a.weight).flatMap((s) => s.chapters) : [];
  if (!chapters.length) return "Revise your notes";
  return chapters[Math.abs(daysBetween("2026-01-01", day)) % chapters.length];
}

/**
 * Builds the next `days` of study blocks from what the student has actually done.
 * `recent` is seconds per subject over the last two weeks. Papers you have neglected, and harder papers, come first.
 */
export function buildPlan({ level, goalMinutes, recent, today, days = 7, weak = [], restDays = [] }: { level: string; goalMinutes: number; recent: Record<string, number>; today: string; days?: number; weak?: string[]; restDays?: number[] }): DayPlan[] {
  // shortcut: a Final student takes one elective (20A/B/C); we only plan the ones they have studied. Ask for the elective in the profile if this guess is wrong too often.
  const papers = SUBJECTS.filter((s) => s.level === level && (!ELECTIVE.test(s.id) || recent[s.id]));
  if (!papers.length || goalMinutes <= 0) return [];
  const load: Record<string, number> = Object.fromEntries(papers.map((p) => [p.id, (recent[p.id] ?? 0) / 3600]));
  const blocksPerDay = goalMinutes <= 60 ? 1 : goalMinutes <= 150 ? 2 : 3;
  const plan: DayPlan[] = [];
  for (let d = 0; d < days; d++) {
    const day = addDays(today, d);
    if (restDays.includes(new Date(`${day}T00:00:00Z`).getUTCDay())) { plan.push({ day, blocks: [] }); continue; }
    const score = (id: string) => (weak.includes(id) ? 1.5 : 1) * (EFFORT[SYLLABUS_DATA.find((p) => p.id === id)?.scoringDifficulty ?? "Medium"] ?? 1) / (1 + load[id]);
    const picks = [...papers].sort((a, b) => score(b.id) - score(a.id) || a.id.localeCompare(b.id)).slice(0, blocksPerDay);
    const total = picks.reduce((sum, p) => sum + score(p.id), 0);
    let left = goalMinutes;
    const blocks = picks.map((p, i) => {
      const minutes = i === picks.length - 1 ? left : Math.max(15, Math.round((goalMinutes * score(p.id)) / total / 5) * 5);
      left -= minutes;
      load[p.id] += minutes / 60;
      const hours = (recent[p.id] ?? 0) / 3600;
      return { subjectId: p.id, name: p.name, minutes, chapter: chapterFor(p.id, day), reason: hours < 1 ? "Not studied in the last 2 weeks" : `Only ${Math.round(hours)} h in the last 2 weeks` };
    });
    plan.push({ day, blocks });
  }
  return plan;
}

export type PlanSetup = { goalMinutes: number; examTerm: string; weak: string[]; restDays: number[]; days: number };
export const PLAN_LENGTHS = [7, 15, 30];

/** Checks the student's setup at the trust boundary. Returns a clean copy or an error message. */
export function checkSetup(raw: unknown, papers: string[]): PlanSetup | string {
  const s = raw as Partial<PlanSetup> | null;
  if (!s || typeof s !== "object") return "Fill in your plan settings.";
  if (!Number.isInteger(s.goalMinutes) || s.goalMinutes! < 30 || s.goalMinutes! > 720) return "Choose a daily goal between 30 minutes and 12 hours.";
  if (typeof s.examTerm !== "string" || !examDate(s.examTerm)) return "Choose your exam term.";
  if (!PLAN_LENGTHS.includes(s.days as number)) return "Choose 7, 15 or 30 days.";
  const weak = Array.isArray(s.weak) ? [...new Set(s.weak.filter((id): id is string => typeof id === "string" && papers.includes(id)))] : [];
  const restDays = Array.isArray(s.restDays) ? [...new Set(s.restDays.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6))] : [];
  if (restDays.length > 2) return "Keep at most 2 rest days a week.";
  return { goalMinutes: s.goalMinutes!, examTerm: s.examTerm, weak, restDays, days: s.days! };
}

/** JSON shape we ask the AI for. */
export const PLAN_SCHEMA = {
  type: "object",
  properties: {
    tip: { type: "string" },
    days: { type: "array", items: { type: "object", properties: {
      date: { type: "string" },
      blocks: { type: "array", items: { type: "object", properties: {
        paperId: { type: "string" }, minutes: { type: "integer" }, chapter: { type: "integer", description: "0-based index into that paper's chapters list" }, task: { type: "string" },
      }, required: ["paperId", "minutes", "chapter", "task"] } },
    }, required: ["date", "blocks"] } },
  },
  required: ["tip", "days"],
};

/**
 * Never trust the model: keep only real papers, real dates and sane minutes, and fill any gaps from `fallback`.
 * Days line up with the dates we expect; rest days stay empty; a day never exceeds the daily goal.
 */
export function cleanAiPlan(raw: unknown, { papers, today, setup, fallback }: { papers: { id: string; name: string }[]; today: string; setup: PlanSetup; fallback: DayPlan[] }): DayPlan[] {
  const got = new Map<string, unknown[]>();
  const rawDays = (raw as { days?: unknown })?.days;
  if (Array.isArray(rawDays)) for (const d of rawDays) if (d && typeof (d as { date?: unknown }).date === "string" && Array.isArray((d as { blocks?: unknown }).blocks)) got.set((d as { date: string }).date, (d as { blocks: unknown[] }).blocks);
  return fallback.map((f) => {
    if (setup.restDays.includes(new Date(`${f.day}T00:00:00Z`).getUTCDay())) return { day: f.day, blocks: [] };
    const blocks: PlanBlock[] = [];
    let left = setup.goalMinutes;
    for (const b of (got.get(f.day) ?? []).slice(0, 4) as { paperId?: unknown; minutes?: unknown; chapter?: unknown; task?: unknown }[]) {
      const paper = papers.find((p) => p.id === b?.paperId);
      const minutes = Math.min(Number.isInteger(b?.minutes) ? (b.minutes as number) : 0, left);
      if (!paper || minutes < 15 || blocks.some((x) => x.subjectId === paper.id)) continue;
      blocks.push({ subjectId: paper.id, name: paper.name, minutes, chapter: String(b.chapter ?? "").trim().slice(0, 120) || chapterFor(paper.id, f.day), reason: String(b.task ?? "").trim().slice(0, 160) });
      left -= minutes;
    }
    return blocks.length ? { day: f.day, blocks } : f;
  }).filter((d, i) => i < setup.days && d.day >= today);
}
