import { ThinkingLevel, type Content } from "@google/genai";
import { DAILY_QUESTIONS, errorResponse, gemini, HttpError, loadMaterial, loadPdfBase64, MODEL, replyText, requireUser, takeQuota } from "@/lib/server/ai";
import { AnswerPart, checkTurns } from "@/lib/chat";

export const maxDuration = 120;

// Kept identical across requests, with the PDF first, so Gemini's automatic prompt caching can reuse it across questions.
const SYSTEM = `You are a helpful teaching assistant. A teacher asks you about one class file they shared with their students.
- Answer only from the file. If the file doesn't cover the question, say so plainly. Never make things up.
- Reply in the teacher's language and style: English, Hindi, or Hinglish.
- Keep it short and simple: a direct answer first, then a small example or steps if it helps. Use plain text and short lists, no tables.
- Help the teacher prepare: explain parts of the file, suggest extra questions, examples or simpler ways to teach a topic.
- In "pages", list the PDF page numbers your answer comes from (empty if none).`;

const ANSWER_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["answer", "pages"],
  properties: { answer: { type: "string" }, pages: { type: "array", items: { type: "integer" } } },
};

/** Chat over one PDF, with page links. Teachers only (students get the published study pack instead); limited per day. */
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (user.role !== "teacher") throw new HttpError(403, "Only teachers can chat with AI.");
    const body = await request.json();
    const turns = checkTurns(body?.turns);
    if (!turns) throw new HttpError(400, "Please type a shorter question and try again.");
    const material = await loadMaterial(body?.materialId);
    const ai = gemini();
    const pdf = await loadPdfBase64(material);
    await takeQuota(user.uid, "questions", DAILY_QUESTIONS);

    const [first, ...rest] = turns;
    const contents: Content[] = [
      { role: "user", parts: [{ inlineData: { mimeType: "application/pdf", data: pdf } }, { text: first.content }] },
      ...rest.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseJsonSchema: ANSWER_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        maxOutputTokens: 8000,
      },
    });

    const { answer, pages } = JSON.parse(replyText(response));
    if (typeof answer !== "string" || !answer.trim()) throw new HttpError(502, "AI couldn't answer right now. Please try again.");
    // Pages come from the model, not a built-in citation feature: keep only sane page numbers.
    const cleanPages = (Array.isArray(pages) ? pages : []).filter((p) => Number.isInteger(p) && p >= 1 && p <= 2000);
    const parts: AnswerPart[] = [{ text: answer.trim(), pages: [...new Set<number>(cleanPages)].sort((a, b) => a - b) }];
    return Response.json({ parts });
  } catch (err) {
    return errorResponse(err);
  }
}
