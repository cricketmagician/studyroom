// Server-only helpers shared by the /api/ai routes.
import { ApiError, GoogleGenAI } from "@google/genai";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb, bucket } from "@/lib/server/firebase-admin";

// Fast, low-cost model: each PDF is read once per study pack, so cost scales with files, not students.
export const MODEL = "gemini-3.8-flash";

export const DAILY_QUESTIONS = 30; // per teacher, keeps the AI bill predictable
// shortcut: PDFs are sent inline (Gemini caps inline requests at 20 MB incl. ~33% base64 overhead); use the Gemini Files API for bigger files.
const MAX_PDF_BYTES = 14 * 1024 * 1024;

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function gemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new HttpError(503, "AI is not set up yet. Ask the admin to add the Gemini API key.");
  // Retry brief overloads (503 "high demand") and rate limits a few times before giving up.
  return new GoogleGenAI({ apiKey, httpOptions: { retryOptions: { attempts: 4, initialDelay: 2, maxDelay: 20, httpStatusCodes: [429, 500, 503] } } });
}

/** The model's text, or a friendly error when it was blocked or cut off. */
export function replyText(response: { text?: string; candidates?: { finishReason?: string }[]; promptFeedback?: { blockReason?: string } }) {
  const finish = response.candidates?.[0]?.finishReason;
  if (response.promptFeedback?.blockReason || (finish && finish !== "STOP" && finish !== "MAX_TOKENS")) {
    throw new HttpError(422, "AI couldn't work with this file or question.");
  }
  if (finish === "MAX_TOKENS") throw new HttpError(422, "This file is too long for AI to finish. Try a shorter PDF.");
  if (!response.text) throw new HttpError(502, "AI couldn't answer right now. Please try again.");
  return response.text;
}

/** The signed-in user behind a request, from the Firebase ID token in the Authorization header. */
export async function requireUser(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new HttpError(401, "Please log in again.");
  try {
    const { uid } = await adminAuth.verifyIdToken(token);
    const profile = (await adminDb.doc(`profiles/${uid}`).get()).data();
    if (!profile) throw new HttpError(403, "Your account is not set up yet.");
    return { uid, role: profile.role as "student" | "teacher", name: String(profile.name ?? "") };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(401, "Please log in again.");
  }
}

/** Counts one use of `kind` for today and refuses once the daily limit is reached. */
export async function takeQuota(uid: string, kind: string, limit: number) {
  const ref = adminDb.doc(`profiles/${uid}/usage/${new Date().toISOString().slice(0, 10)}`);
  await adminDb.runTransaction(async (tx) => {
    const used = Number((await tx.get(ref)).get(kind) ?? 0);
    if (used >= limit) throw new HttpError(429, `You've used all ${limit} AI questions for today. Try again tomorrow.`);
    tx.set(ref, { [kind]: FieldValue.increment(1) }, { merge: true });
  });
}

export type MaterialDoc = { title: string; type: "pdf" | "video"; storagePath: string; teacherId: string; size: number };

export async function loadMaterial(materialId: string) {
  if (typeof materialId !== "string" || !/^[A-Za-z0-9]{1,64}$/.test(materialId)) throw new HttpError(400, "Unknown file.");
  const snap = await adminDb.doc(`materials/${materialId}`).get();
  if (!snap.exists) throw new HttpError(404, "This file was removed.");
  return snap.data() as MaterialDoc;
}

/** The PDF as base64, read from Storage by its path (never from a URL stored in the database). */
export async function loadPdfBase64(m: MaterialDoc) {
  if (m.type !== "pdf") throw new HttpError(400, "AI help works on PDF files for now.");
  if (m.size > MAX_PDF_BYTES) throw new HttpError(413, "This PDF is too big for AI help (limit 14 MB).");
  const [bytes] = await bucket().file(m.storagePath).download();
  return bytes.toString("base64");
}

/** JSON error response; unexpected errors are logged and hidden from the user. */
export function errorResponse(err: unknown) {
  if (err instanceof HttpError) return Response.json({ error: err.message }, { status: err.status });
  if (err instanceof ApiError) {
    console.error("Gemini API error", err.status, err.message);
    if (err.status === 429 || err.status === 503) return Response.json({ error: "AI is busy right now (or today's free limit is used up). Please try again in a few minutes." }, { status: 503 });
    return Response.json({ error: "AI couldn't answer right now. Please try again." }, { status: 502 });
  }
  console.error(err);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
