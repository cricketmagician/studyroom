import { test } from "node:test";
import assert from "node:assert/strict";
import { haptic, PATTERNS } from "./haptics";

test("haptic is safe on the server and success is longer than a tap", () => {
  assert.doesNotThrow(() => haptic("success"));
  const total = (p: number | number[]) => [p].flat().reduce((a, b) => a + b, 0);
  assert.ok(total(PATTERNS.success) > total(PATTERNS.tap));
});
