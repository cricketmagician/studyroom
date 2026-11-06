import { test } from "node:test";
import assert from "node:assert/strict";
import { dayKey, recordVisit, weekKeys } from "./streak.ts";

const day = (s: string) => new Date(`${s}T10:00:00`);

test("streak starts, repeats same day, extends, and resets after a gap", () => {
  const a = recordVisit(null, day("2026-11-02"));
  assert.equal(a.count, 1);
  assert.equal(recordVisit(a, day("2026-11-02")), a);
  const b = recordVisit(a, day("2026-11-03"));
  assert.equal(b.count, 2);
  assert.equal(recordVisit(b, day("2026-11-05")).count, 1);
});

test("streak extends across a month boundary and keeps only 7 days", () => {
  let s = recordVisit(null, day("2026-10-25"));
  for (let d = 26; d <= 31; d++) s = recordVisit(s, day(`2026-10-${d}`));
  s = recordVisit(s, day("2026-11-01"));
  assert.equal(s.count, 8);
  assert.equal(s.days.length, 7);
});

test("week starts on Monday", () => {
  const w = weekKeys(day("2026-11-06")); // a Friday
  assert.equal(w[0], "2026-11-02");
  assert.equal(w[6], "2026-11-08");
  assert.equal(dayKey(day("2026-01-05")), "2026-01-05");
});
