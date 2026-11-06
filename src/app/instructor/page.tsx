"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import {
  BookOpen,
  Users,
  Video,
  FileText,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers
} from "lucide-react";

export default function InstructorDashboardPage() {
  const { currentUser, currentCollege, courses, assignments } = useApp();

  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolled_count || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Faculty Overview · {currentCollege.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-primary)]">
            Welcome back, {currentUser.full_name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/instructor/content-studio"
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Open Content Studio</span>
          </Link>
          <Link
            href="/instructor/courses/new"
            className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>New Course</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Assigned Courses</span>
            <BookOpen className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-heading font-bold text-[var(--text-primary)]">
            {courses.length}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">3 Active in Fall 2026</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-[var(--text-primary)]">
            {totalStudents}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">Across CS & Design Depts</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Published Lessons</span>
            <Video className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-[var(--text-primary)]">
            18
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">12 Videos, 6 Monographs</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Cohort Retention</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-[var(--text-primary)]">
            88%
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">+6% over previous semester</p>
        </div>
      </div>

      {/* Main Split: Courses Management & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Assigned Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-[var(--text-primary)]">
              Assigned Courses & Content
            </h2>
            <Link
              href="/instructor/courses"
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-16 rounded-2xl overflow-hidden bg-[var(--border-color)] shrink-0">
                    <img
                      src={course.cover_image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-text)]">
                        {course.code}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                        Published
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                      {course.title}
                    </h3>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      {course.enrolled_count} students · 3 Modules · 12 Lessons
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Link
                    href={`/instructor/content-studio?courseId=${course.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold transition-all shadow-xs"
                  >
                    Edit Curriculum
                  </Link>
                  <Link
                    href="/instructor/students"
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] text-xs font-medium transition-colors"
                  >
                    Roster
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Student Activity & Submissions */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                Recent Student Activity
              </h3>
              <span className="text-[10px] text-[var(--text-secondary)]">Live Feed</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">Simatupang Aris</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">10m ago</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Submitted Assignment: Minimalist Design System Specification (DES-401). Graded 96/100.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">Simatupang Aris</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">1h ago</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Watched 18:30 of Lecture 1: Project Initiation & Mental Mapping.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">Elena Vance</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">3h ago</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Bookmarked Page 7 on Monograph: The Readwise Heuristic.
                </p>
              </div>
            </div>

            <Link
              href="/instructor/students"
              className="w-full py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] text-center block transition-colors"
            >
              View Full Student Engagement Roster
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
