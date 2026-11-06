"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  ArrowRight,
  Tag
} from "lucide-react";

export default function StudentNotesPage() {
  const { notes, addNote, deleteNote, courses } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("synthesis");

  const activeCourse = courses[0];

  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  );

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || (note.tags && note.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    addNote({
      course_id: activeCourse.id,
      content: newContent,
      tags: newTag ? [newTag] : ["study-note"],
    });
    setNewContent("");
  };

  return (
    <div className="max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-normal tracking-tight font-sans">
            Knowledge Base & Annotations
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-[#111110] dark:text-white tracking-tight leading-tight mt-0.5">
            Study Notebook
          </h1>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-56"
          />
        </div>
      </div>

      {/* New Note Form */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs space-y-3">
        <span className="text-xs font-semibold text-[var(--text-primary)]">Capture New Note</span>
        <form onSubmit={handleCreateNote} className="space-y-3">
          <textarea
            rows={2}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Synthesize a concept, key takeaway, or question for office hours..."
            className="w-full text-xs p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-secondary)]">Tag:</span>
              <input
                type="text"
                placeholder="tag-name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] w-32 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tags Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedTag("all")}
          className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
            selectedTag === "all"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]"
          }`}
        >
          All Notes ({notes.length})
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              selectedTag === tag
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Notes Masonry / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                {note.timestamp_seconds !== undefined ? (
                  <span className="font-mono text-[10px] text-[var(--accent)] font-bold bg-[var(--accent-light)] px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{Math.floor(note.timestamp_seconds / 60)}:{(note.timestamp_seconds % 60).toString().padStart(2, "0")}</span>
                  </span>
                ) : note.page_number !== undefined ? (
                  <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                    Page {note.page_number}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">General Study Note</span>
                )}

                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 rounded text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-[var(--text-primary)] leading-relaxed mb-4 whitespace-pre-wrap">
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

              {note.timestamp_seconds !== undefined && (
                <Link
                  href={`/student/courses/${activeCourse.id}/video`}
                  className="font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 text-xs"
                >
                  <span>Resume at timestamp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
