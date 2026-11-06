"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import { Calendar, ArrowLeft, Plus, CheckCircle2 } from "lucide-react";

export default function AdminBatchesPage() {
  const { batches, sessions, createBatch, departments, currentCollege } = useApp();
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [gradYear, setGradYear] = useState(2028);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) return;
    createBatch({ name: batchName, graduation_year: gradYear });
    setBatchName("");
    setShowBatchModal(false);
  };

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Admin Dashboard</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Academic Batches & Semester Sessions
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure graduation cohorts and institutional academic calendars
          </p>
        </div>

        <button
          onClick={() => setShowBatchModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Batch Cohort</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Sessions */}
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-xs space-y-4">
          <h2 className="font-heading font-bold text-base text-[var(--text-primary)]">
            Academic Sessions / Semesters
          </h2>
          <div className="space-y-3">
            {sessions.map((sess) => (
              <div key={sess.id} className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{sess.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    {sess.start_date} to {sess.end_date}
                  </div>
                </div>
                {sess.is_current ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Current Term
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--text-secondary)]">Past Term</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Batches / Cohorts */}
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-xs space-y-4">
          <h2 className="font-heading font-bold text-base text-[var(--text-primary)]">
            Student Cohort Batches
          </h2>
          <div className="space-y-3">
            {batches.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{b.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    Graduation Year: {b.graduation_year}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[var(--accent)] font-bold">
                  Class of {b.graduation_year}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
              Create Student Cohort Batch
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class of 2028 (Sophomore Cohort)"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  required
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
