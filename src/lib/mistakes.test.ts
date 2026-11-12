import { test } from "node:test";
import assert from "node:assert/strict";
import { afterReview, firstReview, isDue, leaks } from "./mistakes.ts";

test("spaced review: got it stretches the gap, tricky starts again, five in a row is fixed", () => {
  const today = "2026-11-12";
  assert.deepEqual(firstReview(today), { box: 0, due: "2026-11-13", mastered: false });
  assert.deepEqual(afterReview(0, true, today), { box: 1, due: "2026-11-15", mastered: false });
  assert.deepEqual(afterReview(3, true, today), { box: 4, due: "2026-12-12", mastered: false });
  assert.deepEqual(afterReview(4, true, today), { box: 5, due: today, mastered: true });
  assert.deepEqual(afterReview(3, false, today), { box: 0, due: "2026-11-13", mastered: false });
  assert.equal(isDue({ mastered: false, due: "2026-11-12" }, today), true);
  assert.equal(isDue({ mastered: true, due: "2026-11-01" }, today), false);
  assert.equal(isDue({ mastered: false, due: "2026-11-13" }, today), false);
});

test("leaks rank by marks lost", () => {
  const r = leaks([
    { kind: "calc", paper: "8", marks: 4 }, { kind: "calc", paper: "8", marks: 2 },
    { kind: "read", paper: "5", marks: 5 }, { kind: "silly", paper: "8", marks: 1 },
  ]);
  assert.equal(r.total, 12);
  assert.deepEqual(r.kinds[0], { id: "calc", count: 2, marks: 6 });
  assert.deepEqual(r.papers.map((p) => p.id), ["8", "5"]);
});
