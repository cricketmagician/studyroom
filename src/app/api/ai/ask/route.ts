import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, DAILY_QUESTIONS, errorResponse, FALLBACK, HttpError, loadMaterial, loadPdfBase64, MODEL, requireUser, takeQuota } from "@/lib/server/ai";
import { AnswerPart, checkTurns } from "@/lib/chat";

export const maxDuration = 120;

// Kept identical across requests so the system prompt + PDF prefix is cached and shared by every student asking about this file.
const SYSTEM = `You are a friendly study helper for college students. You answer questions about one class file their teacher shared.
- Answer only from the file. If the file doesn't cover the question, say so plainly and suggest asking the teacher. Never make things up.
- Reply in the student's language and style: English, Hindi, or Hinglish.
- Keep it short and simple: a direct answer first, then a small example or steps if it helps. Use plain text and short lists, no tables.
- If the student asks you to do graded work for them, help them understand instead of giving a ready answer.`;

/** Doubt chat over one PDF, with page citations. Any signed-in user; limited per day. */
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const turns = checkTurns(body?.turns);
    if (!turns) throw new HttpError(400, "Please type a shorter question and try again.");
    const material = await loadMaterial(body?.materialId);
    const client = anthropic();
    const pdf = await loadPdfBase64(material);
    await takeQuota(user.uid, "questions", DAILY_QUESTIONS);

    const [first, ...rest] = turns;
    const messages: Anthropic.Beta.BetaMessageParam[] = [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdf },
            title: material.title,
            citations: { enabled: true },
            cache_control: { type: "ephemeral" },
          },
          { type: "text", text: first.content },
        ],
      },
      ...rest,
    ];

    const message = await client.beta.messages
      .stream({ model: MODEL, max_tokens: 8000, ...FALLBACK, output_config: { effort: "low" }, system: SYSTEM, messages })
      .finalMessage();

    if (message.stop_reason === "refusal") throw new HttpError(422, "AI can't help with that question. Try asking about the file.");

    const parts: AnswerPart[] = [];
    for (const block of message.content) {
      if (block.type !== "text" || !block.text) continue;
      const pages = (block.citations ?? []).flatMap((c) => (c.type === "page_location" ? [c.start_page_number] : []));
      parts.push({ text: block.text, pages: [...new Set(pages)].sort((x, y) => x - y) });
    }
    if (!parts.length) throw new HttpError(502, "AI couldn't answer right now. Please try again.");
    return Response.json({ parts });
  } catch (err) {
    return errorResponse(err);
  }
}
