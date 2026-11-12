import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, DocumentData, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { useAuth } from "@/lib/auth";
import { Material, toMaterial } from "@/lib/materials";
import { Task } from "@/lib/tasks";
import { Mistake } from "@/lib/mistakes";

/** Shared materials, stored in Firestore and visible across student devices. */
export function useMaterials() {
  const { user } = useAuth();
  const [items, setItems] = useState<Material[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) { setItems(null); return; }
    return onSnapshot(query(collection(db, "materials"), orderBy("createdAt", "desc")),
      snap => { setItems(snap.docs.map(toMaterial)); setError(""); },
      err => setError(friendlyError(err)));
  }, [user]);
  return { items, error };
}

/** A student's own state for one file. Stored at profiles/{uid}/library/{materialId}. */
export type Entry = { saved?: boolean; done?: boolean; note?: string };

export const MAX_NOTE = 5000; // keep in sync with firestore.rules

/** The signed-in user's saved/done/notes for every file, keyed by material id. */
export function useMyLibrary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(db, "profiles", user.uid, "library"), (snap) =>
      setEntries(Object.fromEntries(snap.docs.map((d) => [d.id, d.data() as Entry])))
    );
  }, [user]);
  return entries;
}

export function updateEntry(uid: string, materialId: string, patch: Entry) {
  return setDoc(doc(db, "profiles", uid, "library", materialId), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

/** Live list of a sub-collection under the signed-in user's profile (notes, tasks). */
function useMine<T>(name: string, toItem: (id: string, data: DocumentData) => T) {
  const { user } = useAuth();
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      collection(db, "profiles", user.uid, name),
      (snap) => setItems(snap.docs.map((d) => toItem(d.id, d.data()))),
      (err) => setError(friendlyError(err))
    );
    // toItem is a module-level function at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, name]);
  return { items, error };
}

export type Note = { id: string; title: string; body: string; pinned: boolean; updatedAt: Timestamp | null };
export const MAX_NOTE_BODY = 20000; // keep in sync with firestore.rules

const toNote = (id: string, d: DocumentData): Note => ({ id, title: d.title ?? "", body: d.body ?? "", pinned: Boolean(d.pinned), updatedAt: d.updatedAt ?? null });
export const useNotes = () => useMine("notes", toNote);

export async function createNote(uid: string) {
  const ref = await addDoc(collection(db, "profiles", uid, "notes"), {
    title: "",
    body: "",
    pinned: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export function saveNote(uid: string, id: string, patch: Partial<Pick<Note, "title" | "body" | "pinned">>) {
  return updateDoc(doc(db, "profiles", uid, "notes", id), { ...patch, updatedAt: serverTimestamp() });
}

export function deleteNote(uid: string, id: string) {
  return deleteDoc(doc(db, "profiles", uid, "notes", id));
}

const toTask = (id: string, d: DocumentData): Task => ({ id, title: d.title ?? "", done: Boolean(d.done), due: d.due ?? null, createdAt: d.createdAt ?? null });
export const useTasks = () => useMine("tasks", toTask);

export function addTask(uid: string, title: string, due: string | null) {
  return addDoc(collection(db, "profiles", uid, "tasks"), { title, done: false, due, createdAt: serverTimestamp() });
}

export function updateTask(uid: string, id: string, patch: Partial<Pick<Task, "title" | "done" | "due">>) {
  return updateDoc(doc(db, "profiles", uid, "tasks", id), patch);
}

export function deleteTask(uid: string, id: string) {
  return deleteDoc(doc(db, "profiles", uid, "tasks", id));
}

const toMistake = (id: string, d: DocumentData): Mistake => ({
  id, paper: d.paper ?? "", chapter: d.chapter ?? "", mock: d.mock ?? "", kind: d.kind ?? "concept", question: d.question ?? "", wrong: d.wrong ?? "",
  fix: d.fix ?? "", marks: d.marks ?? 0, box: d.box ?? 0, due: d.due ?? "", mastered: Boolean(d.mastered), createdAt: d.createdAt ?? null,
});
export const useMistakes = () => useMine("mistakes", toMistake);
type MistakeFields = Omit<Mistake, "id" | "createdAt">;

export function addMistake(uid: string, m: MistakeFields) {
  return addDoc(collection(db, "profiles", uid, "mistakes"), { ...m, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export function updateMistake(uid: string, id: string, patch: Partial<MistakeFields>) {
  return updateDoc(doc(db, "profiles", uid, "mistakes", id), { ...patch, updatedAt: serverTimestamp() });
}

export function deleteMistake(uid: string, id: string) {
  return deleteDoc(doc(db, "profiles", uid, "mistakes", id));
}
