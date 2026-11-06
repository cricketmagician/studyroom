"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import {
  Building2,
  Users2,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function CollegeAdminDashboardPage() {
  const { currentCollege, departments, batches, sessions, courses } = useApp();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Institutional Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-primary)]">
            {currentCollege.name}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Tenant Boundary: <code className="font-mono text-[var(--accent)]">{currentCollege.id}</code> · Domain: {currentCollege.domain}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/allocations"
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Allocate Courses</span>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Academic Departments</span>
            <Building2 className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-heading font-bold text-[var(--text-primary)]">
            {departments.length}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">CS, Design, Economics</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Enrolled Students</span>
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-[var(--text-primary)]">
            119
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">Class of 2026, 2027</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Active Faculty</span>
            <Users2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-[var(--text-primary)]">
            14
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">Across 3 schools</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Current Session</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-heading font-bold text-[var(--text-primary)] truncate">
            Fall 2026
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Term in Progress</p>
        </div>
      </div>

      {/* Navigation Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/departments"
          className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent)] shadow-xs hover:shadow-md transition-all group"
        >
          <Building2 className="w-6 h-6 text-[var(--accent)] mb-3" />
          <h3 className="font-heading font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            Departments & Faculties
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">
            Manage academic divisions, course codes, and department chairs.
          </p>
          <div className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
            <span>Manage Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/batches"
          className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent)] shadow-xs hover:shadow-md transition-all group"
        >
          <Calendar className="w-6 h-6 text-purple-500 mb-3" />
          <h3 className="font-heading font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            Batches & Semesters
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">
            Configure academic cohorts, graduation timelines, and term dates.
          </p>
          <div className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
            <span>Configure Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/allocations"
          className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent)] shadow-xs hover:shadow-md transition-all group"
        >
          <Layers className="w-6 h-6 text-emerald-500 mb-3" />
          <h3 className="font-heading font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            Course Allocation
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">
            Assign curriculum to instructors and map cohort enrollments.
          </p>
          <div className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
            <span>Manage Allocations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
