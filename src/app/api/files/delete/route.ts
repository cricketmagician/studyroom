import { del } from "@vercel/blob";
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { adminDb } from "@/lib/server/firebase-admin";
import { errorResponse, HttpError, loadMaterial, requireUser } from "@/lib/server/ai";

/** Deletes one of the teacher's files: the stored file, its AI study pack, and its listing. */
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { materialId } = await request.json();
    const material = await loadMaterial(materialId);
    if (user.role !== "teacher" || material.teacherId !== user.uid) throw new HttpError(403, "You can only delete your own files.");

    if (material.storagePath) await del(material.storagePath);
    if (material.local && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
      await unlink(join(process.cwd(), '.local-uploads', materialId)).catch((err: NodeJS.ErrnoException) => {
        if (err.code !== 'ENOENT') throw err;
      });
    }
    await adminDb.doc(`materials/${materialId}/ai/pack`).delete();
    await adminDb.doc(`materials/${materialId}`).delete();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
