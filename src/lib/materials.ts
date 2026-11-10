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
  storagePath?: string;
  size: number;
  subject?: string;
  paperCode?: string;
  duration?: string;
  faculty?: string;
  teacherId: string;
  teacherName: string;
  createdAt?: any;
};

const LOCAL_STORAGE_KEY = "cma_published_materials";

export function getLocalMaterials(): Material[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalMaterial(m: Material): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalMaterials();
    const updated = [m, ...current.filter((item) => item.id !== m.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("cma_materials_updated"));
  } catch {}
}

export function removeLocalMaterial(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalMaterials();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("cma_materials_updated"));
  } catch {}
}

export function toMaterial(snap: QueryDocumentSnapshot | DocumentSnapshot): Material {
  return { id: snap.id, ...(snap.data() as Omit<Material, "id">) };
}

export function newestFirst(a: Material, b: Material) {
  const timeA = typeof a.createdAt?.toMillis === "function" ? a.createdAt.toMillis() : (a.createdAt || 0);
  const timeB = typeof b.createdAt?.toMillis === "function" ? b.createdAt.toMillis() : (b.createdAt || 0);
  return (timeB || 0) - (timeA || 0);
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
  removeLocalMaterial(m.id);
  try {
    await postAi("/api/files/delete", { materialId: m.id });
  } catch {}
}
