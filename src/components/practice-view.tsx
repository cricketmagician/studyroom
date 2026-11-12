"use client";

import React, { useState } from "react";
import { Search, MoreVertical, Heart, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { PdfPracticeDetail } from "@/components/pdf-practice-detail";

interface PracticeCard {
  id: string;
  type: "pdf" | "video";
  title: string;
  sessions: string;
  progress: number;
  bgPastel: string;
  borderColor: string;
  illustrationPath: string;
  isFavorite?: boolean;
}

export function PracticeView({ onBack }: { onBack?: () => void }) {
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    pdf: true,
  });
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [viewingDetail, setViewingDetail] = useState<"pdf" | null>(null);

  if (viewingDetail === "pdf") {
    return <PdfPracticeDetail onBack={() => setViewingDetail(null)} />;
  }

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const cards: PracticeCard[] = [
    {
      id: "pdf",
      type: "pdf",
      title: "PDF Practice",
      sessions: "12 SESSIONS",
      progress: 25,
      bgPastel: "#F6EFE5",
      borderColor: "#EAE0D2",
      illustrationPath: "/illustrations/reading-bench.svg",
      isFavorite: !!favorites["pdf"],
    },
    {
      id: "video",
      type: "video",
      title: "Video Practice",
      sessions: "12 SESSIONS",
      progress: 0,
      bgPastel: "#E1EEFC",
      borderColor: "#D0E3F8",
      illustrationPath: "/illustrations/desk-coffee.svg",
      isFavorite: !!favorites["video"],
    },
  ];

  const displayedCards = cards.filter((c) => {
    if (filter === "favorites") return favorites[c.id];
    return true;
  });

  return (
    <div className="space-y-6 max-w-xl mx-auto w-full select-none pb-20">
      {/* =============================================================== */}
      {/* HEADER: Title, search & options icon                           */}
      {/* =============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
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
            <h1 className="text-2xl sm:text-3xl font-apfel font-bold text-[#111110] tracking-tight">
              Practice
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-[#55534E]">
            <button
              className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#334155] text-white shadow-xs"
                : "bg-white text-[#666560] border border-[#E4E4E7] hover:text-[#111110]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filter === "favorites"
                ? "bg-[#334155] text-white shadow-xs"
                : "bg-white text-[#666560] border border-[#E4E4E7] hover:text-[#111110]"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                filter === "favorites" ? "fill-white" : "text-[#71717A]"
              }`}
            />
            <span>Favourites</span>
          </button>
        </div>
      </div>

      {/* =============================================================== */}
      {/* SECTION 1: Disciplines (Horizontal Carousel of Pastel Cards)   */}
      {/* =============================================================== */}
      <div className="space-y-3">
        <h2 className="text-xs tabular-nums font-medium uppercase tracking-wider text-[#88867E]">
          Disciplines
        </h2>

        {/* Horizontal Scroll Carousel matching Image Reference */}
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {displayedCards.map((card) => (
            <div
              key={card.id}
              onClick={() => {
                if (card.type === "pdf") {
                  setViewingDetail("pdf");
                } else {
                  setSelectedTopic(card.title);
                }
              }}
              className="w-[275px] sm:w-[290px] h-[375px] shrink-0 snap-start rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer border group"
              style={{
                backgroundColor: card.bgPastel,
                borderColor: card.borderColor,
              }}
            >
              {/* Top row: Title + Session count + Heart */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#18181B] tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-[11px] tabular-nums font-semibold tracking-wider text-[#6B5A4E]/80 mt-1 uppercase">
                    {card.sessions}
                  </p>
                </div>

                <button
                  onClick={(e) => toggleFavorite(card.id, e)}
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Favorite"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      favorites[card.id]
                        ? "fill-[#EF4444] text-[#EF4444]"
                        : "text-[#88867E] hover:text-[#111110]"
                    }`}
                  />
                </button>
              </div>

              {/* Center Downloaded OutlineTone Illustration */}
              <div className="flex-1 my-auto py-2 flex items-center justify-center relative">
                <img
                  src={card.illustrationPath}
                  alt={card.title}
                  className="max-h-[175px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Bottom Progress Bar */}
              <div className="pt-2 relative z-10 space-y-1.5">
                <div className="flex items-center justify-between text-xs tabular-nums font-medium text-[#4B5563]">
                  <span>{card.progress}% Done</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1E293B] transition-all duration-500"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =============================================================== */}
      {/* SECTION 2: Official ICMAI Examination Sets (Syllabus 2022)     */}
      {/* =============================================================== */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs tabular-nums font-medium uppercase tracking-wider text-[#88867E]">
            Official ICMAI Examination Sets
          </h2>
          <span className="text-[10px] tabular-nums font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Syllabus 2022
          </span>
        </div>

        <div className="space-y-3">
          {[
            {
              id: "t1",
              title: "Official Model Question Papers (MQP)",
              desc: "ICMAI official term-end test series with blueprints, step-wise marks distribution, and time-bound mocks.",
              illustration: "/illustrations/topic-test.svg",
              paperTag: "CMA Inter Papers 5 to 12",
              url: "https://icmai.in/ClntStudents/ClntMQPList?menuId=1",
            },
            {
              id: "t2",
              title: "Previous Examination Papers Archive",
              desc: "Authentic question papers from past examination terms with examiner marking schemes and suggested answers.",
              illustration: "/illustrations/distraction-phone.svg",
              paperTag: "Term-wise Archive",
              url: "https://icmai.in/ClntStudents/ClntQuestionPaperList?menuId=1",
            },
          ].map((topic) => (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic.title)}
              className="p-5 rounded-2xl bg-white border border-[#EBE8E1] hover:border-[#D0CABE] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tabular-nums font-semibold px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EFECE6] text-[#71717A]">
                    {topic.paperTag}
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-[#18181B] group-hover:text-black">
                  {topic.title}
                </h3>
                <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2">
                  {topic.desc}
                </p>
              </div>

              {/* Downloaded Illustration on right */}
              <div className="w-16 h-16 shrink-0 flex items-center justify-center p-1 rounded-xl bg-[#FAF9F5] border border-[#F0ECE1]">
                <img
                  src={topic.illustration}
                  alt={topic.title}
                  className="max-h-12 w-auto object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Dialog if clicked */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#EBE8E1] p-6 space-y-4 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[11px] tabular-nums text-[#059669] bg-[#EAF7EE] px-2.5 py-0.5 rounded-full font-semibold border border-[#D1F2DD]">
                Official ICMAI Resource
              </span>
              <h3 className="font-serif text-xl font-bold text-[#111110] pt-1">
                {selectedTopic}
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Direct access to ICMAI official question repositories, suggested answer keys, and syllabus 2022 marking blueprints.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#27272A] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Paper 5: Business Laws &amp; Ethics</span>
              </div>
              <div className="flex items-center gap-2 text-[#27272A] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Paper 6: Financial Accounting</span>
              </div>
              <div className="flex items-center gap-2 text-[#27272A] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Paper 7: Direct &amp; Indirect Taxation</span>
              </div>
              <div className="flex items-center gap-2 text-[#27272A] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Paper 8: Cost Accounting</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={
                  selectedTopic.includes("Model")
                    ? "https://icmai.in/ClntStudents/ClntMQPList?menuId=1"
                    : "https://icmai.in/ClntStudents/ClntQuestionPaperList?menuId=1"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-[#111110] text-white hover:bg-black font-apfel font-semibold text-xs tracking-wide uppercase text-center cursor-pointer"
              >
                Open Official Portal
              </a>
              <button
                onClick={() => setSelectedTopic(null)}
                className="px-4 py-3 rounded-xl border border-[#EBE8E1] text-[#666560] hover:text-[#111110] text-xs cursor-pointer"
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
