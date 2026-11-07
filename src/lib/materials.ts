import {
  addDoc,
  collection,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { upload } from "@vercel/blob/client";
import { auth, db } from "@/lib/firebase/config";
import { postAi } from "@/lib/ai-client";
import { Kind } from "@/lib/files";

export type Material = {
  id: string;
  title: string;
  type: Kind;
  url: string;
  storagePath: string;
  size: number;
  teacherId: string;
  teacherName: string;
  createdAt: Timestamp | null;
};

export function toMaterial(snap: QueryDocumentSnapshot | DocumentSnapshot): Material {
  return { id: snap.id, ...(snap.data() as Omit<Material, "id">) };
}

export function newestFirst(a: Material, b: Material) {
  return (b.createdAt?.toMillis() ?? Date.now()) - (a.createdAt?.toMillis() ?? Date.now());
}

export async function uploadMaterial(
  file: File,
  kind: Kind,
  title: string,
  teacher: { uid: string; name: string },
  onProgress: (percent: number) => void
) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Please log in again.");
  // Uploads go straight from the browser to Vercel Blob; our /api/files/upload route only checks the teacher and hands out a token.
  const blob = await upload(`materials/${teacher.uid}/${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`, file, {
    access: "public",
    handleUploadUrl: "/api/files/upload",
    headers: { Authorization: `Bearer ${token}` },
    contentType: kind === "pdf" ? "application/pdf" : file.type || "video/mp4",
    multipart: file.size > 20 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => onProgress(Math.round(percentage)),
  });

  // shortcut: public Blob URLs (random suffix) work for anyone who has the link; switch to a private store if files must stay private.
  // shortcut: if saving the listing fails the file stays in Blob storage unlisted; add a cleanup job if that ever matters.
  const ref = await addDoc(collection(db, "materials"), {
    title,
    type: kind,
    url: blob.url,
    storagePath: blob.pathname,
    size: file.size,
    teacherId: teacher.uid,
    teacherName: teacher.name,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Removes the file, its AI pack and its listing (done on the server, which holds the storage key). */
export async function deleteMaterial(m: Material) {
  await postAi("/api/files/delete", { materialId: m.id });
}
