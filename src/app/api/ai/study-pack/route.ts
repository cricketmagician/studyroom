import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebase-admin";
import { ThinkingLevel } from "@google/genai";
import { errorResponse, gemini, HttpError, loadMaterial, loadPdfBase64, MODEL, replyText, requireUser } from "@/lib/server/ai";
import { PACK_SCHEMA, validatePack } from "@/lib/study-pack";

export const maxDuration = 300; // reading a long PDF can take a minute or two

// One call reads the PDF once and returns everything, so each file costs tokens a single time; students only read the saved result.
const SYSTEM = `You make study material for college students from one class file their teacher uploaded.
Use only what is in the file. Write in the same language as the file. Keep every item short: students revise from this, so no filler.
- summary: 4-6 sentences a student can read in two minutes.
- keyPoints: the 6-10 most important points.
- terms: important terms with a one-line meaning.
- examQuestions: 5 questions likely to come in an exam.
- quiz: 10 multiple-choice questions with exactly 4 options each; "answer" is the index (0-3) of the correct option; "explanation" says why in one or two sentences; "page" is the PDF page number where the answer is found.
- flashcards: 10-15 cards, a short prompt on the front and the answer on the back.
- formulas: 5-10 key mathematical, accounting, costing, taxation, or financial management formulas/equations found in this PDF with their "title", "formula" (clear text or clean LaTeX), "explanation" (meaning of symbols and how to use it), and "page" (PDF page where found). If the PDF is purely theoretical law without equations, include key statutory rules/time-limits/penalties as formulas.
- mindMap: the file's main topic in "center" (2-5 words) and 4-6 branches; each branch has a short title and 2-4 points of a few words each, so a student can recall the whole chapter from it.`;

/** Teacher-only: makes (or remakes) the AI study pack for one of their PDFs. Students see it after the teacher publishes. */
export async function POST(request: Request) {
  let packRef: FirebaseFirestore.DocumentReference | null = null;
  let previous: FirebaseFirestore.DocumentData | undefined;
  let started = false;
  try {
    const user = await requireUser(request);
    const { materialId, regenerate } = await request.json();
    const material = await loadMaterial(materialId);
    if (user.role !== "teacher" || material.teacherId !== user.uid) throw new HttpError(403, "Only the teacher who uploaded this file can make its study pack.");

    packRef = adminDb.doc(`materials/${materialId}/ai/pack`);
    const existing = (await packRef.get()).data();
    const stuck = existing?.status === "generating" && Date.now() - (existing.updatedAt?.toMillis() ?? 0) > 10 * 60 * 1000;
    if (existing?.status === "generating" && !stuck) return Response.json({ status: "generating" });
    if (existing?.status === "ready" && !regenerate) return Response.json({ status: "ready" });

    const ai = gemini();
    const pdf = await loadPdfBase64(material);
    previous = existing;
    started = true;
    await packRef.set({ status: "generating", updatedAt: FieldValue.serverTimestamp() });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [{ inlineData: { mimeType: "application/pdf", data: pdf } }, { text: `Make the study pack for this file: "${material.title}".` }],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseJsonSchema: PACK_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        maxOutputTokens: 16000,
      },
    });
    const pack = validatePack(JSON.parse(replyText(response)));

    await packRef.set({ status: "ready", published: false, ...pack, model: MODEL, updatedAt: FieldValue.serverTimestamp() });
    return Response.json({ status: "ready" });
  } catch (err) {
    const response = errorResponse(err);
    // Once generation started: put back the old pack if remaking it failed, else leave a visible error (never a stuck "generating").
    if (packRef && started) {
      const { error } = await response.clone().json();
      const restore = previous?.status === "ready" ? previous : { status: "error", error, updatedAt: FieldValue.serverTimestamp() };
      await packRef.set(restore).catch(() => {});
    }
    return response;
  }
}
