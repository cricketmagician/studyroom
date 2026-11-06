"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import { ArrowRightLeft, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AdminAllocationsPage() {
  const { courses, departments, currentCollege } = useApp();

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Admin Dashboard</span>
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Course Allocations & Department Mapping
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Manage faculty assignment, department affiliation, and enrolled cohort mapping
        </p>
      </div>

      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase text-[10px] font-semibold">
            <tr>
              <th className="py-3 px-5">Course Code & Title</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Assigned Instructor</th>
              <th className="py-3 px-4">Enrollment Count</th>
              <th className="py-3 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {courses.map((c) => {
              const dept = departments.find((d) => d.id === c.department_id);
              return (
                <tr key={c.id} className="hover:bg-[var(--bg-primary)]/40 transition-colors">
                  <td className="py-4 px-5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-text)]">
                      {c.code}
                    </span>
                    <div className="font-semibold text-[var(--text-primary)] mt-1">{c.title}</div>
                  </td>
                  <td className="py-4 px-4 text-[var(--text-secondary)]">{dept?.name || "General"}</td>
                  <td className="py-4 px-4 font-medium text-[var(--text-primary)]">Prof. Marcus Vance</td>
                  <td className="py-4 px-4 font-mono text-[var(--accent)]">{c.enrolled_count || 0} students</td>
                  <td className="py-4 px-5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      Active
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
