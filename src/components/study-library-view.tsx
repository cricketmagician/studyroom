"use client";

import React, { useState } from "react";
import { Search, ArrowLeft, Download, FileText, ExternalLink, Bookmark, Filter, Check } from "lucide-react";
import { useMaterials } from "@/lib/hooks";

interface LibraryBook {
  id: string;
  title: string;
  subject: string;
  pages: number;
  size: string;
  downloadUrl?: string;
  isBookmarked?: boolean;
}

const CURATED_CMA_LIBRARY: LibraryBook[] = [
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
            subject: "Uploaded Notes",
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

      {/* Subject Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {["All", "Cost Accounting", "Financial Accounting", "Direct Taxation", "Business Laws"].map((sub) => {
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
                <div className="w-11 h-11 rounded-2xl bg-[#F4EFFE] text-[#8B5CF6] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EFECE6] text-[#71717A]">
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
                <div className="flex items-center gap-3 text-[11px] font-mono text-[#88867E]">
                  <span>{book.pages} Pages</span>
                  <span>•</span>
                  <span>{book.size}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F5F3ED] flex items-center justify-between text-xs font-semibold text-[#059669]">
                <span>Read &amp; Annotate</span>
                <span className="w-7 h-7 rounded-full bg-[#EAF7EE] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* PDF Reader Preview Dialog */}
      {activePdf && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[#EBE8E1] p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F4EFFE] text-[#8B5CF6] flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#8B5CF6] bg-[#F4EFFE] px-2.5 py-0.5 rounded-full">
                    {activePdf.subject}
                  </span>
                  <h3 className="font-apfel font-bold text-base text-[#111110] mt-1 line-clamp-2">
                    {activePdf.title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-[#71717A]">
                <span>Document Length: {activePdf.pages} Pages</span>
                <span>Size: {activePdf.size}</span>
              </div>
              <p className="text-[#52525B] leading-relaxed">
                Structured for CMA Intermediate examinations. Includes complete concept summaries, illustrative problems, and suggested step answers.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {activePdf.downloadUrl ? (
                <a
                  href={activePdf.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-[#111110] text-white hover:bg-black font-apfel font-semibold text-xs tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open PDF in Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => setActivePdf(null)}
                  className="flex-1 py-3 rounded-xl bg-[#111110] text-white hover:bg-black font-apfel font-semibold text-xs tracking-wide uppercase cursor-pointer"
                >
                  Start Reading
                </button>
              )}

              <button
                onClick={() => setActivePdf(null)}
                className="px-5 py-3 rounded-xl border border-[#EBE8E1] text-[#666560] hover:text-[#111110] text-xs font-medium cursor-pointer"
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
