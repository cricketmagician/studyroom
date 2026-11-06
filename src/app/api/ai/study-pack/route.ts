import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebase-admin";
import { anthropic, errorResponse, FALLBACK, HttpError, loadMaterial, loadPdfBase64, MODEL, requireUser } from "@/lib/server/ai";
import { PACK_SCHEMA, validatePack } from "@/lib/study-pack";

export const maxDuration = 300; // reading a long PDF can take a minute or two

const SYSTEM = `You make study material for college students from one class file their teacher uploaded.
Use only what is in the file. Write in the same language as the file. Keep sentences short and clear for students.
- summary: 4-6 sentences a student can read in two minutes.
- keyPoints: the 6-10 most important points.
- terms: important terms with a one-line meaning.
- examQuestions: 5 questions likely to come in an exam.
- quiz: 10 multiple-choice questions with exactly 4 options each; "answer" is the index (0-3) of the correct option; "explanation" says why in one or two sentences; "page" is the PDF page number where the answer is found.
- flashcards: 10-15 cards, a short prompt on the front and the answer on the back.`;

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

    const client = anthropic();
    const pdf = await loadPdfBase64(material);
    previous = existing;
    started = true;
    await packRef.set({ status: "generating", updatedAt: FieldValue.serverTimestamp() });

    const message = await client.beta.messages
      .stream({
        model: MODEL,
        max_tokens: 32000,
        ...FALLBACK,
        output_config: { effort: "medium", format: { type: "json_schema", schema: PACK_SCHEMA } },
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf }, title: material.title },
              { type: "text", text: "Make the study pack for this file." },
            ],
          },
        ],
      })
      .finalMessage();

    if (message.stop_reason === "refusal") throw new HttpError(422, "AI couldn't make a study pack for this file.");
    if (message.stop_reason === "max_tokens") throw new HttpError(422, "This file is too long for one study pack.");
    const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const pack = validatePack(JSON.parse(text));

    await packRef.set({ status: "ready", published: false, ...pack, model: message.model, updatedAt: FieldValue.serverTimestamp() });
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
