import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
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
  const storagePath = `materials/${teacher.uid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const task = uploadBytesResumable(ref(storage, storagePath), file, {
    contentType: kind === "pdf" ? "application/pdf" : file.type || "video/mp4",
  });
  task.on("state_changed", (s) => onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)));
  await task;

  // shortcut: download URLs work for anyone who has the link; switch to signed URLs if files must stay private.
  const url = await getDownloadURL(task.snapshot.ref);
  try {
    await addDoc(collection(db, "materials"), {
      title,
      type: kind,
      url,
      storagePath,
      size: file.size,
      teacherId: teacher.uid,
      teacherName: teacher.name,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Don't leave an orphan file nobody can see or delete.
    await deleteObject(task.snapshot.ref).catch(() => {});
    throw err;
  }
}

export async function deleteMaterial(m: Material) {
  await deleteObject(ref(storage, m.storagePath)).catch((err) => {
    if (err?.code !== "storage/object-not-found") throw err;
  });
  await deleteDoc(doc(db, "materials", m.id));
}
