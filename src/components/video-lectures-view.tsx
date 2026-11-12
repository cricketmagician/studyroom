"use client";

import React, { useState } from "react";
import { ArrowLeft, Play, CheckCircle2, Clock, User, X, Sparkles, Filter, ExternalLink } from "lucide-react";
import { useMaterials } from "@/lib/hooks";

interface LectureVideo {
  id: string;
  title: string;
  paperCode: string;
  subject: string;
  duration: string;
  faculty: string;
  views: string;
  url?: string;
  completed?: boolean;
}

const CMA_LECTURES: LectureVideo[] = [
  {
    id: "v-1",
    title: "Marginal Costing Masterclass: CVP & Break-Even Analysis",
    paperCode: "Paper 8",
    subject: "Cost Accounting",
    duration: "48 Min",
    faculty: "CA / CMA Rajesh Sharma",
    views: "2.4k CMA Students",
    completed: true,
  },
  {
    id: "v-2",
    title: "Standard Costing: Material & Labour Variance Deconstruction",
    paperCode: "Paper 8",
    subject: "Cost Accounting",
    duration: "52 Min",
    faculty: "CA / CMA Rajesh Sharma",
    views: "1.8k CMA Students",
    completed: true,
  },
  {
    id: "v-3",
    title: "Activity Based Costing (ABC) vs Traditional Absorption Costing",
    paperCode: "Paper 8",
    subject: "Cost Accounting",
    duration: "42 Min",
    faculty: "CMA Ananya Verma",
    views: "1.2k CMA Students",
    completed: false,
  },
  {
    id: "v-4",
    title: "Financial Accounting: Consignment Accounts & Valuation of Stock",
    paperCode: "Paper 6",
    subject: "Financial Accounting",
    duration: "55 Min",
    faculty: "CA Priya Nair",
    views: "3.1k CMA Students",
    completed: false,
  },
  {
    id: "v-5",
    title: "Direct Taxation: Capital Gains Section 45 to 55 & Exemptions 54",
    paperCode: "Paper 7",
    subject: "Direct Taxation",
    duration: "65 Min",
    faculty: "CA Manish Gupta",
    views: "4.5k CMA Students",
    completed: false,
  },
  {
    id: "v-6",
    title: "Companies Act 2013: Share Capital, Debentures & Dividend Rules",
    paperCode: "Paper 5",
    subject: "Business Laws",
    duration: "40 Min",
    faculty: "Adv. Sunita Rao",
    views: "1.9k CMA Students",
    completed: false,
  },
];

export function VideoLecturesView({ onBack }: { onBack?: () => void }) {
  const { items: uploadedMaterials } = useMaterials();
  const [selectedSub, setSelectedSub] = useState("All");
  const [watchedIds, setWatchedIds] = useState<Record<string, boolean>>({ "v-1": true, "v-2": true });
  const [activeVideo, setActiveVideo] = useState<LectureVideo | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const toggleWatched = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allVideos: LectureVideo[] = React.useMemo(() => {
    const list: LectureVideo[] = [];
    if (uploadedMaterials && uploadedMaterials.length > 0) {
      uploadedMaterials
        .filter((m) => m.type === "video")
        .forEach((m) => {
          list.push({
            id: m.id,
            title: m.title,
            paperCode: m.paperCode || "Paper 8",
            subject: m.subject || "Cost Accounting",
            duration: m.duration || `${Math.max(15, Math.round(m.size / (1024 * 1024 * 2)))} Min`,
            faculty: m.faculty || m.teacherName || "CMA Faculty",
            views: "CMA Student Community",
            url: m.url,
            completed: !!watchedIds[m.id],
          });
        });
    }
    return [...list, ...CMA_LECTURES];
  }, [uploadedMaterials, watchedIds]);

  const filtered = allVideos.filter((v) => selectedSub === "All" || v.subject === selectedSub);

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full select-none pb-16">
      {/* Header */}
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
          <div>
            <h1 className="text-2xl sm:text-3xl font-apfel font-bold text-[#111110] tracking-tight">
              Video Lectures
            </h1>
            <p className="text-xs text-[#71717A]">
              Concept lectures &amp; solved practicals by leading CA/CMA faculties
            </p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {["All", "Cost Accounting", "Financial Accounting", "Direct Taxation", "Business Laws"].map((sub) => {
          const active = selectedSub === sub;
          return (
            <button
              key={sub}
              onClick={() => setSelectedSub(sub)}
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

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((video) => {
          const isDone = !!watchedIds[video.id];
          return (
            <div
              key={video.id}
              onClick={() => {
                setWatchedIds((prev) => ({ ...prev, [video.id]: true }));
                setActiveVideo(video);
              }}
              className="p-5 rounded-[26px] bg-white border border-[#EBE8E1] hover:border-[#D0CABE] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-[#EAF7EE] text-[#10B981] flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] tabular-nums font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                    {video.paperCode}
                  </span>
                  <span className="text-[10px] tabular-nums font-semibold px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EFECE6] text-[#71717A]">
                    {video.subject}
                  </span>
                  <button
                    onClick={(e) => toggleWatched(video.id, e)}
                    className="p-1 rounded-full text-[#AAA79E] hover:text-[#10B981] transition-colors cursor-pointer"
                    title={isDone ? "Watched" : "Mark as Watched"}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isDone ? "text-[#10B981] fill-[#EAF7EE]" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-apfel font-bold text-sm text-[#111110] group-hover:text-black line-clamp-2 leading-snug">
                  {video.title}
                </h3>
                <div className="flex items-center gap-3 text-[11px] text-[#88867E]">
                  <span className="flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3 text-[#AAA79E]" />
                    {video.duration}
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[140px]">{video.faculty}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F5F3ED] flex items-center justify-between text-xs font-semibold text-[#10B981]">
                <span>{isDone ? "Rewatch Lecture" : "Watch Lecture"}</span>
                <span className="w-7 h-7 rounded-full bg-[#EAF7EE] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  ▶
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-[#18181B] border border-white/10 text-white p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] tabular-nums text-[#34D399] uppercase tracking-wider">
                  {activeVideo.subject}
                </span>
                <h3 className="font-apfel font-bold text-lg text-white mt-0.5">
                  {activeVideo.title}
                </h3>
                <p className="text-xs text-[#A1A1AA]">{activeVideo.faculty}</p>
              </div>

              <button
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-full text-[#A1A1AA] hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Stage */}
            <div className="w-full aspect-video rounded-2xl bg-black border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
              {activeVideo.url && (activeVideo.url.endsWith(".mp4") || activeVideo.url.endsWith(".webm") || activeVideo.url.startsWith("blob:") || activeVideo.url.startsWith("data:")) ? (
                <video src={activeVideo.url} controls className="w-full h-full object-contain" autoPlay />
              ) : activeVideo.url && (activeVideo.url.includes("youtube.com") || activeVideo.url.includes("youtu.be")) ? (
                <iframe
                  src={activeVideo.url.replace("watch?v=", "embed/")}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer">
                    <Play className="w-8 h-8 fill-white translate-x-0.5" />
                  </div>
                  <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-[11px] tabular-nums text-white/80">
                    <span>00:00 / {activeVideo.duration}</span>
                    <div className="flex items-center gap-2">
                      {[1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => setPlaybackSpeed(s)}
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            playbackSpeed === s ? "bg-white text-black font-bold" : "bg-white/10 text-white"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[#A1A1AA]">Status: Watched &amp; Recorded in Analytics</span>
              <button
                onClick={() => setActiveVideo(null)}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-apfel font-bold text-xs uppercase cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
