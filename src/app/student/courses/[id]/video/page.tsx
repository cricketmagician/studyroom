"use client";

import React, { useState, useRef, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store/app-store";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronRight,
  ArrowLeft,
  FileText,
  Bookmark,
  Plus,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Share2,
  MessageSquare,
  List
} from "lucide-react";

function VideoLearningContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { courses, lessons, resources, watchProgress, updateWatchProgress, notes, addNote } = useApp();

  const course = courses.find((c) => c.id === courseId) || courses[0];
  const lesson = lessons.find((l) => l.course_id === course.id && l.lesson_type === "video") || lessons[0];
  const resource = resources.find((r) => r.lesson_id === lesson.id && r.resource_type === "video") || resources[0];

  // Video element ref & state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(1110); // default to 18:30 matching screenshot 2
  const [duration, setDuration] = useState(2421); // 40:21 matching screenshot 2
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chapters" | "notes" | "resources">("chapters");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [bookmarkedTimes, setBookmarkedTimes] = useState<number[]>([15, 383, 1110]);

  // Load previous watch progress
  useEffect(() => {
    const wp = watchProgress[lesson.id];
    if (wp && wp.last_timestamp_seconds > 0) {
      setCurrentTime(wp.last_timestamp_seconds);
      if (videoRef.current) {
        videoRef.current.currentTime = wp.last_timestamp_seconds;
      }
    }
  }, [lesson.id, watchProgress]);

  // Video time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Save progress periodically
    if (Math.floor(time) % 5 === 0) {
      updateWatchProgress(lesson.id, resource.id, time, videoRef.current.duration || duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      setDuration(videoRef.current.duration);
    }
    const wp = watchProgress[lesson.id];
    if (wp && wp.last_timestamp_seconds > 0) {
      videoRef.current.currentTime = wp.last_timestamp_seconds;
      setCurrentTime(wp.last_timestamp_seconds);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById("video-theater-container");
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    addNote({
      course_id: course.id,
      lesson_id: lesson.id,
      timestamp_seconds: Math.floor(currentTime),
      content: newNoteContent,
      tags: ["lecture-note"]
    });
    setNewNoteContent("");
  };

  const toggleBookmarkCurrentTime = () => {
    const currentSec = Math.floor(currentTime);
    if (bookmarkedTimes.includes(currentSec)) {
      setBookmarkedTimes(bookmarkedTimes.filter(t => t !== currentSec));
    } else {
      setBookmarkedTimes([...bookmarkedTimes, currentSec]);
    }
  };

  // Format seconds into MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const totalSecs = Math.floor(secs);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const chapters = resource.chapters || [
    { id: "c1", title: "Introduction", timestamp_seconds: 15, description: "Unique challenges and considerations in managing digital projects." },
    { id: "c2", title: "Project Initiation and Setup", timestamp_seconds: 383, description: "Identifying project goals, scope, and building team roles." },
    { id: "c3", title: "Running the Project", timestamp_seconds: 1308, description: "Agile vs. Waterfall methodologies: Choosing the right approach." },
  ];

  const lessonNotes = notes.filter((n) => n.lesson_id === lesson.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/student/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {course.code} Curriculum</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/student/courses/${course.id}/pdf`}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Open Related Monograph</span>
          </Link>
        </div>
      </div>

      {/* Main Video Learning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Video Theater & Player Controls */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Theater View Container (Matches Screenshot 2 layout) */}
          <div
            id="video-theater-container"
            className="rounded-3xl overflow-hidden bg-black aspect-video relative flex flex-col justify-end group shadow-2xl border border-[var(--border-color)]"
          >
            <video
              ref={videoRef}
              src={resource.file_url}
              poster="/instructor-video.jpg"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
              playsInline
            />

            {/* Centered Play Button Overlay when paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center cursor-pointer transition-opacity"
              >
                <div className="w-16 h-16 rounded-full bg-white/95 text-[var(--text-primary)] flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                  <Play className="w-7 h-7 text-[var(--accent)] fill-[var(--accent)] ml-1" />
                </div>
              </div>
            )}

            {/* Bottom Scrubber & Controls Overlay (Matches Reference Image 2!) */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2.5 text-white transition-opacity">
              
              {/* Scrub Progress Bar */}
              <div className="relative flex items-center group/scrubber cursor-pointer">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
                />
              </div>

              {/* Control Buttons & Timestamp readout */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-[var(--accent)] transition-colors"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <button
                    onClick={() => seekTo(Math.max(0, currentTime - 10))}
                    className="p-1 hover:text-[var(--accent)] transition-colors"
                    title="Rewind 10 seconds"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button onClick={toggleMute} className="p-1 hover:text-[var(--accent)]">
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setVolume(v);
                        if (videoRef.current) videoRef.current.volume = v;
                        setIsMuted(v === 0);
                      }}
                      className="w-16 h-1 bg-white/30 rounded-full appearance-none accent-white"
                    />
                  </div>

                  {/* Timestamp Display (Matches Screenshot 2: "18:30 / 40:21") */}
                  <div className="font-mono text-xs text-white/90 font-medium pl-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSpeedChange}
                    className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white font-mono text-[11px] font-semibold transition-colors"
                    title="Cycle Playback Speed"
                  >
                    {playbackSpeed}x
                  </button>

                  <button
                    onClick={toggleBookmarkCurrentTime}
                    className={`p-1 transition-colors ${
                      bookmarkedTimes.includes(Math.floor(currentTime))
                        ? "text-[var(--accent)] fill-[var(--accent)]"
                        : "hover:text-[var(--accent)]"
                    }`}
                    title="Bookmark this moment"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-1 hover:text-[var(--accent)] transition-colors"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Metadata & Instructor Info */}
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[var(--accent)]">
                  {course.code} · Lesson 01
                </span>
                <h1 className="text-xl font-heading font-bold text-[var(--text-primary)] mt-0.5">
                  {lesson.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateWatchProgress(lesson.id, resource.id, duration, duration, true);
                    alert("Lesson marked as completed!");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {lesson.description}
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=260"
                alt="Instructor"
                className="w-9 h-9 rounded-full object-cover border border-[var(--border-color)]"
              />
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  Prof. Marcus Vance, Ph.D.
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Senior Lecturer, Interaction Systems Architecture
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chapters, Timestamped Notes & Resources */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 shadow-sm space-y-4">
            
            {/* Tab switch */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-medium">
              <button
                onClick={() => setActiveTab("chapters")}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === "chapters"
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                In this lesson
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === "notes"
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                My Notes ({lessonNotes.length})
              </button>
            </div>

            {/* TAB: CHAPTERS (Matches Reference Image 2!) */}
            {activeTab === "chapters" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">Lesson Chapters</span>
                  <span className="text-[11px]">{chapters.length} segments</span>
                </div>

                <div className="space-y-2">
                  {chapters.map((ch, idx) => {
                    const isCurrent =
                      currentTime >= ch.timestamp_seconds &&
                      (idx === chapters.length - 1 || currentTime < chapters[idx + 1].timestamp_seconds);

                    return (
                      <div
                        key={ch.id}
                        onClick={() => seekTo(ch.timestamp_seconds)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          isCurrent
                            ? "bg-[var(--accent-light)] border-[var(--accent)]/40 shadow-xs"
                            : "bg-[var(--bg-primary)]/50 border-[var(--border-color)] hover:border-[var(--accent)]/30"
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className={isCurrent ? "text-[var(--accent-text)]" : "text-[var(--text-primary)]"}>
                            {ch.title}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--accent)]">
                            {formatTime(ch.timestamp_seconds)}
                          </span>
                        </div>
                        {ch.description && (
                          <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                            {ch.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: NOTES (Timestamp-linked notes) */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">Add Note</span>
                    <span className="font-mono text-[11px] text-[var(--accent)] font-semibold">
                      at {formatTime(currentTime)}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Take notes linked to current timestamp..."
                    className="w-full text-xs p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold transition-all shadow-xs"
                  >
                    Save Note at {formatTime(currentTime)}
                  </button>
                </form>

                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] max-h-72 overflow-y-auto">
                  {lessonNotes.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] text-center py-4">
                      No notes yet for this lesson. Notes you create are timestamp-linked!
                    </p>
                  ) : (
                    lessonNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => note.timestamp_seconds !== undefined && seekTo(note.timestamp_seconds)}
                            className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-text)] border border-[var(--accent)]/30 hover:underline"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(note.timestamp_seconds || 0)}</span>
                          </button>
                          <span className="text-[10px] text-[var(--text-secondary)]">
                            {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-primary)] leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function VideoLearningEnvironmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--text-secondary)]">Loading video session...</div>}>
      <VideoLearningContent params={params} />
    </Suspense>
  );
}
