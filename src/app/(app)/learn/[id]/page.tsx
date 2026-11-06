"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { RequireRole, Spinner } from "@/lib/auth";
import { formatSize } from "@/lib/files";
import { Material, toMaterial } from "@/lib/materials";
import { ErrorText } from "@/components/auth-card";
import { MaterialIcon } from "@/components/material-icon";
import { pillButton } from "@/components/ui";
import { rememberOpened } from "@/components/study-tiles";
import { NotesCard, StudyActions } from "@/components/study-actions";

export default function ViewerPage() {
  return (
    <RequireRole>
      <Viewer />
    </RequireRole>
  );
}

const roundButton = `${pillButton} h-10 px-4 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:border-[var(--text-muted)]`;

function Viewer() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Material | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoc(doc(db, "materials", id))
      .then((snap) => {
        setItem(snap.exists() ? toMaterial(snap) : null);
        if (snap.exists()) rememberOpened(id);
      })
      .catch((err) => setError(friendlyError(err)));
  }, [id]);

  return (
    <div className="space-y-5">
      <Link href="/learn" className={roundButton}>
        <ArrowLeft className="w-4 h-4" aria-hidden /> All files
      </Link>

      <ErrorText>{error}</ErrorText>
      {item === undefined && !error && <Spinner />}
      {item === null && <p className="py-16 text-center text-[var(--text-secondary)]">This file was removed or does not exist.</p>}

      {item && (
        <article className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <span className="shrink-0 mt-1 w-12 h-12 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                <MaterialIcon type={item.type} className="w-6 h-6" />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight leading-tight break-words">{item.title}</h1>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Shared by {item.teacherName} · {item.createdAt?.toDate().toLocaleDateString()} · {formatSize(item.size)}
                </p>
              </div>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className={roundButton}>
              <ExternalLink className="w-4 h-4" aria-hidden /> Open in new tab
            </a>
          </div>

          <StudyActions materialId={item.id} />

          <div className="rounded-[32px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg">
            {item.type === "pdf" ? (
              <iframe src={item.url} title={item.title} className="w-full h-[78vh]" />
            ) : (
              <video src={item.url} controls playsInline preload="metadata" className="w-full max-h-[78vh] bg-black" />
            )}
          </div>

          <NotesCard materialId={item.id} />
        </article>
      )}
    </div>
  );
}
