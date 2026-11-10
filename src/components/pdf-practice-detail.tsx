"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Heart, Cloud, Download, X, ExternalLink, Check, FileText } from "lucide-react";
import { useMaterials } from "@/lib/hooks";

export interface PdfSession {
  id: string;
  title: string;
  duration: string;
  url?: string;
  size?: string;
  opened?: boolean;
}

const DEFAULT_PDF_SESSIONS: PdfSession[] = [
  {
    id: "pdf-1",
    title: "Paper 8: Cost Accounting – Marginal Costing & CVP Analysis",
    duration: "14 Min",
    size: "4.2 MB",
    opened: true,
  },
  {
    id: "pdf-2",
    title: "Paper 6: Financial Accounting – Consignment Accounts & Stock",
    duration: "10 Min",
    size: "3.8 MB",
    opened: true,
  },
  {
    id: "pdf-3",
    title: "Paper 7: Direct & Indirect Taxation – Capital Gains & GST Rates",
    duration: "12 Min",
    size: "5.1 MB",
    opened: true,
  },
  {
    id: "pdf-4",
    title: "Paper 5: Business Laws & Ethics – Companies Act 2013",
    duration: "11 Min",
    size: "4.6 MB",
    opened: false,
  },
  {
    id: "pdf-5",
    title: "ICMAI Official MQP: Model Question Papers (Syllabus 2022)",
    duration: "45 Min",
    size: "Official Portal",
    url: "https://icmai.in/ClntStudents/ClntMQPList?menuId=1",
    opened: false,
  },
  {
    id: "pdf-6",
    title: "ICMAI Previous Examination Papers: Term-wise Question Bank",
    duration: "60 Min",
    size: "Official Archive",
    url: "https://icmai.in/ClntStudents/ClntQuestionPaperList?menuId=1",
    opened: false,
  },
  {
    id: "pdf-7",
    title: "ICMAI Official Curriculum 2022: Complete Paper Blueprint",
    duration: "25 Min",
    size: "12.4 MB",
    url: "https://www.icmai.in/upload/Students/Syllabus2022/Curriculum_2022.pdf",
    opened: false,
  },
  {
    id: "pdf-8",
    title: "CMA Prospectus 2025: Official Regulations & Examination Guide",
    duration: "30 Min",
    size: "16.8 MB",
    url: "https://icmai.co.in/upload/Students/Syllabus2022/CMA_Prospectus_Syllabus_2022.pdf",
    opened: false,
  },
];

interface PdfPracticeDetailProps {
  onBack: () => void;
}

export function PdfPracticeDetail({ onBack }: PdfPracticeDetailProps) {
  const { items: uploadedFiles } = useMaterials();
  const [downloadAll, setDownloadAll] = useState(true);
  const [isFavorite, setIsFavorite] = useState(true);
  const [openedIds, setOpenedIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("cma_opened_pdfs");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return { "pdf-1": true, "pdf-2": true, "pdf-3": true };
  });

  const [activePdf, setActivePdf] = useState<PdfSession | null>(null);

  // Sync opened state to localStorage
  const markPdfOpened = (session: PdfSession) => {
    setOpenedIds((prev) => {
      const updated = { ...prev, [session.id]: true };
      try {
        localStorage.setItem("cma_opened_pdfs", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActivePdf(session);
  };

  // Combine uploaded materials from database with default sessions
  const sessions: PdfSession[] = React.useMemo(() => {
    const list: PdfSession[] = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadedFiles
        .filter((f) => f.type === "pdf")
        .forEach((f, idx) => {
          list.push({
            id: f.id,
            title: f.title,
            duration: `${Math.max(8, Math.round(f.size / (1024 * 1024) * 3))} Min`,
            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
            url: f.url,
            opened: !!openedIds[f.id],
          });
        });
    }

    DEFAULT_PDF_SESSIONS.forEach((item) => {
      if (!list.some((existing) => existing.id === item.id)) {
        list.push({
          ...item,
          opened: !!openedIds[item.id],
        });
      }
    });

    return list;
  }, [uploadedFiles, openedIds]);

  const completedCount = sessions.filter((s) => openedIds[s.id]).length;
  const progressPct = Math.round((completedCount / (sessions.length || 1)) * 100);

  return (
    <div className="max-w-xl mx-auto w-full select-none pb-16 space-y-4">
      {/* =============================================================== */}
      {/* TOP HERO CONTAINER (Pastel Cream matching reference)           */}
      {/* =============================================================== */}
      <div className="rounded-[32px] bg-[#F7EFE4] border border-[#EBE0D2] p-6 sm:p-7 relative overflow-hidden shadow-xs space-y-5">
        {/* Top Action Bar: Back & Favorite */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-[#18181B] transition-colors cursor-pointer shadow-2xs"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Favorite"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? "fill-[#EF4444] text-[#EF4444]"
                  : "text-[#88867E] hover:text-[#18181B]"
              }`}
            />
          </button>
        </div>

        {/* Hero Row: Title, Progress & Calm Student Illustration */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#18181B] tracking-tight">
                PDF Practice
              </h1>
              <p className="text-[11px] font-mono font-semibold tracking-wider text-[#6B5A4E]/80 mt-1 uppercase">
                {sessions.length} SESSIONS
              </p>
            </div>

            {/* Progress Bar & Percentage */}
            <div className="space-y-1.5 max-w-[200px]">
              <div className="text-xs font-mono font-medium text-[#4B5563]">
                {progressPct}% Done
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1E293B] transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Downloaded Editorial Illustration (Reading Bench from user's pack) */}
          <div className="w-28 sm:w-36 shrink-0 flex items-center justify-center">
            <img
              src="/illustrations/reading-bench.svg"
              alt="PDF Practice"
              className="max-h-28 sm:max-h-32 w-auto object-contain"
            />
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-xs sm:text-[13px] text-[#4A4742] leading-relaxed font-absans">
          Gain profound insight into the core CMA syllabus through structured chapter notes,
          formula sheets, and exam-oriented problem-solving frameworks.
        </p>

        {/* Download All Sessions Toggle Bar */}
        <div className="pt-2 border-t border-[#EDE1D2] flex items-center justify-between">
          <div>
            <div className="text-xs font-serif font-bold text-[#18181B]">
              Download all sessions
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#78716C] mt-0.5">
              <Cloud className="w-3.5 h-3.5" />
              <span>25MB</span>
            </div>
          </div>

          {/* iOS Style Toggle Switch with checkmark */}
          <button
            onClick={() => setDownloadAll(!downloadAll)}
            className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center cursor-pointer ${
              downloadAll ? "bg-[#334155]" : "bg-[#D6CEBF]"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-200 ease-in-out ${
                downloadAll ? "translate-x-5 text-[#334155]" : "translate-x-0 text-transparent"
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>
        </div>
      </div>

      {/* =============================================================== */}
      {/* SESSIONS LIST: Shows all uploaded PDFs with checkmark on open   */}
      {/* =============================================================== */}
      <div className="rounded-[28px] bg-white border border-[#EBE8E1] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-[#F2EFE9]">
        {sessions.map((session, index) => {
          const isOpened = !!openedIds[session.id];

          return (
            <div
              key={session.id}
              onClick={() => markPdfOpened(session)}
              className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors cursor-pointer group"
            >
              {/* Left Side: Checkmark or Number Badge + Title */}
              <div className="flex items-center gap-3.5 min-w-0 pr-3">
                {isOpened ? (
                  // Opened / Completed Badge: Beige squircle circle with tick mark ✓
                  <div className="w-7 h-7 rounded-full bg-[#F5EBDD] border border-[#EADCCB] text-[#8C6D4C] flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                ) : (
                  // Unopened Number Badge: Clean border with digit
                  <div className="w-7 h-7 rounded-full border border-[#DCD6C9] text-[#71717A] group-hover:border-[#18181B] group-hover:text-[#18181B] flex items-center justify-center font-mono text-xs font-semibold shrink-0 transition-colors">
                    {index + 1}
                  </div>
                )}

                <div className="truncate">
                  <div
                    className={`font-serif text-sm font-semibold truncate transition-colors ${
                      isOpened
                        ? "text-[#18181B]"
                        : "text-[#27272A] group-hover:text-black"
                    }`}
                  >
                    {session.title}
                  </div>
                  {session.size && (
                    <div className="text-[10px] font-mono text-[#A1A1AA]">
                      {session.size}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Duration / Pages */}
              <div className="text-xs font-mono font-medium text-[#71717A] shrink-0 group-hover:text-[#18181B] transition-colors">
                {session.duration}
              </div>
            </div>
          );
        })}
      </div>

      {/* =============================================================== */}
      {/* PDF VIEWER / SESSION MODAL (Triggered when clicking any PDF)     */}
      {/* =============================================================== */}
      {activePdf && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#EBE8E1] p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F7EFE4] text-[#8C6D4C] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[#059669] bg-[#EAF7EE] px-2 py-0.5 rounded-full font-semibold border border-[#D1F2DD]">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Opened &amp; Progress Updated</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#18181B] mt-1">
                    {activePdf.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActivePdf(null)}
                className="p-1.5 rounded-full text-[#88867E] hover:text-[#111110] hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#71717A] font-mono">
                <span>Reading Estimate: {activePdf.duration}</span>
                <span>Format: PDF Document</span>
              </div>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Contains verified syllabus theory notes, formula reference tables, and
                illustrative solved questions for CMA Intermediate Group 1.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              {activePdf.url ? (
                <a
                  href={activePdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-[#18181B] text-white hover:bg-black font-apfel font-semibold text-xs tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Open Full PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => setActivePdf(null)}
                  className="flex-1 py-3 rounded-xl bg-[#18181B] text-white hover:bg-black font-apfel font-semibold text-xs tracking-wide uppercase cursor-pointer transition-colors"
                >
                  Continue Reading
                </button>
              )}

              <button
                onClick={() => setActivePdf(null)}
                className="px-4 py-3 rounded-xl border border-[#EBE8E1] text-[#666560] hover:text-[#111110] hover:bg-gray-50 text-xs font-medium cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
