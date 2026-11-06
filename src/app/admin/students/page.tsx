"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import { GraduationCap, ArrowLeft, Search, Plus } from "lucide-react";

export default function AdminStudentsPage() {
  const { currentCollege } = useApp();
  const [search, setSearch] = useState("");

  const studentList = [
    { id: "s1", name: "Simatupang Aris", email: "simatupang@student.stjude.edu", studentId: "ST-2024-8842", batch: "Class of 2027", department: "Interaction Design", status: "Active" },
    { id: "s2", name: "Elena Vance", email: "elena@student.stjude.edu", studentId: "ST-2024-8819", batch: "Class of 2027", department: "Computer Science", status: "Active" },
    { id: "s3", name: "Rohan Patel", email: "rohan@student.stjude.edu", studentId: "ST-2024-7712", batch: "Class of 2026", department: "Computer Science", status: "Active" },
    { id: "s4", name: "Chloe Dupont", email: "chloe@student.stjude.edu", studentId: "ST-2024-9120", batch: "Class of 2028", department: "Computational Economics", status: "Active" }
  ];

  const filtered = studentList.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Admin Dashboard</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Student Directory
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Institutional student accounts enrolled in {currentCollege.name}
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-56"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase text-[10px] font-semibold">
            <tr>
              <th className="py-3 px-5">Student Name</th>
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Batch / Cohort</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-[var(--bg-primary)]/40 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-[var(--text-primary)]">{s.name}</td>
                <td className="py-3.5 px-4 font-mono text-[var(--accent)]">{s.studentId}</td>
                <td className="py-3.5 px-4 text-[var(--text-secondary)]">{s.batch}</td>
                <td className="py-3.5 px-4 text-[var(--text-secondary)]">{s.department}</td>
                <td className="py-3.5 px-5 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
