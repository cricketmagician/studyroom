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

test("keeps a usable mind map and drops a broken one", () => {
  const base = { summary: "ok", quiz: [good] };
  const map = validatePack({
    ...base,
    mindMap: { center: "Sums", branches: [{ title: "Rules", points: ["Order doesn't matter", ""] }, { title: "Uses", points: ["Shopping"] }, { title: "Empty", points: [] }] },
  }).mindMap;
  assert.deepEqual(map, { center: "Sums", branches: [{ title: "Rules", points: ["Order doesn't matter"] }, { title: "Uses", points: ["Shopping"] }] });
  assert.equal(validatePack({ ...base, mindMap: { center: "Sums", branches: [{ title: "Only one", points: ["x"] }] } }).mindMap, undefined);
  assert.equal(validatePack(base).mindMap, undefined);
});

test("keeps usable formulas and drops broken ones", () => {
  const base = { summary: "ok", quiz: [good] };
  const pack = validatePack({
    ...base,
    formulas: [
      { title: "Current Ratio", formula: "Current Assets / Current Liabilities", explanation: "Liquidity metric", page: 2 },
      { title: "", formula: "Broken", explanation: "No title" },
      { title: "No Formula", formula: "", explanation: "No formula" },
    ],
  });
  assert.deepEqual(pack.formulas, [
    { title: "Current Ratio", formula: "Current Assets / Current Liabilities", explanation: "Liquidity metric", page: 2 },
  ]);
});
