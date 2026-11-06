import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { useAuth } from "@/lib/auth";
import { Material, toMaterial } from "@/lib/materials";

/** All class files, newest first, kept live. */
export function useMaterials() {
  const [items, setItems] = useState<Material[] | null>(null);
  const [error, setError] = useState("");
  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "materials"), orderBy("createdAt", "desc")),
        (snap) => setItems(snap.docs.map(toMaterial)),
        (err) => setError(friendlyError(err))
      ),
    []
  );
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
