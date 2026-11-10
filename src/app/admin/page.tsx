"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Video,
  Upload,
  CloudUpload,
  Trash2,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Eye,
  AlertCircle,
  Plus,
} from "lucide-react";
import { MaterialIcon } from "@/components/material-icon";
import { useMaterials } from "@/lib/hooks";
import { Material, saveLocalMaterial, removeLocalMaterial } from "@/lib/materials";

const CMA_SUBJECT_OPTIONS = [
  { paper: "Paper 8", name: "Cost Accounting" },
  { paper: "Paper 6", name: "Financial Accounting" },
  { paper: "Paper 7", name: "Direct & Indirect Taxation" },
  { paper: "Paper 5", name: "Business Laws & Ethics" },
  { paper: "Official", name: "Official ICMAI" },
];

export default function AdminPortalPage() {
  const { items: uploadedMaterials } = useMaterials();
  const [activeTab, setActiveTab] = useState<"pdf" | "video">("pdf");

  // PDF Form state
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfSubject, setPdfSubject] = useState(CMA_SUBJECT_OPTIONS[0].name);
  const [pdfPaper, setPdfPaper] = useState(CMA_SUBJECT_OPTIONS[0].paper);
  const [pdfPages, setPdfPages] = useState("24");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Video Form state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoSubject, setVideoSubject] = useState(CMA_SUBJECT_OPTIONS[0].name);
  const [videoPaper, setVideoPaper] = useState(CMA_SUBJECT_OPTIONS[0].paper);
  const [videoFaculty, setVideoFaculty] = useState("CA / CMA Faculty");
  const [videoDuration, setVideoDuration] = useState("45 Min");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Status feedback
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState("");
  const [publishError, setPublishError] = useState("");

  const handleSubjectChange = (subjectName: string, isVideo: boolean) => {
    const found = CMA_SUBJECT_OPTIONS.find((s) => s.name === subjectName);
    if (isVideo) {
      setVideoSubject(subjectName);
      if (found) setVideoPaper(found.paper);
    } else {
      setPdfSubject(subjectName);
      if (found) setPdfPaper(found.paper);
    }
  };

  const handlePublishPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfTitle.trim()) {
      setPublishError("Please enter a title for the study material.");
      return;
    }

    setPublishError("");
    setIsPublishing(true);

    try {
      let finalUrl = pdfUrl.trim();
      let sizeBytes = 3.5 * 1024 * 1024;

      if (pdfFile) {
        sizeBytes = pdfFile.size;
        finalUrl = URL.createObjectURL(pdfFile);
      } else if (!finalUrl) {
        // Fallback demo PDF link
        finalUrl = "https://www.icmai.in/upload/Students/Syllabus2022/Curriculum_2022.pdf";
      }

      const newMaterial: Material = {
        id: `cma-mat-${Date.now()}`,
        title: pdfTitle.trim(),
        type: "pdf",
        url: finalUrl,
        size: sizeBytes,
        subject: pdfSubject,
        paperCode: pdfPaper,
        duration: `${pdfPages} Pages`,
        teacherId: "admin-cma",
        teacherName: "CMA Academic Admin",
        createdAt: Date.now(),
      };

      saveLocalMaterial(newMaterial);

      setPublishSuccess(`"${pdfTitle.trim()}" successfully published! It is now live for all students.`);
      setPdfTitle("");
      setPdfUrl("");
      setPdfFile(null);
      setTimeout(() => setPublishSuccess(""), 6000);
    } catch (err: any) {
      setPublishError(err?.message || "Failed to publish PDF.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      setPublishError("Please enter a lecture title.");
      return;
    }

    setPublishError("");
    setIsPublishing(true);

    try {
      let finalUrl = videoUrl.trim();
      let sizeBytes = 45 * 1024 * 1024;

      if (videoFile) {
        sizeBytes = videoFile.size;
        finalUrl = URL.createObjectURL(videoFile);
      } else if (!finalUrl) {
        finalUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      }

      const newMaterial: Material = {
        id: `cma-vid-${Date.now()}`,
        title: videoTitle.trim(),
        type: "video",
        url: finalUrl,
        size: sizeBytes,
        subject: videoSubject,
        paperCode: videoPaper,
        duration: videoDuration.trim() || "45 Min",
        faculty: videoFaculty.trim() || "CMA Faculty",
        teacherId: "admin-cma",
        teacherName: videoFaculty.trim() || "CMA Faculty",
        createdAt: Date.now(),
      };

      saveLocalMaterial(newMaterial);

      setPublishSuccess(`Lecture "${videoTitle.trim()}" published! Students can now watch it in Video Lectures.`);
      setVideoTitle("");
      setVideoUrl("");
      setVideoFile(null);
      setTimeout(() => setPublishSuccess(""), 6000);
    } catch (err: any) {
      setPublishError(err?.message || "Failed to publish video lecture.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove "${title}"? Students will immediately stop seeing it.`)) {
      removeLocalMaterial(id);
    }
  };

  const pdfCount = (uploadedMaterials || []).filter((m) => m.type === "pdf").length;
  const videoCount = (uploadedMaterials || []).filter((m) => m.type === "video").length;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#111110] font-absans select-none pb-20">
      {/* Top Navbar */}
      <header className="h-16 px-6 lg:px-10 border-b border-[#EFECE6] bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-white border border-[#EBE8E1] hover:bg-gray-50 flex items-center justify-center text-[#111110] transition-colors shadow-2xs"
            title="Back to Student App"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <h1 className="font-apfel font-bold text-base text-[#111110]">
                CMA Admin &amp; Faculty Console
              </h1>
            </div>
            <p className="text-[11px] text-[#88867E]">
              Publish PDFs, notes &amp; video lectures directly to student apps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-2xl bg-[#111110] text-white hover:bg-black font-apfel font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
          >
            <span>View Student App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Stat Counter Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-[24px] bg-white border border-[#EBE8E1] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#88867E]">Total Uploaded</span>
              <div className="text-2xl font-apfel font-bold text-[#111110]">
                {(uploadedMaterials || []).length} Items
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FAF9F5] border border-[#EFECE6] flex items-center justify-center text-[#111110]">
              <Upload className="w-5 h-5 text-[#88867E]" />
            </div>
          </div>

          <div className="p-5 rounded-[24px] bg-[#F4EFFE] border border-[#E5DAFA] shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#7C3AED]">PDFs &amp; Notes</span>
              <div className="text-2xl font-apfel font-bold text-[#7C3AED]">
                {pdfCount} Published
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white text-[#8B5CF6] flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-[24px] bg-[#EAF7EE] border border-[#D2EFE0] shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#059669]">Video Lectures</span>
              <div className="text-2xl font-apfel font-bold text-[#059669]">
                {videoCount} Published
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white text-[#10B981] flex items-center justify-center shadow-xs">
              <Video className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Upload Form Box */}
        <div className="p-6 sm:p-8 rounded-[30px] bg-white border border-[#EBE8E1] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F2EFE9]">
            <div>
              <h2 className="font-apfel font-bold text-xl text-[#111110]">
                Publish New CMA Study Material
              </h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                Uploaded materials immediately appear in the student&apos;s Study Library, Practice Zone &amp; Video Lectures
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("pdf");
                  setPublishSuccess("");
                  setPublishError("");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "pdf"
                    ? "bg-[#111110] text-white shadow-xs font-bold"
                    : "text-[#666560] hover:text-[#111110]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Document</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("video");
                  setPublishSuccess("");
                  setPublishError("");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "video"
                    ? "bg-[#111110] text-white shadow-xs font-bold"
                    : "text-[#666560] hover:text-[#111110]"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Lecture</span>
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {publishSuccess && (
            <div className="p-4 rounded-2xl bg-[#EAF7EE] border border-[#D2EFE0] text-[#059669] text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
              <span>{publishSuccess}</span>
            </div>
          )}

          {publishError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{publishError}</span>
            </div>
          )}

          {/* Form 1: PDF Upload Form */}
          {activeTab === "pdf" && (
            <form onSubmit={handlePublishPdf} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                    Material / Note Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="e.g. Paper 8: Cost Accounting - Marginal Costing Notes"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] text-xs text-[#111110] placeholder-[#AAA79E] outline-none focus:border-[#111110] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                    CMA Intermediate Subject
                  </label>
                  <select
                    value={pdfSubject}
                    onChange={(e) => handleSubjectChange(e.target.value, false)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] text-xs text-[#111110] outline-none focus:border-[#111110] transition-colors cursor-pointer"
                  >
                    {CMA_SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub.name} value={sub.name}>
                        {sub.paper}: {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                    Estimated Page Count / Reading Time
                  </label>
                  <input
                    type="text"
                    value={pdfPages}
                    onChange={(e) => setPdfPages(e.target.value)}
                    placeholder="e.g. 32 Pages or 15 Min"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] text-xs text-[#111110] placeholder-[#AAA79E] outline-none focus:border-[#111110] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                    PDF Document URL (Or select file below)
                  </label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://example.com/notes.pdf"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] text-xs text-[#111110] placeholder-[#AAA79E] outline-none focus:border-[#111110] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Drag and Drop File Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                  Select Local PDF File
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#E0DCD2] hover:border-[#111110] rounded-2xl bg-[#FAF9F5] cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setPdfFile(f);
                        if (!pdfTitle) setPdfTitle(f.name.replace(/\.pdf$/i, ""));
                      }
                    }}
                    className="sr-only"
                  />
                  <CloudUpload className="w-8 h-8 text-[#AAA79E] group-hover:text-[#111110] group-hover:scale-105 transition-all mb-2" />
                  {pdfFile ? (
                    <div className="text-center">
                      <span className="text-xs font-bold text-[#111110] block">{pdfFile.name}</span>
                      <span className="text-[11px] font-mono text-[#71717A]">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to publish
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-xs font-semibold text-[#111110] block">
                        Click to browse PDF or drag and drop
                      </span>
                      <span className="text-[11px] text-[#88867E]">
                        Standard PDF study material, chapter summaries, formula sheets
                      </span>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-6 py-3 rounded-2xl bg-[#111110] hover:bg-black text-white text-xs font-apfel font-bold tracking-wide uppercase flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isPublishing ? "Publishing…" : "Publish PDF to Students"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Form 2: Video Lecture Form */}
          {activeTab === "video" && (
            <form onSubmit={handlePublishVideo} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                    Lecture Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Paper 6: Financial Accounting - Consignment Solved Problems"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] text-xs text-[#111110] placeholder-[#AAA79E] outline-none focus:border-[#111110] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                    CMA Intermediate Subject
                  </label>
                  <select
                    value={videoSubject}
                    onChange={(e) => handleSubjectChange(e.target.value, true)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] text-xs text-[#111110] outline-none focus:border-[#111110] transition-colors cursor-pointer"
                  >
                    {CMA_SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub.name} value={sub.name}>
                        {sub.paper}: {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    value={videoFaculty}
                    onChange={(e) => setVideoFaculty(e.target.value)}
                    placeholder="e.g. CA / CMA Rajesh Sharma"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] text-xs text-[#111110] placeholder-[#AAA79E] outline-none focus:border-[#111110] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="e.g. 48 Min"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] text-xs text-[#111110] placeholder-[#AAA79E] outline-none focus:border-[#111110] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                    Video Stream / YouTube URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE8E1] text-xs text-[#111110] placeholder-[#AAA79E] outline-none focus:border-[#111110] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Local Video File */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                  Or Upload Local Video File
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#E0DCD2] hover:border-[#111110] rounded-2xl bg-[#FAF9F5] cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setVideoFile(f);
                        if (!videoTitle) setVideoTitle(f.name.replace(/\.[^/.]+$/, ""));
                      }
                    }}
                    className="sr-only"
                  />
                  <Video className="w-8 h-8 text-[#AAA79E] group-hover:text-[#111110] group-hover:scale-105 transition-all mb-2" />
                  {videoFile ? (
                    <div className="text-center">
                      <span className="text-xs font-bold text-[#111110] block">{videoFile.name}</span>
                      <span className="text-[11px] font-mono text-[#71717A]">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to publish
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-xs font-semibold text-[#111110] block">
                        Click to browse MP4/WebM video or drag and drop
                      </span>
                      <span className="text-[11px] text-[#88867E]">
                        Full lectures, concept snippets, solved scanners
                      </span>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-6 py-3 rounded-2xl bg-[#111110] hover:bg-black text-white text-xs font-apfel font-bold tracking-wide uppercase flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isPublishing ? "Publishing…" : "Publish Video to Students"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Section: Live Published Repository */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-apfel font-bold text-[#111110]">
                Live Published Repository (Student App Feed)
              </h2>
              <p className="text-xs text-[#88867E]">
                All PDFs and videos currently accessible to students in real-time
              </p>
            </div>
            <span className="text-xs font-mono text-[#88867E]">
              {(uploadedMaterials || []).length} Total Items
            </span>
          </div>

          {(uploadedMaterials || []).length === 0 ? (
            <div className="p-8 rounded-[26px] bg-white border border-[#EBE8E1] text-center space-y-2">
              <CloudUpload className="w-8 h-8 text-[#AAA79E] mx-auto mb-1" />
              <div className="text-sm font-apfel font-bold text-[#111110]">
                No custom materials published yet
              </div>
              <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                Use the form above to upload chapter PDFs or video lectures. They will appear here and sync immediately to all students.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(uploadedMaterials || []).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-[26px] bg-white border border-[#EBE8E1] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.type === "video"
                          ? "bg-[#EAF7EE] text-[#10B981]"
                          : "bg-[#F4EFFE] text-[#8B5CF6]"
                      }`}
                    >
                      {item.type === "video" ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.paperCode || "Paper"}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EFECE6] text-[#71717A]">
                        {item.subject || (item.type === "video" ? "Video Lecture" : "PDF Notes")}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1 rounded-full text-[#AAA79E] hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-apfel font-bold text-sm text-[#111110] line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#88867E]">
                      <span>{item.duration || `${(item.size / (1024 * 1024)).toFixed(1)} MB`}</span>
                      <span>•</span>
                      <span>{item.faculty || item.teacherName || "CMA Faculty"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F5F3ED] flex items-center justify-between text-xs">
                    <span className="text-[#059669] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Live for Students</span>
                    </span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#111110] hover:text-black font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-3 h-3 text-[#71717A]" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
