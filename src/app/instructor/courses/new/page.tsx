"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/app-store";
import { ArrowLeft, PlusCircle, CheckCircle2 } from "lucide-react";

export default function CreateCoursePage() {
  const router = useRouter();
  const { createCourse, departments, sessions } = useApp();

  const [code, setCode] = useState("DES-450");
  const [title, setTitle] = useState("Spatial Audio & Auditory Interface Ergonomics");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || "");
  const [description, setDescription] = useState(
    "Design and human perception of acoustic spatial mapping, auditory feedback cues, and non-visual user interface systems."
  );
  const [syllabus, setSyllabus] = useState(
    "1. Psychoacoustics and spatial positioning\n2. Earcon design and haptic sync\n3. Accessibility and screen reader synchronization."
  );
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newCourse = createCourse({
      code,
      title,
      department_id: departmentId,
      description,
      syllabus,
      cover_image: coverImage,
      is_published: true,
    });

    setTimeout(() => {
      router.push(`/instructor/content-studio?courseId=${newCourse.id}`);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/instructor/courses"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Assigned Courses</span>
      </Link>

      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-heading font-bold text-[var(--text-primary)]">
            Create Academic Course
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure new course metadata and syllabus before assembling curriculum in Content Studio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Course Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS-401"
                className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Course Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Human-Computer Interaction"
              className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Course Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Syllabus Outline
            </label>
            <textarea
              rows={3}
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? "Creating..." : "Save & Open in Content Studio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
