"use client";

import React, { useState } from "react";
import { Search, ArrowLeft, Download, FileText, ExternalLink, Bookmark, Filter, Check } from "lucide-react";
import { useMaterials } from "@/lib/hooks";
import { ModernPdfViewer } from "@/components/modern-pdf-viewer";

interface LibraryBook {
  id: string;
  title: string;
  subject: string;
  pages: number;
  size: string;
  downloadUrl?: string;
  isBookmarked?: boolean;
  isOfficial?: boolean;
}

const CURATED_CMA_LIBRARY: LibraryBook[] = [
  {
    id: "icmai-curr-2022",
    title: "CMA Syllabus 2022 – Official ICMAI Curriculum",
    subject: "Official ICMAI",
    pages: 148,
    size: "12.4 MB",
    downloadUrl: "https://www.icmai.in/upload/Students/Syllabus2022/Curriculum_2022.pdf",
    isOfficial: true,
  },
  {
    id: "icmai-prospectus-2025",
    title: "CMA Prospectus – 2025 Official Guide",
    subject: "Official ICMAI",
    pages: 180,
    size: "16.8 MB",
    downloadUrl: "https://icmai.co.in/upload/Students/Syllabus2022/CMA_Prospectus_Syllabus_2022.pdf",
    isOfficial: true,
  },
  {
    id: "icmai-mqp-portal",
    title: "Official Model Question Papers (MQP) – All Terms",
    subject: "Official ICMAI",
    pages: 64,
    size: "ICMAI Portal",
    downloadUrl: "https://icmai.in/ClntStudents/ClntMQPList?menuId=1",
    isOfficial: true,
  },
  {
    id: "icmai-past-papers",
    title: "Previous Examination Papers – Term-wise Archive",
    subject: "Official ICMAI",
    pages: 92,
    size: "ICMAI Portal",
    downloadUrl: "https://icmai.in/ClntStudents/ClntQuestionPaperList?menuId=1",
    isOfficial: true,
  },
  {
    id: "lib-1",
    title: "CMA Inter Group 1: Cost Accounting Study Material 2026",
    subject: "Cost Accounting",
    pages: 420,
    size: "18.4 MB",
  },
  {
    id: "lib-2",
    title: "Marginal Costing & CVP Decision Matrix Handbook",
    subject: "Cost Accounting",
    pages: 86,
    size: "4.2 MB",
  },
  {
    id: "lib-3",
    title: "Financial Accounting Comprehensive Guide (ICMAI)",
    subject: "Financial Accounting",
    pages: 510,
    size: "24.1 MB",
  },
  {
    id: "lib-4",
    title: "Accounting for Special Transactions & Consignments",
    subject: "Financial Accounting",
    pages: 112,
    size: "6.8 MB",
  },
  {
    id: "lib-5",
    title: "Direct Taxation: Master Formula & Case Law Digest",
    subject: "Direct Taxation",
    pages: 280,
    size: "12.5 MB",
  },
  {
    id: "lib-6",
    title: "Capital Gains & Deductions Under Chapter VI-A Ready Reckoner",
    subject: "Direct Taxation",
    pages: 94,
    size: "5.1 MB",
  },
  {
    id: "lib-7",
    title: "Corporate Laws: Companies Act 2013 Chapter-wise Commentary",
    subject: "Business Laws",
    pages: 340,
    size: "15.8 MB",
  },
  {
    id: "lib-8",
    title: "Commercial Laws & Negotiable Instruments Act 1881",
    subject: "Business Laws",
    pages: 120,
    size: "7.2 MB",
  },
];

export function StudyLibraryView({ onBack }: { onBack?: () => void }) {
  const { items: uploadedMaterials } = useMaterials();
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({ "lib-1": true, "lib-3": true });
  const [activePdf, setActivePdf] = useState<LibraryBook | null>(null);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allBooks: LibraryBook[] = React.useMemo(() => {
    const list: LibraryBook[] = [];
    if (uploadedMaterials && uploadedMaterials.length > 0) {
      uploadedMaterials
        .filter((m) => m.type === "pdf")
        .forEach((m) => {
          list.push({
            id: m.id,
            title: m.title,
            subject: m.subject || "Cost Accounting",
            pages: Math.max(12, Math.round(m.size / (1024 * 100))),
            size: `${(m.size / (1024 * 1024)).toFixed(1)} MB`,
            downloadUrl: m.url,
          });
        });
    }
    return [...list, ...CURATED_CMA_LIBRARY];
  }, [uploadedMaterials]);

  const filtered = allBooks.filter((b) => {
    const matchesSub = selectedSubject === "All" || b.subject === selectedSubject;
    const matchesSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.subject.toLowerCase().includes(search.toLowerCase());
    return matchesSub && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full select-none pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white border border-[#EBE8E1] hover:bg-gray-50 flex items-center justify-center text-[#111110] transition-colors cursor-pointer shadow-2xs"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-apfel font-bold text-[#111110] tracking-tight">
              Study Library
            </h1>
            <p className="text-xs text-[#71717A]">
              Official ICMAI syllabus books, revision notes, and question banks
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#EBE8E1] shadow-2xs text-xs w-full sm:w-72">
          <Search className="w-4 h-4 text-[#AAA79E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, notes, topics..."
            className="bg-transparent border-none outline-none text-xs text-[#111110] placeholder-[#AAA79E] w-full"
          />
        </div>
      </div>

      {/* Official ICMAI Quick Access Banner */}
      <div className="p-5 rounded-[26px] bg-gradient-to-r from-[#18181B] via-[#232326] to-[#18181B] text-white space-y-3.5 shadow-sm border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-apfel font-bold text-sm tracking-wide text-white">
              Official ICMAI Curriculum &amp; Examination Portals (Syllabus 2022)
            </h2>
          </div>
          <span className="text-[10px] tabular-nums text-zinc-400">Verified Direct Institute Links</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <a
            href="https://www.icmai.in/upload/Students/Syllabus2022/Curriculum_2022.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex flex-col justify-between group"
          >
            <span className="font-apfel font-semibold text-white group-hover:text-emerald-300">
              Syllabus 2022 PDF
            </span>
            <span className="text-[10px] tabular-nums text-zinc-400 mt-1 flex items-center justify-between">
              Curriculum <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-emerald-300" />
            </span>
          </a>

          <a
            href="https://icmai.co.in/upload/Students/Syllabus2022/CMA_Prospectus_Syllabus_2022.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex flex-col justify-between group"
          >
            <span className="font-apfel font-semibold text-white group-hover:text-emerald-300">
              Prospectus 2025
            </span>
            <span className="text-[10px] tabular-nums text-zinc-400 mt-1 flex items-center justify-between">
              Official Guide <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-emerald-300" />
            </span>
          </a>

          <a
            href="https://icmai.in/ClntStudents/ClntMQPList?menuId=1"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex flex-col justify-between group"
          >
            <span className="font-apfel font-semibold text-white group-hover:text-emerald-300">
              Model Question Papers
            </span>
            <span className="text-[10px] tabular-nums text-zinc-400 mt-1 flex items-center justify-between">
              MQPs List <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-emerald-300" />
            </span>
          </a>

          <a
            href="https://icmai.in/ClntStudents/ClntQuestionPaperList?menuId=1"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex flex-col justify-between group"
          >
            <span className="font-apfel font-semibold text-white group-hover:text-emerald-300">
              Past Exam Papers
            </span>
            <span className="text-[10px] tabular-nums text-zinc-400 mt-1 flex items-center justify-between">
              Term Archive <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-emerald-300" />
            </span>
          </a>
        </div>
      </div>

      {/* Subject Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {["All", "Official ICMAI", "Cost Accounting", "Financial Accounting", "Direct Taxation", "Business Laws"].map((sub) => {
          const active = selectedSubject === sub;
          return (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-[#111110] text-white shadow-xs font-semibold"
                  : "bg-white text-[#666560] border border-[#EBE8E1] hover:text-[#111110]"
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((book) => {
          const isSaved = !!bookmarked[book.id];
          return (
            <div
              key={book.id}
              onClick={() => setActivePdf(book)}
              className="p-5 rounded-[26px] bg-white border border-[#EBE8E1] hover:border-[#D0CABE] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    book.isOfficial
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-[#F4EFFE] text-[#8B5CF6]"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] tabular-nums font-semibold px-2.5 py-0.5 rounded-full border ${
                      book.isOfficial
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-[#FAF9F5] border-[#EFECE6] text-[#71717A]"
                    }`}
                  >
                    {book.subject}
                  </span>
                  <button
                    onClick={(e) => toggleBookmark(book.id, e)}
                    className="p-1 rounded-full text-[#AAA79E] hover:text-[#8B5CF6] transition-colors cursor-pointer"
                    title="Bookmark"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#8B5CF6] text-[#8B5CF6]" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-apfel font-bold text-sm text-[#111110] group-hover:text-black line-clamp-2 leading-snug">
                  {book.title}
                </h3>
                <div className="flex items-center gap-3 text-[11px] tabular-nums text-[#88867E]">
                  <span>{book.pages} Pages</span>
                  <span>•</span>
                  <span>{book.size}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F5F3ED] flex items-center justify-between text-xs font-semibold text-[#059669]">
                <span>{book.downloadUrl ? "Open Official Resource" : "Read & Annotate"}</span>
                <span className="w-7 h-7 rounded-full bg-[#EAF7EE] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern In-App Fullscreen PDF Viewer */}
      <ModernPdfViewer
        isOpen={!!activePdf}
        onClose={() => setActivePdf(null)}
        document={
          activePdf
            ? {
                id: activePdf.id,
                title: activePdf.title,
                subject: activePdf.subject,
                paperCode: activePdf.isOfficial ? "Official" : "Paper 8",
                pages: activePdf.pages,
                size: activePdf.size,
                url: activePdf.downloadUrl,
              }
            : null
        }
      />
    </div>
  );
}
