"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { RequireRole, Spinner } from "@/lib/auth";
import { Material, toMaterial } from "@/lib/materials";
import { ErrorText } from "@/components/auth-card";
import { MaterialIcon } from "@/components/material-icon";

export default function LearnPage() {
  return (
    <RequireRole>
      <Library />
    </RequireRole>
  );
}

function Library() {
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

  return (
    <>
      <h1 className="text-2xl font-heading font-bold">Class files</h1>
      <p className="mt-1 text-[var(--text-secondary)]">PDFs and videos shared by your teachers. Tap one to open it.</p>
      <div className="mt-2"><ErrorText>{error}</ErrorText></div>

      {!items && !error && <Spinner />}
      {items?.length === 0 && (
        <p className="mt-12 text-center text-[var(--text-secondary)]">No files yet. When your teacher uploads something, it will show up here.</p>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((m) => (
          <li key={m.id}>
            <Link
              href={`/learn/${m.id}`}
              className="group block h-full bg-[var(--bg-surface)] border rounded-3xl p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-color)]"
            >
              <span
                className={`flex items-center justify-center h-28 rounded-2xl ${
                  m.type === "pdf"
                    ? "bg-[var(--accent-light)] text-[var(--accent-text)]"
                    : "bg-[#20201E] text-[#F6F4EF] dark:bg-[#F6F4EF] dark:text-[#20201E]"
                }`}
              >
                <MaterialIcon type={m.type} className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </span>
              <span className="mt-4 block font-heading font-semibold leading-snug line-clamp-2">{m.title}</span>
              <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                {m.type === "pdf" ? "PDF" : "Video"} · {m.teacherName} · {m.createdAt?.toDate().toLocaleDateString() ?? "Just now"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
