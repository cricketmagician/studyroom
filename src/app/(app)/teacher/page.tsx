"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { CloudUpload, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { RequireRole, useAuth } from "@/lib/auth";
import { checkFile, formatSize, Kind, titleFromFileName } from "@/lib/files";
import { deleteMaterial, Material, newestFirst, toMaterial, uploadMaterial } from "@/lib/materials";
import { buttonClass, ErrorText, inputClass } from "@/components/auth-card";
import { MaterialIcon } from "@/components/material-icon";

export default function TeacherPage() {
  return (
    <RequireRole role="teacher">
      <UploadForm />
      <MyUploads />
    </RequireRole>
  );
}

function UploadForm() {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<{ file: File; kind: Kind } | null>(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [dragging, setDragging] = useState(false);

  const pick = (f: File | undefined) => {
    if (!f) return;
    setDone("");
    const result = checkFile(f);
    if ("error" in result) {
      setFile(null);
      setError(result.error);
      return;
    }
    setError("");
    setFile({ file: f, kind: result.kind });
    setTitle(titleFromFileName(f.name));
  };

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !profile) return;
    setError("");
    setProgress(0);
    try {
      await uploadMaterial(file.file, file.kind, title.trim(), { uid: user.uid, name: profile.name }, setProgress);
      setDone(`"${title.trim()}" is uploaded. Students can see it now.`);
      setFile(null);
      setTitle("");
    } catch (err) {
      setError(friendlyError(err));
    }
    setProgress(null);
  };

  const uploading = progress !== null;

  return (
    <section className="bg-[var(--bg-surface)] border rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-md)]">
      <h1 className="text-2xl font-heading font-bold">Share a file with students</h1>
      <p className="mt-1 text-[var(--text-secondary)]">Choose a PDF or a video, give it a name, and press Upload.</p>

      <form onSubmit={upload} className="mt-6 space-y-5">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (!uploading) pick(e.dataTransfer.files[0]); }}
          className={`flex flex-col items-center justify-center gap-3 text-center rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors focus-within:ring-4 focus-within:ring-[var(--ring-color)] ${
            dragging ? "border-[var(--accent)] bg-[var(--accent-light)]" : "hover:border-[var(--accent)] bg-[var(--bg-surface-subtle)]"
          }`}
        >
          <input
            type="file"
            accept="application/pdf,video/*,.pdf,.mp4,.webm,.mov,.m4v"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }}
          />
          {file ? (
            <>
              <span className="text-[var(--accent)]"><MaterialIcon type={file.kind} className="w-10 h-10" /></span>
              <span className="font-semibold break-all">{file.file.name}</span>
              <span className="text-sm text-[var(--text-secondary)]">{formatSize(file.file.size)} · Click to choose a different file</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-10 h-10 text-[var(--accent)]" aria-hidden />
              <span className="font-semibold">Click here to choose a file</span>
              <span className="text-sm text-[var(--text-secondary)]">or drag it here · PDF up to 100 MB, video up to 2 GB</span>
            </>
          )}
        </label>

        {file && (
          <label className="block text-sm font-medium">
            File name students will see
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} disabled={uploading} />
          </label>
        )}

        {uploading && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading… please keep this page open</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--border-color)] overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <ErrorText>{error}</ErrorText>
        {done && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{done}</p>}

        <button type="submit" disabled={!file || !title.trim() || uploading} className={buttonClass}>
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>
    </section>
  );
}

function MyUploads() {
  const { user } = useAuth();
  const [items, setItems] = useState<Material[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    // Sorted here so Firestore doesn't need a composite index.
    return onSnapshot(
      query(collection(db, "materials"), where("teacherId", "==", user.uid)),
      (snap) => setItems(snap.docs.map(toMaterial).sort(newestFirst)),
      (err) => setError(friendlyError(err))
    );
  }, [user]);

  const remove = async (m: Material) => {
    if (!confirm(`Delete "${m.title}"? Students will no longer see it. This cannot be undone.`)) return;
    try {
      await deleteMaterial(m);
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-lg font-heading font-bold">Your uploads {items && `(${items.length})`}</h2>
      <ErrorText>{error}</ErrorText>
      {items?.length === 0 && <p className="mt-3 text-[var(--text-secondary)]">Nothing uploaded yet.</p>}
      <ul className="mt-4 space-y-3">
        {items?.map((m) => (
          <li key={m.id} className="flex items-center gap-4 bg-[var(--bg-surface)] border rounded-2xl p-4">
            <span className="shrink-0 w-11 h-11 rounded-xl bg-[var(--accent-light)] text-[var(--accent-text)] flex items-center justify-center">
              <MaterialIcon type={m.type} />
            </span>
            <Link href={`/learn/${m.id}`} className="min-w-0 flex-1 hover:underline">
              <span className="block font-medium truncate">{m.title}</span>
              <span className="block text-sm text-[var(--text-secondary)]">
                {m.createdAt?.toDate().toLocaleDateString() ?? "Just now"} · {formatSize(m.size)}
              </span>
            </Link>
            <button
              onClick={() => remove(m)}
              aria-label={`Delete ${m.title}`}
              className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
