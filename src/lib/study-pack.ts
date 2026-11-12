// The AI study pack for one PDF: shape, JSON schema for the AI model, and validation of what comes back.

export type QuizQuestion = { question: string; options: string[]; answer: number; explanation: string; page: number };
export type Flashcard = { front: string; back: string };
export type FormulaItem = { title: string; formula: string; explanation: string; page?: number };
/** A topic in the centre with branches of short ideas around it. */
export type MindMap = { center: string; branches: { title: string; points: string[] }[] };
export type StudyPack = {
  summary: string;
  keyPoints: string[];
  terms: { term: string; meaning: string }[];
  examQuestions: string[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  /** Key formulas, equations or calculation principles from the chapter */
  formulas?: FormulaItem[];
  /** Missing on packs made before mind maps existed. */
  mindMap?: MindMap;
};

/** Stored at materials/{id}/ai/pack. Students only see it once the teacher publishes it. */
export type PackDoc =
  | { status: "generating"; updatedAt?: { toMillis(): number } }
  | { status: "error"; error: string }
  | ({ status: "ready"; published: boolean } & StudyPack);

const str = { type: "string" };
const strList = { type: "array", items: str };

export const PACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "keyPoints", "terms", "examQuestions", "quiz", "flashcards", "mindMap"],
  properties: {
    summary: str,
    keyPoints: strList,
    terms: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["term", "meaning"], properties: { term: str, meaning: str } },
    },
    examQuestions: strList,
    quiz: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "options", "answer", "explanation", "page"],
        properties: { question: str, options: strList, answer: { type: "integer" }, explanation: str, page: { type: "integer" } },
      },
    },
    flashcards: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["front", "back"], properties: { front: str, back: str } },
    },
    formulas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "formula", "explanation"],
        properties: { title: str, formula: str, explanation: str, page: { type: "integer" } },
      },
    },
    mindMap: {
      type: "object",
      additionalProperties: false,
      required: ["center", "branches"],
      properties: {
        center: str,
        branches: {
          type: "array",
          items: { type: "object", additionalProperties: false, required: ["title", "points"], properties: { title: str, points: strList } },
        },
      },
    },
  },
};

const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

/** Keeps only well-formed items, so one bad quiz question can't break the page. Throws if nothing useful is left. */
export function validatePack(raw: unknown): StudyPack {
  const r = (raw ?? {}) as Record<string, unknown>;
  const list = (v: unknown) => (Array.isArray(v) ? v : []);
  const pack: StudyPack = {
    summary: isStr(r.summary) ? r.summary.trim() : "",
    keyPoints: list(r.keyPoints).filter(isStr),
    terms: list(r.terms).filter((t) => isStr(t?.term) && isStr(t?.meaning)),
    examQuestions: list(r.examQuestions).filter(isStr),
    quiz: list(r.quiz).filter(
      (q) =>
        isStr(q?.question) &&
        Array.isArray(q.options) && q.options.length >= 2 && q.options.length <= 6 && q.options.every(isStr) &&
        Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length &&
        isStr(q.explanation) && Number.isInteger(q.page) && q.page >= 1
    ),
    flashcards: list(r.flashcards).filter((c) => isStr(c?.front) && isStr(c?.back)),
    formulas: list(r.formulas)
      .filter((f) => isStr(f?.title) && isStr(f?.formula) && isStr(f?.explanation))
      .map((f) => ({
        title: f.title.trim(),
        formula: f.formula.trim(),
        explanation: f.explanation.trim(),
        ...(Number.isInteger(f.page) && f.page > 0 ? { page: f.page } : {}),
      })),
  };
  const map = r.mindMap as { center?: unknown; branches?: unknown } | undefined;
  const branches = list(map?.branches)
    .filter((b) => isStr(b?.title))
    .map((b) => ({ title: b.title.trim(), points: list(b.points).filter(isStr) }))
    .filter((b) => b.points.length > 0);
  if (isStr(map?.center) && branches.length >= 2) pack.mindMap = { center: map.center.trim(), branches };
  if (!pack.summary || pack.quiz.length === 0) throw new Error("The AI study pack came back incomplete.");
  return pack;
}
