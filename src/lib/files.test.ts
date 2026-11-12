// Run with: npm test  (Node 23.6+ runs TypeScript directly)
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkFile, titleFromFileName, formatSize, MAX_BYTES } from "./files.ts";

test("accepts PDFs and videos, by type or by extension", () => {
  assert.deepEqual(checkFile({ name: "a.pdf", type: "application/pdf", size: 10 }), { kind: "pdf" });
  assert.deepEqual(checkFile({ name: "Notes.PDF", type: "", size: 10 }), { kind: "pdf" });
  assert.deepEqual(checkFile({ name: "class.mp4", type: "video/mp4", size: 10 }), { kind: "video" });
  assert.deepEqual(checkFile({ name: "class.mov", type: "", size: 10 }), { kind: "video" });
});

test("rejects other types, empty and oversized files", () => {
  assert.ok("error" in checkFile({ name: "a.docx", type: "application/msword", size: 10 }));
  assert.ok("error" in checkFile({ name: "a.pdf", type: "application/pdf", size: 0 }));
  assert.ok("error" in checkFile({ name: "a.pdf", type: "application/pdf", size: MAX_BYTES.pdf + 1 }));
  assert.deepEqual(checkFile({ name: "a.pdf", type: "application/pdf", size: MAX_BYTES.pdf }), { kind: "pdf" });
  assert.ok("error" in checkFile({ name: "a.mp4", type: "video/mp4", size: MAX_BYTES.video + 1 }));
});

test("title and size helpers", () => {
  assert.equal(titleFromFileName("chapter_1-intro.pdf"), "chapter 1 intro");
  assert.equal(formatSize(5 * 1024 * 1024), "5.0 MB");
  assert.equal(formatSize(3 * 1024 * 1024 * 1024), "3.0 GB");
});

test("upload details are trimmed and capped like the database rules", async () => {
  const { cleanDetails } = await import("./files.ts");
  const d = cleanDetails({ chapter: "  Cost sheet  ", faculty: "x".repeat(200), duration: 45, category: undefined });
  assert.equal(d.chapter, "Cost sheet");
  assert.equal(d.faculty.length, 80);
  assert.equal(d.duration, "");
  assert.equal(d.category, "");
});
