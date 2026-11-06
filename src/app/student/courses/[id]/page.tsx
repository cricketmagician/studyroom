"use client";

import React, { useState, use, Suspense } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import {
  PlayCircle,
  FileText,
  Clock,
  BookOpen,
  CheckCircle2,
  Calendar,
  User,
  ArrowLeft,
  ChevronDown,
  Upload,
  Send,
  FileCheck
} from "lucide-react";

function CourseDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { courses, modules, lessons, assignments, submitAssignment, watchProgress } = useApp();

  const [activeTab, setActiveTab] = useState<"curriculum" | "syllabus" | "announcements">("curriculum");
  const [submissionText, setSubmissionText] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const course = courses.find((c) => c.id === courseId) || courses[0];
  const courseModules = modules.filter((m) => m.course_id === course.id);
  const courseAssignments = assignments.filter((a) => a.course_id === course.id);

  const handleAssignmentSubmit = (assignmentId: string, e: React.FormEvent) => {
    e.preventDefault();
    submitAssignment(assignmentId, submissionText, ["https://example.com/student_spec.pdf"]);
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 4000);
  };

  return (
    <div className="max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Courses</span>
        </Link>
      </div>

      {/* Course Banner */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-64 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--border-color)] shrink-0">
          <img
            src={course.cover_image}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[var(--accent)] text-white font-mono text-xs font-bold">
              {course.code}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Fall Semester 2026 · Junior Cohort
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-primary)] leading-tight">
            {course.title}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=260"
                alt="Instructor"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-medium text-[var(--text-primary)]">Prof. Marcus Vance, Ph.D.</span>
            </div>
            <span>·</span>
            <span>3 Modules (12 Lessons)</span>
            <span>·</span>
            <span>67% Completed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-color)] flex items-center gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === "curriculum"
              ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Curriculum & Lessons
        </button>
        <button
          onClick={() => setActiveTab("syllabus")}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === "syllabus"
              ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Syllabus & Policies
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "curriculum" && (
        <div className="space-y-6">
          {courseModules.map((module, idx) => {
            const moduleLessons = lessons.filter((l) => l.module_id === module.id);
            return (
              <div
                key={module.id}
                className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-sm"
              >
                <div className="p-5 sm:p-6 bg-[var(--bg-surface-subtle)] border-b border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                      Module 0{idx + 1}
                    </span>
                    <h2 className="text-base font-heading font-bold text-[var(--text-primary)] mt-0.5">
                      {module.title}
                    </h2>
                    {module.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{module.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {moduleLessons.length} lessons
                  </span>
                </div>

                <div className="divide-y divide-[var(--border-subtle)]">
                  {moduleLessons.map((lesson) => {
                    const isVideo = lesson.lesson_type === "video";
                    const isPdf = lesson.lesson_type === "pdf";
                    const isAssignment = lesson.lesson_type === "assignment";
                    const wp = watchProgress[lesson.id];

                    return (
                      <div
                        key={lesson.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--bg-primary)]/40 transition-colors"
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`p-2 rounded-xl mt-0.5 ${
                              isVideo
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : isPdf
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-emerald-500/10 text-emerald-600"
                            }`}
                          >
                            {isVideo && <PlayCircle className="w-4 h-4" />}
                            {isPdf && <FileText className="w-4 h-4" />}
                            {isAssignment && <CheckCircle2 className="w-4 h-4" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                                {lesson.title}
                              </h3>
                              {wp?.is_completed && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[9px]">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                              {lesson.description}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] mt-1 font-mono">
                              <span>
                                {isVideo
                                  ? `${Math.floor((lesson.duration_seconds || 1200) / 60)} mins lecture`
                                  : isPdf
                                  ? `${lesson.estimated_reading_time_mins || 15} mins read`
                                  : "Specification"}
                              </span>
                              {wp && (
                                <span className="text-[var(--accent)]">
                                  Watched: {Math.floor(wp.last_timestamp_seconds / 60)}m
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          {isVideo && (
                            <Link
                              href={`/student/courses/${course.id}/video`}
                              className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>{wp ? "Resume Video" : "Start Video"}</span>
                            </Link>
                          )}

                          {isPdf && (
                            <Link
                              href={`/student/courses/${course.id}/pdf?lessonId=${lesson.id}`}
                              className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-500" />
                              <span>Open PDF Monograph</span>
                            </Link>
                          )}

                          {isAssignment && (
                            <a
                              href="#assignment-portal"
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Submit Work</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Assignment Submission Section */}
          <div id="assignment-portal" className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-base font-heading font-bold text-[var(--text-primary)]">
                  Assignment Portal: Minimalist Design System Specification
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  DES-401 Deliverable · Max 100 Points · Due Nov 12, 2026
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                Graded: 96/100
              </span>
            </div>

            {submittedMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Assignment successfully submitted to faculty review queue!</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-2 text-xs">
              <div className="font-semibold text-[var(--text-primary)]">Faculty Feedback from Prof. Marcus Vance:</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                &ldquo;Exceptional clarity, rigorous typography tokens, and elegant hierarchy. Particularly impressed by the 150ms transition curves and Readwise margin ratio.&rdquo;
              </p>
            </div>

            <form onSubmit={(e) => handleAssignmentSubmit("asg-01", e)} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Update or Resubmit Submission Notes / Asset Links:
              </label>
              <textarea
                rows={3}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Include Figma URL, GitHub repo, or design spec notes..."
                className="w-full text-xs p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Instructor</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "syllabus" && (
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-heading font-bold text-[var(--text-primary)]">
            Course Syllabus & Grading Weights
          </h2>
          <div className="prose dark:prose-invert text-xs sm:text-sm text-[var(--text-secondary)] space-y-4">
            <p>
              This course covers the architectural and cognitive principles required to construct minimalist, low-latency, and high-density digital workspace applications.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="font-bold text-sm text-[var(--text-primary)]">40%</div>
                <div className="text-xs text-[var(--text-secondary)]">Design System Projects</div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="font-bold text-sm text-[var(--text-primary)]">30%</div>
                <div className="text-xs text-[var(--text-secondary)]">Monograph Reading & Notes</div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div className="font-bold text-sm text-[var(--text-primary)]">30%</div>
                <div className="text-xs text-[var(--text-secondary)]">Final Capstone Presentation</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentCourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--text-secondary)]">Loading curriculum...</div>}>
      <CourseDetailsContent params={params} />
    </Suspense>
  );
}
