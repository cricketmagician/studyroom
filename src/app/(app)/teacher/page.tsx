"use client";

import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { CheckCircle2, CloudUpload, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { RequireRole, useAuth } from "@/lib/auth";
import { checkFile, formatSize, Kind, MAX_BYTES, titleFromFileName } from "@/lib/files";
import { deleteMaterial, Material, newestFirst, toMaterial, uploadMaterial } from "@/lib/materials";
import { ErrorText, inputClass } from "@/components/auth-card";
import { MaterialIcon } from "@/components/material-icon";
import { postAi } from "@/lib/ai-client";
import { PackDoc } from "@/lib/study-pack";
import { cardClass, FileRow, PageTitle, pillButton } from "@/components/ui";

export default function TeacherPage() {
  const { profile } = useAuth();
  return (
    <RequireRole role="teacher">
      <div className="space-y-6">
        <PageTitle name={profile?.name} title="Share with Students" />
        <UploadForm />
        <MyUploads />
      </div>
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
      const id = await uploadMaterial(file.file, file.kind, title.trim(), { uid: user.uid, name: profile.name }, setProgress);
      if (file.kind === "pdf") {
        // Start the AI study pack now; the teacher reviews and publishes it on the file's page.
        postAi("/api/ai/study-pack", { materialId: id }).catch(() => {});
        setDone(`"${title.trim()}" is uploaded. Students can see it now. AI is also making a study pack: open the file to check and publish it.`);
      } else {
        setDone(`"${title.trim()}" is uploaded. Students can see it now.`);
      }
      setFile(null);
      setTitle("");
    } catch (err) {
      setError(friendlyError(err));
    }
    setProgress(null);
  };

  const uploading = progress !== null;

  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
          <CloudUpload className="w-4 h-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-heading font-bold text-sm leading-tight">Upload a file</h2>
          <p className="text-xs text-[var(--text-secondary)]">Choose a PDF or video, check the name, press Upload.</p>
        </div>
      </div>

      <form onSubmit={upload} className="mt-5 space-y-4">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (!uploading) pick(e.dataTransfer.files[0]); }}
          className={`flex flex-col items-center justify-center gap-2.5 text-center rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors focus-within:ring-4 focus-within:ring-[var(--ring-color)] ${
            dragging ? "border-[var(--accent)] bg-[var(--accent-light)]" : "border-[var(--border-color)] hover:border-[var(--accent)] bg-[var(--bg-primary)]"
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
              <span className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-md)] text-[var(--accent)] flex items-center justify-center">
                <MaterialIcon type={file.kind} className="w-7 h-7" />
              </span>
              <span className="font-bold break-all">{file.file.name}</span>
              <span className="text-xs text-[var(--text-secondary)]">{formatSize(file.file.size)} · Click to choose a different file</span>
            </>
          ) : (
            <>
              <span className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] shadow-[var(--shadow-md)] text-[var(--accent)] flex items-center justify-center">
                <CloudUpload className="w-7 h-7" aria-hidden />
              </span>
              <span className="font-bold">Click here to choose a file</span>
              <span className="text-xs text-[var(--text-secondary)]">or drag it here · PDF up to {formatSize(MAX_BYTES.pdf)}, video up to {formatSize(MAX_BYTES.video)}</span>
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
          <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
            <div className="flex justify-between items-baseline text-xs mb-2">
              <span className="text-[var(--text-secondary)]">Uploading… please keep this page open</span>
              <span className="font-heading font-black text-lg">{progress}<span className="text-[var(--accent)]">%</span></span>
            </div>
            <div className="h-2 rounded-full bg-[var(--border-color)] overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <ErrorText>{error}</ErrorText>
        {done && (
          <p role="status" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden /> {done}
          </p>
        )}

        <button type="submit" disabled={!file || !title.trim() || uploading} className={`${pillButton} w-full h-12 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-[var(--shadow-md)]`}>
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
      setError((err as Error).message);
    }
  };

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Your uploads</h2>
        {items && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-text)]">
            {items.length} {items.length === 1 ? "file" : "files"}
          </span>
        )}
      </div>
      <ErrorText>{error}</ErrorText>
      {items?.length === 0 && <p className="px-1 text-sm text-[var(--text-secondary)]">Nothing uploaded yet. Your first file will appear here.</p>}
      <ul className="grid gap-3">
        {items?.map((m) => (
          <FileRow
            key={m.id}
            m={m}
            action={
              <span className="shrink-0 flex items-center gap-2">
              {m.type === "pdf" && <PackBadge materialId={m.id} />}
              <button
                onClick={() => remove(m)}
                aria-label={`Delete ${m.title}`}
                title="Delete"
                className={`${pillButton} shrink-0 w-9 h-9 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:border-red-900`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              </span>
            }
          />
        ))}
      </ul>
    </section>
  );
}

/** Where the file's AI study pack stands, so the teacher knows what still needs review. */
function PackBadge({ materialId }: { materialId: string }) {
  const [pack, setPack] = useState<PackDoc | null | undefined>(undefined);
  useEffect(
    () => onSnapshot(doc(db, "materials", materialId, "ai", "pack"), (snap) => setPack(snap.exists() ? (snap.data() as PackDoc) : null), () => setPack(null)),
    [materialId]
  );
  if (pack === undefined) return null;
  const [label, style] =
    pack?.status === "ready"
      ? pack.published
        ? ["AI pack live", "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"]
        : ["AI pack: review", "bg-amber-500/15 text-amber-800 dark:text-amber-300"]
      : pack?.status === "generating"
        ? ["AI making…", "bg-[var(--accent-light)] text-[var(--accent-text)]"]
        : ["No AI pack", "bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"];
  return <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${style}`}>{label}</span>;
}
