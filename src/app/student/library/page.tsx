"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import {
  Bookmark,
  FileText,
  PlayCircle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  BookOpen
} from "lucide-react";

export default function StudentLibraryPage() {
  const { courses, pdfBookmarks, notes, watchProgress } = useApp();
  const [activeFilter, setActiveFilter] = useState<"all" | "pdf" | "video" | "notes">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeCourse = courses[0];

  return (
    <div className="max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-normal tracking-tight font-sans">
            Archived Materials & Monograph Vault
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-[#111110] dark:text-white tracking-tight leading-tight mt-0.5">
            Academic Library
          </h1>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-56"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeFilter === "all"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          All Items ({pdfBookmarks.length + notes.length + 1})
        </button>
        <button
          onClick={() => setActiveFilter("pdf")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeFilter === "pdf"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Saved PDFs ({pdfBookmarks.length})
        </button>
        <button
          onClick={() => setActiveFilter("video")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeFilter === "video"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Bookmarked Lectures (1)
        </button>
        <button
          onClick={() => setActiveFilter("notes")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeFilter === "notes"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Timestamped Notes ({notes.length})
        </button>
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Saved PDFs */}
        {(activeFilter === "all" || activeFilter === "pdf") &&
          pdfBookmarks.map((bm) => (
            <div
              key={bm.id}
              className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[10px] text-[var(--accent)] font-semibold bg-[var(--accent-light)] px-2 py-0.5 rounded">
                    Page {bm.page_number}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-[var(--text-secondary)]">DES-401 Monograph</span>
                <h3 className="font-heading font-bold text-sm text-[var(--text-primary)] mt-1 mb-2">
                  The Readwise Heuristic: Digital Reading Ergonomics
                </h3>
                {bm.note && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic mb-4">
                    &ldquo;{bm.note}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <span className="text-[10px] text-[var(--text-secondary)]">Saved Nov 2</span>
                <Link
                  href={`/student/courses/${activeCourse.id}/pdf`}
                  className="font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  <span>Open Reader</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

        {/* Bookmarked Video Moment */}
        {(activeFilter === "all" || activeFilter === "video") && (
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <span className="font-mono text-[10px] text-[var(--accent)] font-bold bg-[var(--accent-light)] px-2 py-0.5 rounded">
                  18:30 / 40:21
                </span>
              </div>

              <span className="text-[10px] font-mono text-[var(--text-secondary)]">DES-401 Lecture 1</span>
              <h3 className="font-heading font-bold text-sm text-[var(--text-primary)] mt-1 mb-2">
                Project Initiation & Mental Mapping
              </h3>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4">
                Chapter 2: Project Initiation and Setup. Bookmarked for midterm exam preparation.
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[var(--text-secondary)]">Watched today</span>
              <Link
                href={`/student/courses/${activeCourse.id}/video`}
                className="font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                <span>Jump to 18:30</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Timestamped Notes */}
        {(activeFilter === "all" || activeFilter === "notes") &&
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  {note.timestamp_seconds !== undefined && (
                    <span className="font-mono text-[10px] text-[var(--accent)] font-bold bg-[var(--accent-light)] px-2 py-0.5 rounded">
                      Video @ {Math.floor(note.timestamp_seconds / 60)}:{(note.timestamp_seconds % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                  {note.page_number !== undefined && (
                    <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                      Page {note.page_number}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--text-primary)] leading-relaxed mb-4">
                  {note.content}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                <Link
                  href={note.timestamp_seconds !== undefined ? `/student/courses/${activeCourse.id}/video` : `/student/courses/${activeCourse.id}/pdf`}
                  className="font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  <span>Go to source</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

      </div>
    </div>
  );
}
