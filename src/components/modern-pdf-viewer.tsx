"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  BookOpen,
  Highlighter,
  Check,
  CheckCircle2,
  FileText,
  Bookmark,
  Sun,
  Moon,
  Coffee,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  Edit3,
} from "lucide-react";

export interface PdfDocument {
  id: string;
  title: string;
  subject?: string;
  paperCode?: string;
  pages?: number | string;
  size?: string;
  url?: string;
}

interface ModernPdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: PdfDocument | null;
  onMarkCompleted?: (docId: string) => void;
  isCompleted?: boolean;
}

type ReaderTheme = "day" | "sepia" | "night";

export function ModernPdfViewer({
  isOpen,
  onClose,
  document,
  onMarkCompleted,
  isCompleted = false,
}: ModernPdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(28);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [theme, setTheme] = useState<ReaderTheme>("day");
  const [showSidebar, setShowSidebar] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"toc" | "notes" | "formulas">("toc");
  const [completed, setCompleted] = useState(isCompleted);

  useEffect(() => {
    if (!document) return;
    setCompleted(isCompleted);
    // Parse total pages if available
    if (typeof document.pages === "number") {
      setTotalPages(document.pages);
    } else if (typeof document.pages === "string") {
      const match = document.pages.match(/\d+/);
      if (match) setTotalPages(parseInt(match[0], 10));
    }
    // Load student notes for this PDF
    try {
      const savedNotes = localStorage.getItem(`cma_notes_${document.id}`);
      if (savedNotes) setUserNotes(savedNotes);
      else setUserNotes("");
    } catch {}
    setCurrentPage(1);
  }, [document, isCompleted]);

  const saveNotes = (val: string) => {
    setUserNotes(val);
    if (!document) return;
    try {
      localStorage.setItem(`cma_notes_${document.id}`, val);
    } catch {}
  };

  const handleToggleComplete = () => {
    if (!document) return;
    const newState = !completed;
    setCompleted(newState);
    if (newState && onMarkCompleted) {
      onMarkCompleted(document.id);
    }
  };

  if (!isOpen || !document) return null;

  const themeStyles = {
    day: {
      bg: "bg-[#F8F7F3]",
      pageBg: "bg-white text-[#111110] border-[#E8E5DD]",
      headerBg: "bg-white/95 border-[#EBE8E1] text-[#111110]",
      toolbarBg: "bg-white border-[#EBE8E1] text-[#111110]",
      subtext: "text-[#71717A]",
    },
    sepia: {
      bg: "bg-[#F5EFE6]",
      pageBg: "bg-[#FAF4EC] text-[#2C241B] border-[#E8DEC8]",
      headerBg: "bg-[#F3E9DA]/95 border-[#E6DAC4] text-[#2C241B]",
      toolbarBg: "bg-[#FAF4EC] border-[#E6DAC4] text-[#2C241B]",
      subtext: "text-[#7A6A55]",
    },
    night: {
      bg: "bg-[#09090B]",
      pageBg: "bg-[#18181B] text-[#EDEDED] border-[#27272A]",
      headerBg: "bg-[#18181B]/95 border-[#27272A] text-white",
      toolbarBg: "bg-[#27272A] border-[#3F3F46] text-white",
      subtext: "text-[#A1A1AA]",
    },
  }[theme];

  const hasDirectPdf =
    document.url &&
    (document.url.endsWith(".pdf") ||
      document.url.includes("blob:") ||
      document.url.includes("upload/Students"));

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${themeStyles.bg} transition-colors duration-200 animate-in fade-in select-none`}
    >
      {/* =============================================================== */}
      {/* TOP APP HEADER: Document details, Zoom, Themes, Close           */}
      {/* =============================================================== */}
      <header
        className={`h-16 px-4 sm:px-6 border-b ${themeStyles.headerBg} backdrop-blur-md flex items-center justify-between shrink-0 shadow-2xs z-20`}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-current/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to App"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tabular-nums font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                {document.paperCode || "Paper 8"}
              </span>
              <h2 className="font-apfel font-bold text-sm sm:text-base truncate leading-snug">
                {document.title}
              </h2>
            </div>
            <div className={`text-[11px] tabular-nums ${themeStyles.subtext} truncate`}>
              {document.subject || "CMA Intermediate"} • Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        {/* Center: Page Jump and Zoom Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Page Navigator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-2xl border ${themeStyles.toolbarBg} text-xs tabular-nums shadow-2xs`}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Level */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-2xl border ${themeStyles.toolbarBg} text-xs tabular-nums shadow-2xs`}>
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-semibold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Theme Switcher, Notes Drawer, Mark Done, Close */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggles */}
          <div className={`flex items-center p-0.5 rounded-2xl border ${themeStyles.toolbarBg} shadow-2xs`}>
            <button
              onClick={() => setTheme("day")}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                theme === "day" ? "bg-black/10 dark:bg-white/20 font-bold" : "text-[#71717A]"
              }`}
              title="Day Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("sepia")}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                theme === "sepia" ? "bg-[#D9C4A5] text-[#2C241B] font-bold" : "text-[#71717A]"
              }`}
              title="Sepia Focus (Eye Comfort)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("night")}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                theme === "night" ? "bg-white text-black font-bold" : "text-[#71717A]"
              }`}
              title="Night Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notes / Syllabus Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold font-apfel flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors ${
              showSidebar ? "bg-[#111110] text-white" : themeStyles.toolbarBg
            }`}
            title="Study Notes & Table of Contents"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* Mark As Read */}
          <button
            onClick={handleToggleComplete}
            className={`px-3 py-1.5 rounded-2xl text-xs font-semibold font-apfel flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all ${
              completed
                ? "bg-[#10B981] text-white shadow-xs"
                : "bg-white border border-[#EBE8E1] text-[#111110] hover:bg-gray-50"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">{completed ? "Completed" : "Mark Done"}</span>
          </button>

          {/* Close Fullscreen Reader */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-current/15 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
            title="Close Reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =============================================================== */}
      {/* MAIN BODY: Reading Area + Collapsible Study Tools Sidebar       */}
      {/* =============================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Document Reading Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <div
            className="w-full max-w-3xl flex-1 flex flex-col transition-all duration-300"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          >
            {hasDirectPdf ? (
              // Embedded In-App PDF View Frame (Modern Native Iframe without browser clutter)
              <div className="w-full h-[82vh] rounded-[24px] overflow-hidden border shadow-lg bg-white relative">
                <iframe
                  src={`${document.url}#toolbar=0&navpanes=0`}
                  title={document.title}
                  className="w-full h-full border-none"
                />
              </div>
            ) : (
              // High-Fidelity Modern CMA Interactive Digital Reader
              <div
                className={`w-full min-h-[82vh] rounded-[28px] border p-8 sm:p-12 shadow-sm space-y-6 ${themeStyles.pageBg}`}
              >
                {/* Book Page Header */}
                <div className="flex items-center justify-between pb-4 border-b border-current/10">
                  <div className="space-y-0.5">
                    <span className="text-[10px] tabular-nums uppercase tracking-widest text-emerald-600 font-bold">
                      ICMAI CMA Intermediate Syllabus 2022
                    </span>
                    <h1 className="font-apfel font-bold text-xl sm:text-2xl tracking-tight">
                      {document.title}
                    </h1>
                  </div>
                  <div className="text-right text-xs tabular-nums opacity-60">
                    <div>Page {currentPage}</div>
                    <div>CMA Module 8.2</div>
                  </div>
                </div>

                {/* Chapter Abstract & Learning Target */}
                <div className="p-4 rounded-2xl bg-current/5 border border-current/10 space-y-2 text-xs">
                  <div className="font-apfel font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Learning Objectives &amp; Exam Weightage (25 Marks)</span>
                  </div>
                  <p className="opacity-80 leading-relaxed font-absans">
                    Understanding Cost-Volume-Profit (CVP) relations, determining Break-Even Point (BEP) in units and monetary value, Margin of Safety (MOS), and optimal managerial decision-making under limiting factor constraints.
                  </p>
                </div>

                {/* Section 1: Core Formula Matrix */}
                <div className="space-y-3">
                  <h3 className="font-apfel font-bold text-base">
                    1. Fundamental Formula Deconstruction
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs tabular-nums">
                    <div className="p-3.5 rounded-xl border border-current/15 bg-current/5 space-y-1">
                      <div className="font-bold text-emerald-600">Contribution per Unit</div>
                      <div>= Selling Price (SP) - Variable Cost (VC)</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-current/15 bg-current/5 space-y-1">
                      <div className="font-bold text-emerald-600">Profit-Volume (P/V) Ratio</div>
                      <div>= (Contribution / Sales) × 100</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-current/15 bg-current/5 space-y-1">
                      <div className="font-bold text-emerald-600">Break-Even Point (Units)</div>
                      <div>= Fixed Costs / Contribution per unit</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-current/15 bg-current/5 space-y-1">
                      <div className="font-bold text-emerald-600">Margin of Safety (Value)</div>
                      <div>= Total Sales - Break-Even Sales</div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Comprehensive Solved Illustration */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-apfel font-bold text-base flex items-center justify-between">
                    <span>2. Illustrative Problem (ICMAI Term Exam Model)</span>
                    <span className="text-[11px] tabular-nums text-emerald-600 font-normal">
                      Expected 8 Marks
                    </span>
                  </h3>

                  <div className="p-4 rounded-2xl border border-current/15 bg-current/5 space-y-3 text-xs leading-relaxed">
                    <p className="font-medium">
                      <strong>Problem Statement:</strong> A manufacturing firm produces an industrial component with selling price of ₹100 per unit, variable cost of ₹60 per unit, and annual fixed costs amounting to ₹4,00,000. Expected sales volume is 15,000 units.
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <div className="font-bold tabular-nums text-emerald-700">Step-by-Step Solution:</div>
                      <ol className="list-decimal pl-5 space-y-1 tabular-nums text-[11px] opacity-90">
                        <li>Contribution per unit = ₹100 - ₹60 = <strong>₹40</strong></li>
                        <li>P/V Ratio = (₹40 / ₹100) × 100 = <strong>40%</strong></li>
                        <li>BEP in Units = ₹4,00,000 / ₹40 = <strong>10,000 Units</strong></li>
                        <li>BEP in Sales Value = 10,000 × ₹100 = <strong>₹10,00,000</strong></li>
                        <li>Margin of Safety (Units) = 15,000 - 10,000 = <strong>5,000 Units</strong></li>
                        <li>Net Profit = (5,000 units × ₹40) = <strong>₹2,00,000</strong></li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Section 3: Examiner Note & Common Traps */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
                  <div className="font-apfel font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span>⚠️ ICMAI Examiner Marking Caution</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    Always state the formula before substituting values. Step marks are awarded for intermediate contribution and P/V ratio calculations even if the final unit volume has rounding discrepancies.
                  </p>
                </div>

                {/* Page Footer Navigation */}
                <div className="pt-6 border-t border-current/10 flex items-center justify-between text-xs tabular-nums opacity-70">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 hover:opacity-100 disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Topic</span>
                  </button>

                  <span>End of Chapter Note</span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 hover:opacity-100 disabled:opacity-20 cursor-pointer"
                  >
                    <span>Next Topic</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* =============================================================== */}
        {/* COLLAPSIBLE SIDEBAR: Study Notes, Table of Contents, Formulas   */}
        {/* =============================================================== */}
        {showSidebar && (
          <aside
            className={`w-80 sm:w-96 border-l ${themeStyles.headerBg} flex flex-col shrink-0 animate-in slide-in-from-right duration-200 shadow-xl z-20`}
          >
            {/* Sidebar Tabs */}
            <div className="p-3 border-b border-current/10 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[
                  { id: "toc", label: "Index" },
                  { id: "notes", label: "My Notes ✍️" },
                  { id: "formulas", label: "Formulas" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-apfel font-bold transition-all cursor-pointer ${
                      activeTab === t.id
                        ? "bg-black/10 dark:bg-white/20 text-current"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {activeTab === "toc" && (
                <div className="space-y-2">
                  <h4 className="font-apfel font-bold text-xs uppercase tracking-wider opacity-60">
                    Syllabus Chapters
                  </h4>
                  {[
                    { page: 1, title: "1. Marginal Costing Fundamentals & CVP" },
                    { page: 4, title: "2. Break-Even Calculations & Graphical Analysis" },
                    { page: 8, title: "3. Margin of Safety & Angle of Incidence" },
                    { page: 14, title: "4. Limiting Factor & Product Mix Optimization" },
                    { page: 20, title: "5. Make or Buy & Shutdown Decisions" },
                    { page: 26, title: "6. Solved Past Examination Questions" },
                  ].map((item) => (
                    <div
                      key={item.page}
                      onClick={() => setCurrentPage(item.page)}
                      className="p-3 rounded-xl border border-current/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium pr-2 truncate">{item.title}</span>
                      <span className="tabular-nums text-[10px] opacity-60 shrink-0">
                        p. {item.page}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-3 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <h4 className="font-apfel font-bold text-xs uppercase tracking-wider opacity-60">
                      Personal Revision Notes
                    </h4>
                    <span className="text-[10px] tabular-nums text-emerald-600 font-semibold">
                      Auto-saved
                    </span>
                  </div>
                  <textarea
                    value={userNotes}
                    onChange={(e) => saveNotes(e.target.value)}
                    placeholder="Type key formulas, doubts to ask faculty, or page bookmarks here..."
                    className="w-full flex-1 min-h-[300px] p-3 rounded-2xl bg-current/5 border border-current/15 text-xs outline-none resize-none font-absans leading-relaxed focus:border-emerald-500"
                  />
                  <p className="text-[10px] opacity-60">
                    Notes remain saved in your student profile across sessions.
                  </p>
                </div>
              )}

              {activeTab === "formulas" && (
                <div className="space-y-2.5 tabular-nums text-[11px]">
                  <h4 className="font-apfel font-bold text-xs uppercase tracking-wider opacity-60">
                    Quick Exam Formulas
                  </h4>
                  <div className="p-3 rounded-xl border border-current/10 bg-current/5 space-y-1">
                    <div className="font-bold text-emerald-600">P/V Ratio</div>
                    <div>= Change in Profit / Change in Sales</div>
                  </div>
                  <div className="p-3 rounded-xl border border-current/10 bg-current/5 space-y-1">
                    <div className="font-bold text-emerald-600">Required Sales</div>
                    <div>= (Fixed Cost + Target Profit) / P/V Ratio</div>
                  </div>
                  <div className="p-3 rounded-xl border border-current/10 bg-current/5 space-y-1">
                    <div className="font-bold text-emerald-600">MOS Ratio</div>
                    <div>= Profit / Total Contribution</div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* =============================================================== */}
      {/* BOTTOM STATUS BAR: Progress gauge and mobile controls          */}
      {/* =============================================================== */}
      <footer
        className={`h-11 px-6 border-t ${themeStyles.headerBg} flex items-center justify-between text-xs tabular-nums ${themeStyles.subtext} shrink-0 z-10`}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>In-App Modern Reader</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Press Esc or Back to exit</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>{Math.round((currentPage / totalPages) * 100)}% Read</span>
            <div className="w-20 h-1.5 rounded-full bg-current/10 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
