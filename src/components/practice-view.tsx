"use client";

import React, { useState } from "react";
import { Search, MoreVertical, Heart, ArrowLeft, ArrowRight, BookOpen, Video, FileText, CheckCircle2 } from "lucide-react";
import { MaterialIcon } from "@/components/material-icon";

interface PracticeCard {
  id: string;
  type: "pdf" | "video";
  title: string;
  sessions: string;
  progress: number;
  bgPastel: string;
  borderColor: string;
  accentColor: string;
  isFavorite?: boolean;
}

export function PracticeView({ onBack }: { onBack?: () => void }) {
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    pdf: true,
  });
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

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
      bgPastel: "#F7EFE4",
      borderColor: "#EDE0D0",
      accentColor: "#334155",
      isFavorite: !!favorites["pdf"],
    },
    {
      id: "video",
      type: "video",
      title: "Video Practice",
      sessions: "12 SESSIONS",
      progress: 0,
      bgPastel: "#E4F0FB",
      borderColor: "#D2E4F7",
      accentColor: "#2563EB",
      isFavorite: !!favorites["video"],
    },
  ];

  const displayedCards = cards.filter((c) => {
    if (filter === "favorites") return favorites[c.id];
    return true;
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full select-none pb-12">
      {/* =============================================================== */}
      {/* HEADER: Practice title, search & more actions                   */}
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
      {/* SECTION 1: Disciplines (PDF & Video Practice Cards)            */}
      {/* =============================================================== */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-[#88867E]">
          Disciplines
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedTopic(card.title)}
              className="rounded-[30px] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer border group"
              style={{
                backgroundColor: card.bgPastel,
                borderColor: card.borderColor,
                minHeight: "340px",
              }}
            >
              {/* Top row: Title + Session count + Heart */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#18181B] tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-mono font-semibold tracking-wider text-[#6B5A4E]/80 mt-1 uppercase">
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

              {/* Center Line Art Illustration (Matching User's Reference) */}
              <div className="my-auto py-4 flex items-center justify-center relative">
                {card.type === "pdf" ? (
                  // PDF Editorial Illustration: Calm student seated reading notes with soft circles
                  <svg
                    viewBox="0 0 200 170"
                    className="w-44 h-auto text-[#1E293B] group-hover:scale-105 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Background Soft Accent Eye / Halo */}
                    <path
                      d="M 30 75 Q 100 20 170 75 Q 100 130 30 75 Z"
                      fill="#EADCCB"
                      stroke="none"
                      opacity="0.6"
                    />
                    <circle cx="100" cy="75" r="14" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.2" />

                    {/* Stool / Seat */}
                    <line x1="60" y1="120" x2="140" y2="120" strokeWidth="2.5" />
                    <line x1="72" y1="120" x2="62" y2="155" strokeWidth="1.8" />
                    <line x1="128" y1="120" x2="138" y2="155" strokeWidth="1.8" />
                    <line x1="85" y1="120" x2="100" y2="155" strokeWidth="1.2" strokeDasharray="3 3" />

                    {/* Seated Figure */}
                    {/* Head & Hair */}
                    <circle cx="95" cy="52" r="11" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M 88 52 C 86 42, 102 42, 104 50 C 105 56, 96 60, 94 62" fill="#1E293B" />
                    <circle cx="89" cy="50" r="4" fill="#C2D8EC" stroke="currentColor" strokeWidth="1" />

                    {/* Torso & Back */}
                    <path
                      d="M 94 63 Q 86 85 92 105 Q 93 118 116 118"
                      strokeWidth="1.8"
                    />
                    {/* Arm holding document */}
                    <path d="M 96 74 Q 108 85 118 90" strokeWidth="1.6" />
                    <circle cx="106" cy="84" r="5" fill="#C2D8EC" stroke="currentColor" strokeWidth="1" />

                    {/* Legs */}
                    <path d="M 116 118 L 134 118 Q 138 135 142 153" strokeWidth="1.8" />
                    <path d="M 112 118 L 122 135 L 126 153" strokeWidth="1.4" />
                    <circle cx="134" cy="118" r="5" fill="#C2D8EC" stroke="currentColor" strokeWidth="1" />
                    <circle cx="142" cy="153" r="3.5" fill="#FFFFFF" stroke="currentColor" strokeWidth="1" />

                    {/* Document / Open PDF in hand */}
                    <rect
                      x="115"
                      y="78"
                      width="18"
                      height="24"
                      rx="2"
                      fill="#FFFFFF"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      transform="rotate(12 115 78)"
                    />
                    <line x1="120" y1="84" x2="130" y2="86" strokeWidth="1" />
                    <line x1="120" y1="89" x2="128" y2="91" strokeWidth="1" />
                  </svg>
                ) : (
                  // Video Editorial Illustration: Student with tablet / lecture screen & audio
                  <svg
                    viewBox="0 0 200 170"
                    className="w-44 h-auto text-[#1E293B] group-hover:scale-105 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Background Halo Orbit */}
                    <ellipse
                      cx="100"
                      cy="85"
                      rx="65"
                      ry="48"
                      fill="#CCE2F8"
                      stroke="none"
                      opacity="0.5"
                    />
                    <ellipse
                      cx="100"
                      cy="85"
                      rx="65"
                      ry="48"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />

                    {/* Orbit Node */}
                    <circle cx="36" cy="85" r="6" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="164" cy="85" r="4" fill="#60A5FA" stroke="currentColor" strokeWidth="1.2" />

                    {/* Central Display / Video Screen Stand */}
                    <rect
                      x="68"
                      y="42"
                      width="64"
                      height="46"
                      rx="8"
                      fill="#FFFFFF"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    {/* Screen Stand */}
                    <line x1="100" y1="88" x2="100" y2="106" strokeWidth="2" />
                    <path d="M 86 106 L 114 106" strokeWidth="2.5" />

                    {/* Play triangle inside video screen */}
                    <polygon
                      points="96,59 96,71 106,65"
                      fill="#2563EB"
                      stroke="#2563EB"
                      strokeWidth="1"
                    />

                    {/* Ambient Sound / Audio Waves */}
                    <path d="M 52 58 Q 46 65 52 72" strokeWidth="1.4" stroke="#2563EB" />
                    <path d="M 48 53 Q 38 65 48 77" strokeWidth="1.2" stroke="#2563EB" opacity="0.6" />

                    {/* Bottom Table Line & Notepad */}
                    <line x1="45" y1="126" x2="155" y2="126" strokeWidth="1.8" />
                    <rect x="74" y="116" width="22" height="18" rx="2" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.2" />
                    <line x1="110" y1="118" x2="124" y2="118" strokeWidth="2" stroke="#2563EB" />
                  </svg>
                )}
              </div>

              {/* Bottom Progress Bar */}
              <div className="pt-2 relative z-10 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono font-medium text-[#4B5563]">
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
      {/* SECTION 2: Topic Tests & Quick Focus Sets ("Hindrances" style)  */}
      {/* =============================================================== */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-[#88867E]">
          Target Focus Sets
        </h2>

        <div className="space-y-3">
          {[
            {
              id: "t1",
              title: "Chapter-wise MCQ Drills",
              desc: "Timed tests covering high-yield ICMAI exam questions with instant solution breakdown.",
              tag: "45 Mins",
            },
            {
              id: "t2",
              title: "Previous 5-Year Solved RTPs",
              desc: "Official suggested answers, step-marking rubrics and examiner comments.",
              tag: "Group 1",
            },
          ].map((topic) => (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic.title)}
              className="p-5 rounded-2xl bg-white border border-[#EBE8E1] hover:border-[#D0CABE] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base font-bold text-[#18181B] group-hover:text-black">
                    {topic.title}
                  </h3>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EFECE6] text-[#666560]">
                    {topic.tag}
                  </span>
                </div>
                <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2">
                  {topic.desc}
                </p>
              </div>

              {/* Minimalist Line Art Drawing on right (like user's reference) */}
              <div className="w-16 h-16 shrink-0 flex items-center justify-center p-1 rounded-xl bg-[#FAF9F5] border border-[#F0ECE1]">
                <svg
                  viewBox="0 0 60 60"
                  className="w-12 h-12 text-[#334155]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Hand holding leaf / knowledge node */}
                  <path d="M 12 48 Q 24 44 32 36 Q 38 30 46 28" />
                  <path d="M 32 36 C 36 28 42 22 46 16 C 50 24 46 32 38 36" fill="#C2D8EC" opacity="0.5" />
                  <path d="M 32 36 C 36 28 42 22 46 16 C 50 24 46 32 38 36" />
                  <circle cx="46" cy="16" r="2.5" fill="#EF4444" stroke="none" />
                </svg>
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
              <span className="text-[11px] font-mono text-[#059669] bg-[#EAF7EE] px-2.5 py-0.5 rounded-full font-semibold border border-[#D1F2DD]">
                Ready for Practice
              </span>
              <h3 className="font-serif text-xl font-bold text-[#111110] pt-1">
                {selectedTopic}
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Contains verified syllabus modules, answer keys, and timed mock exam timer.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#27272A] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Instant Evaluation &amp; Feedback</span>
              </div>
              <div className="flex items-center gap-2 text-[#27272A] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Paper 8: Cost Accounting &amp; Direct Tax</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedTopic(null)}
                className="flex-1 py-3 rounded-xl bg-[#111110] text-white hover:bg-black font-apfel font-semibold text-xs tracking-wide uppercase cursor-pointer"
              >
                Start Session
              </button>
              <button
                onClick={() => setSelectedTopic(null)}
                className="px-4 py-3 rounded-xl border border-[#EBE8E1] text-[#666560] hover:text-[#111110] text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
