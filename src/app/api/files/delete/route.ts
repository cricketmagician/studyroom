import { del } from "@vercel/blob";
import { adminDb } from "@/lib/server/firebase-admin";
import { errorResponse, HttpError, loadMaterial, requireUser } from "@/lib/server/ai";

/** Deletes one of the teacher's files: the stored file, its AI study pack, and its listing. */
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { materialId } = await request.json();
    const material = await loadMaterial(materialId);
    if (user.role !== "teacher" || material.teacherId !== user.uid) throw new HttpError(403, "You can only delete your own files.");

    await del(material.storagePath);
    await adminDb.doc(`materials/${materialId}/ai/pack`).delete();
    await adminDb.doc(`materials/${materialId}`).delete();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
