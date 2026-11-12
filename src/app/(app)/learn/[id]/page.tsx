"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  FileText,
  Clock,
  User,
  BookmarkCheck,
  Maximize2,
  Sparkles,
  Download,
  Gauge,
  GraduationCap,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { friendlyError } from "@/lib/firebase/errors";
import { RequireRole, Spinner } from "@/lib/auth";
import { formatSize } from "@/lib/files";
import { Material, toMaterial } from "@/lib/materials";
import { ErrorText } from "@/components/auth-card";
import { rememberOpened } from "@/components/study-tiles";
import { NotesCard, StudyActions } from "@/components/study-actions";
import { AiPanel } from "@/components/ai-panel";
import { postAi } from "@/lib/ai-client";
import { parseVideoUrl, parsePdfUrl } from "@/lib/embed";

export default function ViewerPage() {
  return (
    <RequireRole>
      <Viewer />
    </RequireRole>
  );
}

function Viewer() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Material | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const goToPage = (n: number) => {
    setPage(n);
    viewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "materials", id))
      .then((snap) => {
        setItem(snap.exists() ? toMaterial(snap) : null);
        if (snap.exists()) {
          rememberOpened(id);
          postAi("/api/study", { action: "open", materialId: id }).catch((err) =>
            setError(err.message)
          );
        }
      })
      .catch((err) => setError(friendlyError(err)));
  }, [id]);

  const videoEmbed = item?.type === "video" ? parseVideoUrl(item.url) : null;
  const pdfEmbedUrl = item?.type === "pdf" ? parsePdfUrl(item.url, page) : "";

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/?view=Library"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/80 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/15 transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </Link>

        {item?.subjectId && (
          <Link
            href={`/syllabus`}
            className="inline-flex items-center gap-1.5 text-xs tabular-nums font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Syllabus Blueprint ↗</span>
          </Link>
        )}
      </div>

      <ErrorText>{error}</ErrorText>
      {item === undefined && !error && <Spinner />}
      {item === null && (
        <div className="apple-glass-card p-12 text-center text-sm text-[var(--text-secondary)]">
          This study material was removed or does not exist.
        </div>
      )}

      {item && (
        <article className="space-y-6">
          
          {/* Resource Title & Details Card */}
          <div className="apple-glass-card p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold uppercase tracking-wider bg-[#111110] text-white dark:bg-white dark:text-[#111110]">
                    {item.type === "video" ? <Play className="w-3 h-3 fill-current" /> : <FileText className="w-3 h-3" />}
                    {item.type === "video" ? "VIDEO LECTURE" : "PDF NOTES"}
                  </span>

                  {item.paperCode && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold bg-black/5 dark:bg-white/10 text-[var(--text-primary)] border border-black/5 dark:border-white/10">
                      {item.paperCode} · {item.level || "CMA"}
                    </span>
                  )}

                  {item.category && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]">
                      {item.category}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-apfel font-bold text-[var(--text-primary)] tracking-tight leading-snug">
                  {item.title}
                </h1>

                {item.chapter && (
                  <p className="text-xs tabular-nums font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                    <span>Module: {item.chapter}</span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Tab</span>
                </a>

                {item.type === "pdf" && item.url && (
                  <a
                    href={item.url}
                    download
                    className="p-2 rounded-xl border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-xs transition-colors cursor-pointer"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="flex items-center gap-4 flex-wrap text-xs tabular-nums text-[var(--text-secondary)] pt-3 border-t border-black/5 dark:border-white/10">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{item.faculty ? `Faculty: ${item.faculty}` : `By ${item.teacherName || "Admin"}`}</span>
              </span>

              {item.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Duration: {item.duration}</span>
                </span>
              )}

              {item.size > 0 && (
                <span>Size: {formatSize(item.size)}</span>
              )}
            </div>
          </div>

          <StudyActions materialId={item.id} />

          {/* MAIN VIEWER CONTAINER */}
          <div
            ref={viewerRef}
            className="apple-glass-card overflow-hidden border border-black/10 dark:border-white/15 shadow-xl"
          >
            {item.type === "video" ? (
              <div className="space-y-3">
                {/* Embedded Video Player */}
                {videoEmbed?.type === "youtube" ? (
                  <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
                    <iframe
                      src={videoEmbed.embedUrl}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                ) : videoEmbed?.type === "vimeo" ? (
                  <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
                    <iframe
                      src={videoEmbed.embedUrl}
                      title={item.title}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                ) : videoEmbed?.type === "gdrive" ? (
                  <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
                    <iframe
                      src={videoEmbed.embedUrl}
                      title={item.title}
                      allow="autoplay"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="relative bg-black rounded-2xl overflow-hidden">
                    <video
                      ref={videoRef}
                      src={item.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[75vh] mx-auto bg-black"
                    />
                    
                    {/* Playback Speed Controls for native videos */}
                    <div className="p-3 bg-black/80 backdrop-blur-md flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-3.5 h-3.5 text-gray-400" />
                        <span className="tabular-nums text-[11px] text-gray-300">Speed:</span>
                        {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSpeedChange(s)}
                            className={`px-2 py-0.5 rounded-md tabular-nums text-xs transition-colors cursor-pointer ${
                              playbackSpeed === s
                                ? "bg-white text-black font-bold"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>

                      <span className="text-[10px] tabular-nums text-gray-400">
                        HD 1080p · Native HTML5 Video
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* PDF Viewer Frame */
              <div className="w-full">
                <iframe
                  key={page}
                  src={pdfEmbedUrl}
                  title={item.title}
                  className="w-full h-[80vh] border-0 bg-white"
                />
              </div>
            )}
          </div>

          {/* AI Companion for PDFs */}
          {item.type === "pdf" && <AiPanel material={item} onGoToPage={goToPage} />}

          {/* Student Notes Card */}
          <NotesCard materialId={item.id} />
        </article>
      )}
    </div>
  );
}
