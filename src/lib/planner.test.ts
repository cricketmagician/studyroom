import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlan, checkSetup, cleanAiPlan, daysBetween, examDate } from "./planner.ts";

test("plan fills the daily goal exactly and puts neglected papers first", () => {
  const plan = buildPlan({ level: "Intermediate", goalMinutes: 150, recent: { "8": 20 * 3600, "5": 10 * 3600 }, today: "2026-11-12" });
  assert.equal(plan.length, 7);
  for (const day of plan) assert.equal(day.blocks.reduce((s, b) => s + b.minutes, 0), 150);
  assert.ok(!plan[0].blocks.some((b) => b.subjectId === "8"), "the most-studied paper is not picked first");
  assert.ok(plan[0].blocks.every((b) => b.minutes >= 15 && b.chapter));
});

test("over a week every paper gets time, and short goals become one block", () => {
  const week = buildPlan({ level: "Intermediate", goalMinutes: 240, recent: {}, today: "2026-11-12" });
  assert.equal(new Set(week.flatMap((d) => d.blocks.map((b) => b.subjectId))).size, 8);
  assert.equal(buildPlan({ level: "Foundation", goalMinutes: 45, recent: {}, today: "2026-11-12" })[0].blocks.length, 1);
});

test("Final electives are planned only once studied", () => {
  const ids = (recent: Record<string, number>) => new Set(buildPlan({ level: "Final", goalMinutes: 240, recent, today: "2026-11-12", days: 14 }).flatMap((d) => d.blocks.map((b) => b.subjectId)));
  assert.ok(!ids({}).has("20B"));
  assert.ok(ids({ "20B": 600 }).has("20B"));
});

test("exam countdown", () => {
  assert.equal(examDate("Dec 2026 Term"), "2026-12-10");
  assert.equal(examDate("June 2027 Term"), "2027-06-10");
  assert.equal(examDate("Not set"), null);
  assert.equal(daysBetween("2026-11-12", "2026-12-10"), 28);
});

test("setup is checked at the trust boundary", () => {
  const papers = ["5", "6", "7", "8"];
  assert.equal(typeof checkSetup({ goalMinutes: 10, examTerm: "Dec 2026 Term", days: 7 }, papers), "string");
  assert.equal(typeof checkSetup({ goalMinutes: 120, examTerm: "Dec 2026 Term", days: 9 }, papers), "string");
  assert.deepEqual(checkSetup({ goalMinutes: 120, examTerm: "Dec 2026 Term", days: 15, weak: ["8", "99", "8"], restDays: [0, 9] }, papers), { goalMinutes: 120, examTerm: "Dec 2026 Term", weak: ["8"], restDays: [0], days: 15 });
});

test("AI plan is cleaned: fake papers, overlong days and rest days are fixed, gaps are filled", () => {
  const papers = [{ id: "5", name: "Laws" }, { id: "8", name: "Costing" }];
  const setup = { goalMinutes: 120, examTerm: "Dec 2026 Term", weak: [], restDays: [0], days: 7 };
  const fallback = buildPlan({ level: "Intermediate", goalMinutes: 120, recent: {}, today: "2026-11-12", days: 7, restDays: [0] });
  const plan = cleanAiPlan({ days: [
    { date: "2026-11-12", blocks: [{ paperId: "8", minutes: 100, chapter: "Cost sheet", task: "Solve 5 sums" }, { paperId: "99", minutes: 60, chapter: "x", task: "x" }, { paperId: "5", minutes: 90, chapter: "Contracts", task: "Read" }] },
    { date: "2026-11-15", blocks: [{ paperId: "5", minutes: 60, chapter: "x", task: "x" }] },
  ] }, { papers, today: "2026-11-12", setup, fallback });
  assert.equal(plan.length, 7);
  assert.deepEqual(plan[0].blocks.map((b) => [b.subjectId, b.minutes]), [["8", 100], ["5", 20]]);
  assert.equal(plan[3].day, "2026-11-15");
  assert.equal(plan[3].blocks.length, 0, "Sunday is a rest day");
  assert.ok(plan[1].blocks.length > 0, "missing days come from the fallback plan");
});
