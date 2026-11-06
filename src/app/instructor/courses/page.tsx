"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import {
  BookOpen,
  PlusCircle,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";

export default function InstructorCoursesPage() {
  const { courses, updateCourse } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Course Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Curate curriculum, manage modules, and publish course materials
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assigned courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-56"
            />
          </div>

          <Link
            href="/instructor/courses/new"
            className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Course</span>
          </Link>
        </div>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-[var(--border-color)]">
                <img
                  src={course.cover_image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/75 text-white font-mono text-[10px] font-bold">
                  {course.code}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      course.is_published
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {course.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-heading font-bold text-sm text-[var(--text-primary)] line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)] pt-2 font-mono">
                  <span>{course.enrolled_count || 0} students</span>
                  <span>·</span>
                  <span>3 Modules</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-[var(--border-subtle)] mt-3">
              <button
                onClick={() => updateCourse(course.id, { is_published: !course.is_published })}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {course.is_published ? "Unpublish" : "Publish"}
              </button>

              <Link
                href={`/instructor/content-studio?courseId=${course.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-xs flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Content Studio</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
