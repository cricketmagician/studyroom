"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { RequireRole, Spinner } from "@/lib/auth";
import { Material, toMaterial } from "@/lib/materials";
import { ErrorText } from "@/components/auth-card";

export default function ViewerPage() {
  return (
    <RequireRole>
      <Viewer />
    </RequireRole>
  );
}

function Viewer() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Material | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoc(doc(db, "materials", id))
      .then((snap) => setItem(snap.exists() ? toMaterial(snap) : null))
      .catch((err) => setError(friendlyError(err)));
  }, [id]);

  return (
    <>
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="w-4 h-4" aria-hidden /> All files
      </Link>

      <ErrorText>{error}</ErrorText>
      {item === undefined && !error && <Spinner />}
      {item === null && <p className="mt-12 text-center text-[var(--text-secondary)]">This file was removed or does not exist.</p>}

      {item && (
        <article className="mt-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-heading font-bold">{item.title}</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Shared by {item.teacherName} · {item.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-[var(--bg-surface-subtle)]"
            >
              <ExternalLink className="w-4 h-4" aria-hidden /> Open in new tab
            </a>
          </div>

          <div className="mt-6 rounded-3xl overflow-hidden border bg-[var(--bg-surface)] shadow-[var(--shadow-md)]">
            {item.type === "pdf" ? (
              <iframe src={item.url} title={item.title} className="w-full h-[80vh]" />
            ) : (
              <video src={item.url} controls playsInline preload="metadata" className="w-full max-h-[80vh] bg-black" />
            )}
          </div>
        </article>
      )}
    </>
  );
}
