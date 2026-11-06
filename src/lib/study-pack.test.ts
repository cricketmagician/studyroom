import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePack } from "./study-pack.ts";

const good = { question: "2+2?", options: ["3", "4", "5", "6"], answer: 1, explanation: "Basic sum.", page: 1 };

test("keeps good items and drops broken quiz questions", () => {
  const pack = validatePack({
    summary: "About sums.",
    keyPoints: ["Add numbers", ""],
    terms: [{ term: "Sum", meaning: "Total" }, { term: "", meaning: "x" }],
    examQuestions: ["What is a sum?"],
    quiz: [
      good,
      { ...good, answer: 4 }, // answer index out of range
      { ...good, options: ["only one"] }, // too few options
      { ...good, page: 0 }, // no such page
    ],
    flashcards: [{ front: "Sum", back: "Total" }, { front: "x" }],
  });
  assert.deepEqual(pack.quiz, [good]);
  assert.deepEqual(pack.keyPoints, ["Add numbers"]);
  assert.equal(pack.terms.length, 1);
  assert.equal(pack.flashcards.length, 1);
});

test("rejects a pack with no summary or no usable quiz", () => {
  assert.throws(() => validatePack({ summary: "", quiz: [good] }));
  assert.throws(() => validatePack({ summary: "ok", quiz: [{ ...good, answer: -1 }] }));
  assert.throws(() => validatePack(null));
});
