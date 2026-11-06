"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store/app-store";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  Award,
  Filter
} from "lucide-react";

export default function InstructorStudentsPage() {
  const { courses, assignments } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");

  const students = [
    {
      id: "user-student-001",
      name: "Simatupang Aris",
      email: "simatupang@student.stjude.edu",
      studentId: "ST-2024-8842",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=260",
      cohort: "Junior Cohort (2027)",
      courseCode: "DES-401",
      completionRate: 67,
      videoWatchMins: 38.5,
      lastActive: "Today at 12:30 PM",
      submission: {
        title: "Minimalist Design System Spec",
        grade: 96,
        status: "Graded",
        feedback: "Exceptional clarity, rigorous typography tokens, and elegant hierarchy."
      }
    },
    {
      id: "user-student-002",
      name: "Elena Vance",
      email: "elena@student.stjude.edu",
      studentId: "ST-2024-8819",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=260",
      cohort: "Junior Cohort (2027)",
      courseCode: "DES-401",
      completionRate: 83,
      videoWatchMins: 52.0,
      lastActive: "Today at 09:14 AM",
      submission: {
        title: "Minimalist Design System Spec",
        grade: 92,
        status: "Graded",
        feedback: "Solid foundation on warm neutrals and accessible contrast ratios."
      }
    },
    {
      id: "user-student-003",
      name: "Rohan Patel",
      email: "rohan@student.stjude.edu",
      studentId: "ST-2024-7712",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=260",
      cohort: "Senior Cohort (2026)",
      courseCode: "CS-482",
      completionRate: 42,
      videoWatchMins: 22.0,
      lastActive: "Yesterday at 04:20 PM",
      submission: {
        title: "Raft Leader Election",
        grade: null,
        status: "Pending Review",
        feedback: null
      }
    }
  ];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      selectedCourseFilter === "all" || s.courseCode === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Student Roster & Cohort Progress
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Track individual progress, lecture completion rates, and submit grading feedback
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-56"
            />
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-5">Student</th>
                <th className="py-3 px-4">Cohort & Course</th>
                <th className="py-3 px-4">Curriculum Progress</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Assignment Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--bg-primary)]/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-8 h-8 rounded-full object-cover border border-[var(--border-color)]"
                      />
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">{s.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-mono">{s.studentId}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-text)]">
                      {s.courseCode}
                    </span>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{s.cohort}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="w-32 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>{s.completionRate}%</span>
                        <span className="text-[var(--text-secondary)]">{s.videoWatchMins}m video</span>
                      </div>
                      <div className="w-full bg-[var(--border-color)]/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[var(--accent)] h-full rounded-full"
                          style={{ width: `${s.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-[11px] text-[var(--text-secondary)]">
                    {s.lastActive}
                  </td>

                  <td className="py-4 px-4">
                    {s.submission ? (
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.submission.status === "Graded"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {s.submission.status} ({s.submission.grade ? `${s.submission.grade}/100` : "Pending"})
                        </span>
                        <div className="text-[10px] text-[var(--text-secondary)] truncate max-w-[150px] mt-0.5">
                          {s.submission.title}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[var(--text-secondary)]">No submissions</span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => alert(`Reviewing work & leave grade for ${s.name}`)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-primary)] text-xs font-semibold shadow-2xs transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
