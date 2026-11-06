"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store/app-store";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Bookmark,
  BookmarkCheck,
  Search,
  Download,
  FileText,
  Highlighter,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Layers
} from "lucide-react";

function PdfReadingContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");
  const { courses, lessons, resources, pdfBookmarks, addPdfBookmark, removePdfBookmark } = useApp();

  const course = courses.find((c) => c.id === courseId) || courses[0];
  const activeLesson = (lessonId ? lessons.find((l) => l.id === lessonId) : null) || lessons.find((l) => l.course_id === course.id && l.lesson_type === "pdf") || lessons[0];
  const activeResource = resources.find((r) => r.lesson_id === activeLesson?.id) || resources.find((r) => r.course_id === course.id && r.resource_type === "pdf");
  const pdfUrl = activeResource?.file_url;

  const [viewMode, setViewMode] = useState<"document" | "editorial">("document");
  const [currentPage, setCurrentPage] = useState(7); // default to page 7 from demo
  const totalPages = 14;
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [downloadAuthorized, setDownloadAuthorized] = useState(true);

  // Auto-save last-read page to localStorage
  useEffect(() => {
    localStorage.setItem(`pdf_last_read_${course.id}`, currentPage.toString());
  }, [currentPage, course.id]);

  const isCurrentPageBookmarked = pdfBookmarks.some(
    (b) => b.page_number === currentPage
  );

  const toggleBookmark = () => {
    if (isCurrentPageBookmarked) {
      const bm = pdfBookmarks.find((b) => b.page_number === currentPage);
      if (bm) removePdfBookmark(bm.id);
    } else {
      addPdfBookmark("les-des-102", "res-pdf-102", currentPage, bookmarkNote || "Monograph reference point");
      setBookmarkNote("");
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `${(activeLesson?.title || course.code).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      a.target = "_blank";
      a.click();
      return;
    }
    // Simulate authorized document download
    const blob = new Blob([
      `Skillverse Academic Monograph - ${course.title}\nLesson: ${activeLesson?.title || "Course Monograph"}\nPage: ${currentPage}`
    ], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course.code}-Monograph-p${currentPage}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Realistic sample monograph page content representing Readwise & Linear Design Heuristics
  const pageContents: Record<number, { title: string; content: string[]; highlight?: string }> = {
    1: {
      title: "Title & Executive Summary",
      content: [
        "Monograph: Ergonomics of High-Density Academic Learning Environments",
        "Author: Prof. Marcus Vance, Ph.D. — Department of Interaction & Product Design",
        "Abstract: Digital workspaces for deep learning must decouple from generic enterprise SaaS patterns. When interfaces employ warm off-white canvases, restrained 8px layout matrices, and deliberate typographic rhythm, cognitive fatigue across multi-hour sessions decreases by over 24%."
      ]
    },
    7: {
      title: "Chapter 4: The Readwise Heuristic & Specular Reflectance",
      content: [
        "4.1 Specular Contrast in Long-Form Typography",
        "Standard high-contrast white (#FFFFFF) against pitch black (#000000) causes rapid pupil accommodation fatigue under artificial laboratory and classroom lighting. By shifting the foundational canvas to a warm neutral off-white (#F6F4EF) paired with charcoal typography (#20201E), ambient reflection is softened.",
        "4.2 Margin Ratios and Horizontal Gutter Constraints",
        "Reading speed peaks between 65 and 75 characters per line (CPL). Beyond 80 CPL, horizontal eye saccades lose track of line beginnings, causing rereading loops. In Studyroom, all reading views enforce a 680px editorial line constraint with minimum 24px gutters.",
        "4.3 Active Timestamp Annotation Ergonomics",
        "When students synthesize video lecture timestamps directly beside monograph excerpts, retention rates for procedural models increase from 41% to 79% over a 14-day recall interval."
      ],
      highlight: "Warm off-white background (#F6F4EF) with charcoal typography (#20201E) reduces cognitive eye fatigue."
    },
    12: {
      title: "Chapter 6: Token Architecture & 150ms Motion Transitions",
      content: [
        "6.1 Temporal Boundaries for Interactive Affordances",
        "Animations exceeding 300ms introduce perceived platform latency. Conversely, instantaneous 0ms layout shifts break mental spatial continuity. Micro-interactions calibrated strictly between 150ms and 250ms feel instantaneous yet physically anchored.",
        "6.2 Design Tokens for Accessibility & Contrast",
        "Every interactive state must maintain a 4.5:1 WCAG AA contrast ratio while preserving the warm terracotta accent (#C58B51) for active focus highlights."
      ]
    }
  };

  const currentPageData = pageContents[currentPage] || {
    title: `Section ${currentPage}: Academic Principles & Design Models`,
    content: [
      `Page ${currentPage} of the comprehensive DES-401 Monograph on Cognitive Learning Architecture.`,
      "Content covers mental model formation, spatial memory in software navigation, and elimination of unnecessary visual noise."
    ]
  };

  return (
    <div className={`space-y-4 ${isFocusMode ? "fixed inset-0 z-50 bg-[var(--bg-primary)] p-6 overflow-y-auto" : ""}`}>
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <Link
            href={`/student/courses/${course.id}`}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                {course.code} · Monograph Reader
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
                {activeResource?.storage_provider === "firebase" ? "Firebase Storage Live" : "Cloud PDF Live"}
              </span>
            </div>
            <h1 className="text-sm font-heading font-bold text-[var(--text-primary)] truncate max-w-sm sm:max-w-md">
              {activeLesson?.title || "The Readwise Heuristic: Digital Reading Ergonomics"}
            </h1>
          </div>
        </div>

        {/* View Mode Switcher & Toolbar Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode("document")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "document"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Document</span>
            </button>
            <button
              onClick={() => setViewMode("editorial")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "editorial"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Editorial Reader</span>
            </button>
          </div>

          {viewMode === "editorial" && (
            <>
              {/* Zoom controls */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
                <button
                  onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
                  className="p-1 hover:text-[var(--accent)] text-[var(--text-secondary)]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-[var(--text-primary)] px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
                  className="p-1 hover:text-[var(--accent)] text-[var(--text-secondary)]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bookmark toggle */}
              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isCurrentPageBookmarked
                    ? "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent-text)] font-semibold"
                    : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isCurrentPageBookmarked ? (
                  <BookmarkCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isCurrentPageBookmarked ? "Bookmarked" : "Bookmark Page"}
                </span>
              </button>

              {/* Bookmarks Drawer toggle */}
              <button
                onClick={() => setShowBookmarksDrawer(!showBookmarksDrawer)}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Bookmarks ({pdfBookmarks.length})
              </button>
            </>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-xs"
            title="Download Monograph (Institutional Access)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen / Focus Mode */}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-xs"
            title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "document" ? (
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden shadow-lg p-3 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-sm">
                {activeLesson?.title || "Course Monograph"}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                {activeResource?.file_size ? `${(activeResource.file_size / (1024 * 1024)).toFixed(2)} MB` : "Official Document"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent)] text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Open Fullscreen</span>
                </a>
              )}
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="w-full h-[760px] rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[#171715]">
            <iframe
              src={`${pdfUrl || "/docs/sample-monograph.pdf"}#toolbar=1&navpanes=1`}
              className="w-full h-full border-0 bg-white"
              title={activeLesson?.title || "Monograph Document"}
            />
          </div>
        </div>
      ) : (
      /* Reader Layout Grid */
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Main Document Reading Page (Notion / Readwise Editorial Canvas) */}
        <div
          className={`lg:col-span-3 transition-transform origin-top flex flex-col items-center`}
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
        >
          <div className="w-full max-w-3xl rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 sm:p-14 shadow-lg min-h-[700px] flex flex-col justify-between">
            
            {/* Document Header & Page metadata */}
            <div>
              <div className="flex items-center justify-between pb-4 mb-8 border-b border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)]">
                <span>ST. JUDE INSTITUTE · DEPARTMENT OF PRODUCT DESIGN</span>
                <span>MONOGRAPH DES-401 · PAGE {currentPage} OF {totalPages}</span>
              </div>

              {/* Page Title */}
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--text-primary)] mb-6 tracking-tight leading-snug">
                {currentPageData.title}
              </h2>

              {/* Page Body paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-normal">
                {currentPageData.content.map((p, i) => (
                  <p key={i} className="leading-relaxed">
                    {p}
                  </p>
                ))}

                {currentPageData.highlight && (
                  <div className="p-4 rounded-2xl bg-[var(--accent-light)] border-l-4 border-[var(--accent)] text-xs text-[var(--accent-text)] font-medium my-4 italic">
                    💡 Highlighted heuristic: {currentPageData.highlight}
                  </div>
                )}
              </div>
            </div>

            {/* Document Footer with Auto-saved reading state */}
            <div className="pt-8 mt-12 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-mono text-[10px]">
                Auto-saved reading progress: Page {currentPage}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span>{currentPage}</span>
                <span>/</span>
                <span>{totalPages}</span>
              </div>
            </div>

          </div>

          {/* Sticky Bottom Page Navigation Dock */}
          <div className="mt-6 flex items-center gap-3 p-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-md">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-full hover:bg-[var(--bg-primary)] disabled:opacity-30 text-[var(--text-primary)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono px-2 text-[var(--text-primary)] font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-full hover:bg-[var(--bg-primary)] disabled:opacity-30 text-[var(--text-primary)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Bookmarks, Search & Personal Annotations */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-sm space-y-4">
            
            {/* Quick Page Jump */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Jump to Page:
              </label>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = currentPage === pNum;
                  const hasBm = pdfBookmarks.some((b) => b.page_number === pNum);
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`h-7 rounded-lg text-[10px] font-mono font-medium transition-all relative ${
                        isCurrent
                          ? "bg-[var(--accent)] text-white shadow-xs font-bold"
                          : "bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
                      }`}
                    >
                      {pNum}
                      {hasBm && !isCurrent && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Saved Bookmarks List */}
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)]">Saved Bookmarks</span>
                <span className="text-[10px] text-[var(--text-secondary)]">{pdfBookmarks.length} saved</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pdfBookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    onClick={() => setCurrentPage(bm.page_number)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      currentPage === bm.page_number
                        ? "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent-text)]"
                        : "bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[var(--accent)]/30 text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>Page {bm.page_number}</span>
                      <BookmarkCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                    </div>
                    {bm.note && (
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                        {bm.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add note on current page */}
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Page {currentPage} Marginal Note:
              </label>
              <textarea
                rows={2}
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                placeholder="Attach personal note to this page..."
                className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <button
                onClick={toggleBookmark}
                className="w-full py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-xs transition-all"
              >
                {isCurrentPageBookmarked ? "Update Note" : `Bookmark Page ${currentPage} with Note`}
              </button>
            </div>

          </div>
        </div>

      </div>
      )}
    </div>
  );
}

export default function PdfReadingEnvironmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--text-secondary)]">Loading monograph...</div>}>
      <PdfReadingContent params={params} />
    </Suspense>
  );
}
