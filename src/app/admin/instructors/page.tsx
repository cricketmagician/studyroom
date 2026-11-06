"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import { Users2, ArrowLeft, Mail, BookOpen } from "lucide-react";

export default function AdminInstructorsPage() {
  const { currentCollege } = useApp();

  const faculty = [
    {
      name: "Prof. Marcus Vance, Ph.D.",
      email: "marcus.vance@faculty.stjude.edu",
      dept: "Interaction & Product Design",
      role: "Senior Professor & Course Director",
      courses: ["DES-401: Cognitive Interfaces", "CS-482: Distributed Cloud Systems"]
    },
    {
      name: "Dr. Julian Zhang",
      email: "julian.zhang@faculty.stjude.edu",
      dept: "Computational Economics",
      role: "Associate Professor",
      courses: ["ECON-310: Algorithmic Game Theory"]
    },
    {
      name: "Dr. Alistair Finch",
      email: "alistair.finch@faculty.stjude.edu",
      dept: "Computer Science",
      role: "Professor of Cryptography",
      courses: ["CS-501: Zero-Knowledge Protocols"]
    }
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Admin Dashboard</span>
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Faculty Directory
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Instructors, department chairs, and course allocations for {currentCollege.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {faculty.map((f) => (
          <div key={f.name} className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs space-y-4">
            <div>
              <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">{f.name}</h3>
              <div className="text-xs text-[var(--accent)] font-medium mt-0.5">{f.role}</div>
              <div className="text-[11px] text-[var(--text-secondary)]">{f.dept}</div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">Assigned Courses:</span>
              {f.courses.map((c) => (
                <div key={c} className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-primary)] p-2 rounded-xl border border-[var(--border-color)]">
                  {c}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
