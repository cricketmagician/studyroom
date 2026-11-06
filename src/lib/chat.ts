// Shared between the doubt-chat UI and its API route.

export type ChatTurn = { role: "user" | "assistant"; content: string };
/** One piece of an AI answer, with the PDF pages it came from. */
export type AnswerPart = { text: string; pages: number[] };

export const MAX_TURNS = 20;
export const MAX_QUESTION = 2000;

/** Validates chat history from the browser: alternating turns, starting and ending with the student. */
export function checkTurns(raw: unknown): ChatTurn[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_TURNS || raw.length % 2 === 0) return null;
  const turns: ChatTurn[] = [];
  for (const [i, t] of raw.entries()) {
    const role = i % 2 === 0 ? "user" : "assistant";
    if (t?.role !== role || typeof t.content !== "string") return null;
    const content = t.content.trim();
    if (!content || (role === "user" && content.length > MAX_QUESTION)) return null;
    turns.push({ role, content: content.slice(0, 8000) });
  }
  return turns;
}
