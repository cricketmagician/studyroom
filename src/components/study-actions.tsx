"use client";

import React, { useEffect, useState } from "react";
import { Bookmark, CheckCircle2, Circle, NotebookPen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { friendlyError } from "@/lib/firebase/errors";
import { MAX_NOTE, updateEntry, useMyLibrary } from "@/lib/hooks";
import { ErrorText } from "@/components/auth-card";
import { cardClass, pillButton } from "@/components/ui";

/** "Save for later" and "Mark as done" buttons for one file. */
export function StudyActions({ materialId }: { materialId: string }) {
  const { user } = useAuth();
  const entry = useMyLibrary()[materialId];
  const [error, setError] = useState("");

  const toggle = (field: "saved" | "done") => {
    if (!user) return;
    setError("");
    updateEntry(user.uid, materialId, { [field]: !entry?.[field] }).catch((err) => setError(friendlyError(err)));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggle("done")}
          aria-pressed={Boolean(entry?.done)}
          className={`${pillButton} h-11 px-5 text-sm ${
            entry?.done
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:border-emerald-500"
          }`}
        >
          {entry?.done ? <CheckCircle2 className="w-4 h-4" aria-hidden /> : <Circle className="w-4 h-4" aria-hidden />}
          {entry?.done ? "Done" : "Mark as done"}
        </button>
        <button
          onClick={() => toggle("saved")}
          aria-pressed={Boolean(entry?.saved)}
          className={`${pillButton} h-11 px-5 text-sm ${
            entry?.saved
              ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white"
              : "bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:border-[var(--accent)]"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${entry?.saved ? "fill-current" : ""}`} aria-hidden />
          {entry?.saved ? "Saved" : "Save for later"}
        </button>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/** A private notebook for one file. */
export function NotesCard({ materialId }: { materialId: string }) {
  const { user } = useAuth();
  const saved = useMyLibrary()[materialId]?.note ?? "";
  // null = no unsaved edits, so the box shows what's stored.
  const [draft, setDraft] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const text = draft ?? saved;
  const dirty = draft !== null && draft !== saved;

  // Warn before closing the tab with unsaved notes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async () => {
    if (!user || draft === null) return;
    setStatus("saving");
    setError("");
    try {
      await updateEntry(user.uid, materialId, { note: draft });
      setDraft(null);
      setStatus("saved");
    } catch (err) {
      setError(friendlyError(err));
      setStatus("idle");
    }
  };

  return (
    <section className={`${cardClass} p-5 sm:p-6 space-y-3`}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
          <NotebookPen className="w-4 h-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-heading font-bold text-sm leading-tight">My notes</h2>
          <p className="text-[11px] text-[var(--text-muted)]">Only you can see these</p>
        </div>
      </div>
      <label className="block">
        <span className="sr-only">My notes for this file</span>
        <textarea
          value={text}
          onChange={(e) => { setDraft(e.target.value); setStatus("idle"); }}
          maxLength={MAX_NOTE}
          rows={5}
          placeholder="Write key points, questions for your teacher, page numbers to revise…"
          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm leading-relaxed outline-none resize-y focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:ring-4 focus:ring-[var(--ring-color)]"
        />
      </label>
      <ErrorText>{error}</ErrorText>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--text-muted)]" role="status">
          {status === "saved" && !dirty ? "✓ Saved" : dirty ? "Unsaved changes" : `${text.length} / ${MAX_NOTE}`}
        </span>
        <button
          onClick={save}
          disabled={!dirty || status === "saving"}
          className={`${pillButton} h-10 px-5 text-xs bg-[#111110] text-white dark:bg-white dark:text-[#111110]`}
        >
          {status === "saving" ? "Saving…" : "Save notes"}
        </button>
      </div>
    </section>
  );
}
