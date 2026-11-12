import { ThinkingLevel } from "@google/genai";
import { adminDb } from "@/lib/server/firebase-admin";
import { errorResponse, gemini, HttpError, MODEL, replyText, requireUser, takeQuota } from "@/lib/server/ai";
import { indiaDay, SUBJECTS } from "@/lib/cma";
import { buildPlan, checkSetup, cleanAiPlan, daysBetween, examDate, PLAN_SCHEMA } from "@/lib/planner";
import { SYLLABUS_DATA } from "@/lib/syllabus-data";

export const maxDuration = 120;
const DAILY_PLANS = 5; // a plan is cheap, but stop accidental loops from running up the bill

const SYSTEM = `You are an expert CMA (ICMAI) exam coach who plans study days for Indian students.
Return a day-by-day plan as JSON. Rules:
- Use only the paper ids given. "chapter" is the 0-based index of a chapter in that paper's "chapters" list.
- Each study day has 1 to 3 blocks; the minutes of a day add up exactly to the daily goal; each block is at least 25 minutes.
- Give papers the student marked weak, and papers they studied least recently, more time. Spread all papers across the plan.
- Chapters are listed in the order to study them; follow that order. Make the last date of this part a revision day (task starts with "Revise").
- "task" is one concrete action in simple English, like "Read the chapter PDF, then solve 5 practice sums". Under 15 words.
- "tip" is one short, encouraging sentence for this student.
- Plan only the dates listed. Do not add other dates.`;

type Plan = { setup: unknown; days: unknown; tip: string | null; source: "ai" | "auto"; createdAt: number };

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const ref = adminDb.doc(`studyUsers/${user.uid}/plans/current`);
    if (body?.action === "get") return Response.json({ plan: (await ref.get()).data() ?? null });
    if (body?.action !== "make") throw new HttpError(400, "Unknown request.");

    const base = adminDb.doc(`studyUsers/${user.uid}`);
    const [state, profile, daily] = await Promise.all([
      base.get(),
      adminDb.doc(`profiles/${user.uid}`).get(),
      base.collection("daily").orderBy("day", "desc").limit(14).get(),
    ]);
    const level = String(state.get("level") ?? profile.get("level") ?? "Intermediate");
    const today = indiaDay(Date.now());
    const recent: Record<string, number> = {};
    for (const d of daily.docs) if (d.get("day") < today) for (const [id, sec] of Object.entries((d.get("subjects") ?? {}) as Record<string, number>)) recent[id] = (recent[id] ?? 0) + sec;
    const papers = SUBJECTS.filter((s) => s.level === level && (!/^20[ABC]$/.test(s.id) || recent[s.id]));
    const setup = checkSetup(body.setup, papers.map((p) => p.id));
    if (typeof setup === "string") throw new HttpError(400, setup);

    await base.set({ dailyGoalMinutes: setup.goalMinutes, targetExam: setup.examTerm }, { merge: true });
    const fallback = buildPlan({ level, goalMinutes: setup.goalMinutes, recent, today, days: setup.days, weak: setup.weak, restDays: setup.restDays });

    let plan: Plan = { setup, days: fallback, tip: null, source: "auto", createdAt: Date.now() };
    try {
      await takeQuota(user.uid, "plans", DAILY_PLANS);
      const exam = examDate(setup.examTerm)!;
      // Speed: one small request per week, all at once. Each week gets its own slice of every paper's chapters (heaviest sections first),
      // so the weeks follow on from each other and each prompt and answer stays short.
      const dates = fallback.filter((d) => d.blocks.length).map((d) => d.day);
      const weeks = Array.from({ length: Math.ceil(dates.length / 6) }, (_, k) => dates.slice(k * 6, k * 6 + 6));
      const chaptersOf = (id: string) => [...(SYLLABUS_DATA.find((x) => x.id === id)?.sections ?? [])].sort((a, b) => b.weight - a.weight).flatMap((s) => s.chapters);
      const sliceFor = (id: string, k: number) => { const all = chaptersOf(id); const part = all.slice(Math.floor((k * all.length) / weeks.length), Math.floor(((k + 1) * all.length) / weeks.length)); return part.length ? part : all; };
      const ai = gemini();
      const parts = await Promise.all(weeks.map(async (week, k) => {
        const brief = {
          level, part: `${k + 1} of ${weeks.length}`, exam: `${setup.examTerm} (about ${exam}, ${daysBetween(today, exam)} days away)`, dailyMinutes: setup.goalMinutes, dates: week, weakPapers: setup.weak,
          hoursStudiedLast14Days: Object.fromEntries(papers.map((p) => [p.id, Math.round((recent[p.id] ?? 0) / 360) / 10])),
          papers: papers.map((p) => ({ id: p.id, name: p.name, difficulty: SYLLABUS_DATA.find((x) => x.id === p.id)?.scoringDifficulty, chapters: sliceFor(p.id, k) })),
        };
        try {
          const response = await ai.models.generateContent({
            model: MODEL,
            contents: [{ role: "user", parts: [{ text: `Make my study plan.\n${JSON.stringify(brief)}` }] }],
            config: { systemInstruction: SYSTEM, responseMimeType: "application/json", responseJsonSchema: PLAN_SCHEMA, thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }, maxOutputTokens: 6000, httpOptions: { timeout: 40000 } },
          });
          const raw = JSON.parse(replyText(response)) as { tip?: unknown; days?: { date: string; blocks: { paperId: string; chapter: unknown }[] }[] };
          // Turn chapter numbers back into names from this week's slice; a bad number becomes "" and is filled in later.
          return { tip: raw.tip, days: (raw.days ?? []).map((d) => ({ ...d, blocks: (d.blocks ?? []).map((b) => ({ ...b, chapter: Number.isInteger(b.chapter) ? sliceFor(b.paperId, k)[b.chapter as number] ?? "" : "" })) })) };
        } catch (err) {
          console.error(`AI plan week ${k + 1} failed`, err instanceof Error ? err.message : err);
          return null;
        }
      }));
      const done = parts.filter((x) => x !== null);
      if (done.length) {
        const tip = done.map((x) => x.tip).find((t): t is string => typeof t === "string");
        plan = { setup, days: cleanAiPlan({ days: done.flatMap((x) => x.days) }, { papers, today, setup, fallback }), tip: tip ? tip.slice(0, 200) : null, source: "ai", createdAt: Date.now() };
      }
    } catch (err) {
      // AI is a bonus: if it is busy, unset or returns junk, the student still gets a full plan from our own rules.
      console.error("AI plan failed, using the built-in plan", err instanceof Error ? err.message : err);
    }
    await ref.set(plan);
    return Response.json({ plan });
  } catch (err) {
    return errorResponse(err);
  }
}
