import { test } from "node:test";
import assert from "node:assert/strict";
import { groupOf, groupTasks, type Task } from "./tasks.ts";

const t = (id: string, due: string | null, done = false, created = 0): Task => ({ id, title: id, done, due, createdAt: { toMillis: () => created } });
const TODAY = "2026-11-06";

test("tasks land in the right group", () => {
  assert.equal(groupOf(t("a", "2026-11-05"), TODAY), "overdue");
  assert.equal(groupOf(t("b", TODAY), TODAY), "today");
  assert.equal(groupOf(t("c", "2026-12-01"), TODAY), "upcoming");
  assert.equal(groupOf(t("d", null), TODAY), "someday");
  assert.equal(groupOf(t("e", "2026-11-01", true), TODAY), "done");
});

test("dated groups sort soonest first, others newest first", () => {
  const g = groupTasks([t("late", "2026-11-04"), t("later", "2026-11-01"), t("soon2", "2026-11-09"), t("soon1", "2026-11-07"), t("old", null, false, 1), t("new", null, false, 2)], TODAY);
  assert.deepEqual(g.overdue.map((x) => x.id), ["later", "late"]);
  assert.deepEqual(g.upcoming.map((x) => x.id), ["soon1", "soon2"]);
  assert.deepEqual(g.someday.map((x) => x.id), ["new", "old"]);
});
