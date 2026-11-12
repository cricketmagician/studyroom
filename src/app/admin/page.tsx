"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  FileUp,
  Link2,
  Search,
  Trash2,
  Users,
  X,
  ShieldCheck,
  BookOpen,
  Clock,
  LogOut,
  Radio,
  Layers,
  ChevronRight,
  Sparkles,
  Play,
  FileText,
  Video,
  ExternalLink,
  GraduationCap,
  Filter,
  CheckCircle2,
  Calculator,
  ListChecks,
  Loader2,
  RefreshCw,
  LayoutDashboard,
  Menu,
  Plus,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { RequireRole, useAuth } from "@/lib/auth";
import { useMaterials } from "@/lib/hooks";
import { postAi } from "@/lib/ai-client";
import { checkFile, formatSize, titleFromFileName } from "@/lib/files";
import { deleteMaterial, Material, uploadMaterial } from "@/lib/materials";
import { duration, indiaWeek, LEVELS, SUBJECTS, StudyState } from "@/lib/cma";
import { SYLLABUS_DATA } from "@/lib/syllabus-data";
import { ErrorText, Logo } from "@/components/auth-card";
import { AdminAccess } from "@/components/admin-access";
import { StudentDossier } from "@/components/student-dossier";
import "@/components/study-hub.css";

type Student = StudyState & {
  id: string;
  name: string;
  email: string;
  joinedAt?: number;
  role?: string;
  phone?: string;
  city?: string;
  registrationNumber?: string;
  group?: string;
  coachingType?: string;
  attemptCount?: string;
  studyTimePreference?: string;
  instituteChapter?: string;
};

type Detail = {
  daily: { day: string; seconds: number }[];
  sessions: { subject: string; seconds: number; startedAt: number }[];
  checkins: { day: string }[];
  opened: { title: string; at: number }[];
};

export default function AdminPage() {
  return (
    <RequireRole role="teacher">
      <AdminWorkspace />
    </RequireRole>
  );
}

function AdminWorkspace() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { items, error: materialsError } = useMaterials();
  const [tab, setTab] = useState<"overview" | "publisher" | "shelf" | "students" | "admins">("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailError, setDetailError] = useState("");
  const detailRequest = useRef(0);

  // Materials Publisher Form States
  const [uploadKind, setUploadKind] = useState<"video" | "pdf">("video");
  const [source, setSource] = useState<"file" | "link">("file");
  const [selectedPaperId, setSelectedPaperId] = useState<string>("8");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [materialCategory, setMaterialCategory] = useState("Concept Lecture");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [customChapter, setCustomChapter] = useState("");
  const [videoDuration, setVideoDuration] = useState("45m");
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [publishError, setPublishError] = useState("");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // AI Generation on PDF Upload
  const [autoGenerateAi, setAutoGenerateAi] = useState(true);
  const [aiPromptPdf, setAiPromptPdf] = useState<{
    id: string;
    title: string;
    subject: string;
    paperCode: string;
    status: "idle" | "generating" | "ready" | "error";
    error?: string;
    summary?: string;
    quizCount?: number;
    flashcardCount?: number;
    formulaCount?: number;
    published?: boolean;
  } | null>(null);

  const triggerAiGeneration = async (
    pdfId: string,
    title: string,
    subject: string,
    paperCode: string
  ) => {
    setAiPromptPdf({
      id: pdfId,
      title,
      subject,
      paperCode,
      status: "generating",
    });

    try {
      await postAi("/api/ai/study-pack", {
        materialId: pdfId,
        regenerate: true,
      });

      const snap = await getDoc(doc(db, "materials", pdfId, "ai", "pack"));
      const data = snap.data();

      setAiPromptPdf({
        id: pdfId,
        title,
        subject,
        paperCode,
        status: "ready",
        summary: data?.summary || "",
        quizCount: Array.isArray(data?.quiz) ? data.quiz.length : 10,
        flashcardCount: Array.isArray(data?.flashcards) ? data.flashcards.length : 12,
        formulaCount: Array.isArray(data?.formulas) ? data.formulas.length : 0,
        published: data?.published ?? false,
      });
    } catch (err) {
      setAiPromptPdf((prev) =>
        prev
          ? {
              ...prev,
              status: "error",
              error: (err as Error).message || "AI generation failed. Please try again.",
            }
          : null
      );
    }
  };

  const publishAiPack = async (pdfId: string) => {
    try {
      await updateDoc(doc(db, "materials", pdfId, "ai", "pack"), { published: true });
      setAiPromptPdf((prev) => (prev ? { ...prev, published: true } : null));
      setMessage("Flashcards, MCQs and formulas are ready for students.");
    } catch (err) {
      setPublishError((err as Error).message);
    }
  };

  // Materials Shelf Filter States
  const [shelfPaperFilter, setShelfPaperFilter] = useState("All");
  const [shelfTypeFilter, setShelfTypeFilter] = useState<"all" | "video" | "pdf">("all");
  const [shelfSearch, setShelfSearch] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await postAi<{ students: Student[] }>("/api/study", { action: "admin" });
      setStudents(data.students);
      setNow(Date.now());
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(refresh, 0);
    const interval = setInterval(refresh, 30000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [refresh]);

  useEffect(() => {
    if (profile?.name && !facultyName) {
      setFacultyName(profile.name);
    }
  }, [profile, facultyName]);

  // Dynamic chapter suggestions from syllabus data for the selected paper
  const syllabusInfo = useMemo(() => {
    return SYLLABUS_DATA.find((s) => s.id === selectedPaperId);
  }, [selectedPaperId]);

  const chapterSuggestions = useMemo(() => {
    if (!syllabusInfo) return [];
    return syllabusInfo.sections.flatMap((sec) => sec.chapters);
  }, [syllabusInfo]);

  const handleSignOut = async () => {
    if (!confirm("Log out of the admin console?")) return;
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const openStudent = async (student: Student) => {
    const request = ++detailRequest.current;
    setSelected(student);
    setDetail(null);
    setDetailError("");
    try {
      const data = await postAi<Detail>("/api/study", { action: "detail", uid: student.id });
      if (detailRequest.current !== request) return;
      setDetail(data);
    } catch (err) {
      if (detailRequest.current === request) setDetailError((err as Error).message);
    }
    if (detailRequest.current === request) {
      document.getElementById("student-activity")?.focus({ preventScroll: true });
      document.getElementById("student-activity")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file && !materialTitle) {
      setMaterialTitle(titleFromFileName(file.name));
    }
  };

  const publish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    setPublishing(true);
    setProgress(0);
    setPublishError("");
    setMessage("");

    try {
      const subject = SUBJECTS.find((s) => s.id === selectedPaperId);
      const title = materialTitle.trim();
      if (!subject || !title || !user || !profile) {
        throw new Error("Add a title and choose a subject.");
      }

      const chapterToSave =
        selectedChapter === "custom"
          ? customChapter.trim()
          : selectedChapter || chapterSuggestions[0] || "";

      const metadata = {
        subjectId: subject.id,
        subject: subject.name,
        level: subject.level,
        paperCode: `Paper ${subject.id}`,
        chapter: chapterToSave,
        faculty: facultyName.trim() || profile.name || "CMA Faculty",
        duration: uploadKind === "video" ? videoDuration.trim() : "",
        category: materialCategory,
      };

      let createdId = "";
      if (source === "file") {
        if (!selectedFile) throw new Error("Choose a PDF or video file to upload.");
        const checked = checkFile(selectedFile);
        if ("error" in checked) throw new Error(checked.error);

        createdId = await uploadMaterial(
          selectedFile,
          uploadKind,
          title,
          { uid: user.uid, name: profile.name },
          setProgress,
          metadata
        );
      } else {
        const linkUrl = String(data.get("url") || "").trim();
        if (!linkUrl) throw new Error("Enter a valid HTTPS link.");

        const res = await postAi<{ id: string }>("/api/materials", {
          title,
          url: linkUrl,
          type: uploadKind,
          ...metadata,
        });
        createdId = res.id;
      }

      setMessage(`✓ “${title}” published successfully under Paper ${subject.id}: ${subject.name}!`);
      setMaterialTitle("");
      setSelectedFile(null);
      setCustomChapter("");
      formElement.reset();

      if (uploadKind === "pdf" && createdId) {
        if (autoGenerateAi) {
          triggerAiGeneration(createdId, title, subject.name, metadata.paperCode);
        } else {
          setAiPromptPdf({
            id: createdId,
            title,
            subject: subject.name,
            paperCode: metadata.paperCode,
            status: "idle",
          });
        }
      }
    } catch (err) {
      setPublishError((err as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const remove = async (material: Material) => {
    if (!confirm(`Delete "${material.title}"? Students will lose access.`)) return;
    setDeleting(material.id);
    setError("");
    try {
      await deleteMaterial(material);
      setMessage(`✓ "${material.title}" deleted.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  const filteredStudents = students.filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const studying = students.filter(
    (s) => s.active && now - s.active.last < 90000
  ).length;
  const totalStudySeconds = students.reduce(
    (sum, s) => sum + (s.totalSeconds || 0),
    0
  );

  // Filtered published materials list
  const filteredShelfMaterials = useMemo(() => {
    return (items ?? []).filter((m) => {
      if (shelfPaperFilter !== "All" && m.subjectId !== shelfPaperFilter) return false;
      if (shelfTypeFilter !== "all" && m.type !== shelfTypeFilter) return false;
      if (!shelfSearch.trim()) return true;
      const q = shelfSearch.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        (m.chapter && m.chapter.toLowerCase().includes(q)) ||
        (m.faculty && m.faculty.toLowerCase().includes(q)) ||
        (m.subject && m.subject.toLowerCase().includes(q))
      );
    });
  }, [items, shelfPaperFilter, shelfTypeFilter, shelfSearch]);

  const navItems = [
    { id: "overview" as const, label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "publisher" as const, label: "Upload", icon: <FileUp className="w-4 h-4" /> },
    { id: "shelf" as const, label: "Published", icon: <BookOpen className="w-4 h-4" />, badge: items?.length ?? 0 },
    { id: "students" as const, label: "Students", icon: <Users className="w-4 h-4" />, badge: students.length },
    { id: "admins" as const, label: "Admins", icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col md:flex-row">
      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-40 w-full bg-white/90 dark:bg-[#121211]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-3.5 sm:px-4 h-14 sm:h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Logo />
          <span className="px-2 py-0.5 rounded-full text-[13px] tabular-nums font-bold bg-[var(--brand)] text-[var(--on-brand)] shrink-0">
            ADMIN
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] tabular-nums bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span>{studying} Live</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/10 text-[var(--text-primary)] cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex">
          <div className="w-72 max-w-[85vw] bg-white dark:bg-[#141413] h-full p-4 sm:p-5 flex flex-col justify-between shadow-2xl border-r border-black/10 dark:border-white/10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Logo />
                  <span className="text-xs tabular-nums font-bold">Admin console</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-secondary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center font-bold text-xs">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="min-w-0">
                  <span className="font-apfel font-bold text-xs block truncate text-[var(--text-primary)]">
                    {profile?.name || "Admin"}
                  </span>
                  <span className="text-[13px] tabular-nums text-[var(--text-secondary)] block truncate">
                    {profile?.email || user?.email}
                  </span>
                </div>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-apfel font-bold cursor-pointer ${
                      tab === item.id
                        ? "bg-[var(--brand)] text-[var(--on-brand)]"
                        : "text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[13px] tabular-nums bg-black/10 dark:bg-white/10">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-2 pt-4 border-t border-black/5 dark:border-white/10">
              <Link
                href="/syllabus"
                className="flex items-center justify-between px-3 py-2 text-xs tabular-nums text-[var(--text-secondary)]"
              >
                <span>Syllabus</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 bg-white/75 dark:bg-[#121211]/80 backdrop-blur-2xl border-r border-black/5 dark:border-white/10 p-5 shrink-0 z-30">
        <div className="space-y-6">
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 px-1">
            <Logo />
            <div className="h-4 w-px bg-black/10 dark:bg-white/15" />
            <span className="px-2.5 py-0.5 rounded-full text-[13px] tabular-nums font-bold tracking-wider bg-[var(--brand)] text-[var(--on-brand)]">
              Admin console
            </span>
          </div>

          {/* Admin Profile Card */}
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center font-apfel font-bold text-sm shrink-0">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-apfel font-bold text-xs text-[var(--text-primary)] truncate">
                  {profile?.name || "Administrator"}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[13px] tabular-nums font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  Super
                </span>
              </div>
              <span className="text-[13px] tabular-nums text-[var(--text-secondary)] block truncate">
                {profile?.email || user?.email}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <span className="text-[13px] tabular-nums font-bold uppercase tracking-wider text-[var(--text-secondary)] px-2 block mb-2">
              Navigation
            </span>
            {navItems.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-apfel font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[var(--brand)] text-[var(--on-brand)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[13px] tabular-nums ${
                        active
                          ? "bg-white/20 text-[var(--on-brand)] dark:bg-black/15 font-bold"
                          : "bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs tabular-nums bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{studying} studying right now</span>
          </div>

          <Link
            href="/syllabus"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs tabular-nums text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Syllabus</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 w-full max-w-full min-w-0 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 overflow-x-hidden">
        {/* Mobile Horizontal Quick Navigation Bar */}
        <div className="md:hidden w-full overflow-x-auto pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1.5 min-w-max">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-apfel font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  tab === item.id
                    ? "bg-[var(--brand)] text-[var(--on-brand)] shadow-xs"
                    : "bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[13px] tabular-nums ${
                      tab === item.id
                        ? "bg-white/20 text-[var(--on-brand)] dark:bg-black/15 font-bold"
                        : "bg-black/10 dark:bg-white/10 text-[var(--text-secondary)]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Global Error Banner if any */}
        <ErrorText>{error || materialsError}</ErrorText>

        {/* TOP ACTION & BREADCRUMB BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-black/5 dark:border-white/10">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-apfel font-bold text-[var(--text-primary)] mt-1 tracking-tight break-words">
              {tab === "overview" && "Overview"}
              {tab === "publisher" && "Add a video or PDF"}
              {tab === "shelf" && "Published"}
              {tab === "students" && "Students"}
              {tab === "admins" && "Who can use admin"}
            </h1>
          </div>

          {/* Quick KPIs / Action in Top Bar */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[13px] sm:text-xs tabular-nums">
              <span className="text-[var(--text-secondary)]">Students:</span>
              <span className="font-bold text-[var(--text-primary)]">{students.length}</span>
              <span className="text-black/20 dark:text-white/20">|</span>
              <span className="text-[var(--text-secondary)]">Live:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{studying}</span>
            </div>

            {tab !== "publisher" && (
              <button
                type="button"
                onClick={() => setTab("publisher")}
                className="apple-glass-btn px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-apfel font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-5 sm:space-y-6">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="apple-glass-card p-3.5 sm:p-5 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13px] sm:text-[13px] tabular-nums uppercase tracking-wider text-[var(--text-secondary)] truncate">
                    Students
                  </span>
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)] shrink-0" />
                </div>
                <div className="text-2xl sm:text-3xl font-apfel font-bold text-[var(--text-primary)]">
                  {students.length}
                </div>
                <span className="text-[13px] sm:text-[13px] tabular-nums text-[var(--text-secondary)] block truncate">
                  Signed up
                </span>
              </div>

              <div className="apple-glass-card p-3.5 sm:p-5 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13px] sm:text-[13px] tabular-nums uppercase tracking-wider text-[var(--text-secondary)] truncate">
                    Studying Now
                  </span>
                  <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-apfel font-bold text-[var(--text-primary)]">
                  {studying}
                </div>
                <span className="text-[13px] sm:text-[13px] tabular-nums text-[var(--text-secondary)] block truncate">
                  Timer running now
                </span>
              </div>

              <div className="apple-glass-card p-3.5 sm:p-5 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13px] sm:text-[13px] tabular-nums uppercase tracking-wider text-[var(--text-secondary)] truncate">
                    Videos and PDFs
                  </span>
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)] shrink-0" />
                </div>
                <div className="text-2xl sm:text-3xl font-apfel font-bold text-[var(--text-primary)]">
                  {items?.length ?? 0}
                </div>
                <span className="text-[13px] sm:text-[13px] tabular-nums text-[var(--text-secondary)] block truncate">
                  Published
                </span>
              </div>

              <div className="apple-glass-card p-3.5 sm:p-5 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13px] sm:text-[13px] tabular-nums uppercase tracking-wider text-[var(--text-secondary)] truncate">
                    Hours studied
                  </span>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)] shrink-0" />
                </div>
                <div className="text-2xl sm:text-3xl font-apfel font-bold text-[var(--text-primary)]">
                  {duration(totalStudySeconds)}
                </div>
                <span className="text-[13px] sm:text-[13px] tabular-nums text-[var(--text-secondary)] block truncate">
                  By all students
                </span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setTab("publisher")}
                className="apple-glass-card p-5 text-left hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--brand)] group-hover:text-[var(--on-brand)] transition-colors">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-apfel font-bold text-sm text-[var(--text-primary)]">
                    Add a video or PDF →
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Upload it, and AI can make flashcards and MCQs.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTab("shelf")}
                className="apple-glass-card p-5 text-left hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--brand)] group-hover:text-[var(--on-brand)] transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-apfel font-bold text-sm text-[var(--text-primary)]">
                    See what is published →
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Search, open or delete your {items?.length ?? 0} videos and PDFs.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTab("students")}
                className="apple-glass-card p-5 text-left hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--brand)] group-hover:text-[var(--on-brand)] transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-apfel font-bold text-sm text-[var(--text-primary)]">
                    Students →
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    See each student’s details and study time.
                  </p>
                </div>
              </button>
            </div>

            {/* 2-Column Split: Recent Materials & Active Students */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left: Latest Published Materials (7 cols) */}
              <div className="lg:col-span-7 apple-glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-apfel font-bold text-base text-[var(--text-primary)]">
                      Recently Published Materials
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Latest items available to students in the library.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("shelf")}
                    className="text-xs tabular-nums font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all ({items?.length ?? 0})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!items || !items.length ? (
                  <div className="py-8 text-center text-xs tabular-nums text-[var(--text-secondary)]">
                    No materials published yet. Use Upload Content to publish your first video or PDF!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.slice(0, 4).map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              m.type === "video"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {m.type === "video" ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="font-apfel font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                              {m.title}
                            </h4>
                            <p className="text-[13px] tabular-nums text-[var(--text-secondary)] truncate">
                              {m.paperCode || `Paper ${m.subjectId || "?"}`} · {m.category || m.type.toUpperCase()} · {m.faculty || m.teacherName || "Admin"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {m.type === "pdf" && (
                            <button
                              type="button"
                              onClick={() => triggerAiGeneration(m.id, m.title, m.subject || "", m.paperCode || `Paper ${m.subjectId || "?"}`)}
                              className="text-[13px] tabular-nums font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>AI Pack</span>
                            </button>
                          )}
                          <Link
                            href={`/learn/${m.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Enrolled Students Overview (5 cols) */}
              <div className="lg:col-span-5 apple-glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-apfel font-bold text-base text-[var(--text-primary)]">
                      Enrolled Students ({students.length})
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Live focus status & progress.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("students")}
                    className="text-xs tabular-nums font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Students</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!students.length ? (
                  <div className="py-8 text-center text-xs tabular-nums text-[var(--text-secondary)]">
                    No students enrolled yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {students.slice(0, 5).map((s) => {
                      const isLive = s.active && now - s.active.last < 90000;
                      return (
                        <div
                          key={s.id}
                          onClick={() => { setTab("students"); openStudent(s); }}
                          className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-3 hover:border-black/20 dark:hover:border-white/20 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center font-bold text-xs shrink-0">
                                {s.name ? s.name.charAt(0).toUpperCase() : "S"}
                              </div>
                              {isLive && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111110]" />
                              )}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-apfel font-bold text-xs text-[var(--text-primary)] truncate">
                                  {s.name || "Student"}
                                </span>
                                {isLive && (
                                  <span className="text-[13px] tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                                    LIVE
                                  </span>
                                )}
                              </div>
                              <span className="text-[13px] tabular-nums text-[var(--text-secondary)] block truncate">
                                {s.level || "CMA"} · {duration(s.totalSeconds || 0)} logged
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTENT PUBLISHER */}
        {tab === "publisher" && (
          <div className="max-w-4xl space-y-6">
            <div className="apple-glass-card p-6 sm:p-8 space-y-6">
              <p className="text-sm text-[var(--text-secondary)]">
                Students will see it in their Library, under the paper you pick.
              </p>

              {/* AI Study Suite Generator (Flashcards, MCQs, Formulas) */}
              {aiPromptPdf && (
                <div className="relative overflow-hidden p-6 rounded-3xl bg-white/95 dark:bg-[#181816]/95 border-2 border-amber-500/30 dark:border-amber-400/30 shadow-2xl space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[13px] tabular-nums font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          AI STUDY SUITE
                        </span>
                        <span className="text-xs tabular-nums font-bold text-[var(--text-secondary)]">
                          {aiPromptPdf.paperCode} · {aiPromptPdf.subject}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-apfel font-bold text-[var(--text-primary)]">
                        {aiPromptPdf.status === "generating"
                          ? "AI is extracting Formulas, MCQs & Flashcards…"
                          : aiPromptPdf.status === "ready"
                          ? "🎉 AI Study Pack Ready for Students!"
                          : "Generate AI Flashcards, MCQs & Formulas"}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        PDF Document: <span className="font-semibold text-[var(--text-primary)]">{aiPromptPdf.title}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAiPromptPdf(null)}
                      className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] cursor-pointer"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 3 Core Modules */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Flashcards */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        aiPromptPdf.status === "ready"
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-4 h-4 text-orange-500" />
                        <h4 className="font-apfel font-bold text-xs text-[var(--text-primary)]">
                          ⚡ Flashcards
                        </h4>
                      </div>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-snug">
                        Front-back memory cards for concepts, provisions & definitions.
                      </p>
                      {aiPromptPdf.status === "ready" && (
                        <span className="mt-2 inline-block text-[13px] tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ {aiPromptPdf.flashcardCount ?? 12} Cards ready
                        </span>
                      )}
                    </div>

                    {/* 2. MCQs Quiz */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        aiPromptPdf.status === "ready"
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ListChecks className="w-4 h-4 text-blue-500" />
                        <h4 className="font-apfel font-bold text-xs text-[var(--text-primary)]">
                          📝 Exam MCQs
                        </h4>
                      </div>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-snug">
                        10 practice questions with 4 options & page reference explanations.
                      </p>
                      {aiPromptPdf.status === "ready" && (
                        <span className="mt-2 inline-block text-[13px] tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ {aiPromptPdf.quizCount ?? 10} MCQs ready
                        </span>
                      )}
                    </div>

                    {/* 3. Formulas */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        aiPromptPdf.status === "ready"
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Calculator className="w-4 h-4 text-purple-500" />
                        <h4 className="font-apfel font-bold text-xs text-[var(--text-primary)]">
                          📐 Formula Sheet
                        </h4>
                      </div>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-snug">
                        Mathematical, costing, tax & financial formulas with variable guides.
                      </p>
                      {aiPromptPdf.status === "ready" && (
                        <span className="mt-2 inline-block text-[13px] tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ {aiPromptPdf.formulaCount ?? 6} Formulas extracted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Generating Live Loader */}
                  {aiPromptPdf.status === "generating" && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500 shrink-0" />
                        <span>
                          Google Gemini is reading your PDF, extracting formulas, authoring 10 MCQs, and creating revision flashcards…
                        </span>
                      </div>
                      <span className="text-[13px] tabular-nums text-[var(--text-secondary)] shrink-0 hidden sm:inline">
                        ~15-30s
                      </span>
                    </div>
                  )}

                  {/* Error View */}
                  {aiPromptPdf.status === "error" && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300">
                        {aiPromptPdf.error}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          triggerAiGeneration(
                            aiPromptPdf.id,
                            aiPromptPdf.title,
                            aiPromptPdf.subject,
                            aiPromptPdf.paperCode
                          )
                        }
                        className="apple-glass-btn px-5 py-2.5 text-xs font-bold font-apfel cursor-pointer inline-flex items-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Try generating again</span>
                      </button>
                    </div>
                  )}

                  {/* Ready State */}
                  {aiPromptPdf.status === "ready" && (
                    <div className="space-y-3 pt-1">
                      {aiPromptPdf.summary && (
                        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs text-[var(--text-secondary)] line-clamp-3">
                          <span className="font-bold text-[var(--text-primary)]">Summary: </span>
                          {aiPromptPdf.summary}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2.5">
                        {!aiPromptPdf.published ? (
                          <button
                            type="button"
                            onClick={() => publishAiPack(aiPromptPdf.id)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-apfel font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Publish for students</span>
                          </button>
                        ) : (
                          <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 tabular-nums text-xs font-bold inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Published. Students can see it now.</span>
                          </div>
                        )}

                        <Link
                          href={`/learn/${aiPromptPdf.id}`}
                          target="_blank"
                          className="apple-glass-btn px-5 py-2.5 text-xs font-bold font-apfel inline-flex items-center gap-1.5"
                        >
                          <span>Open player and AI tools</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setAiPromptPdf(null)}
                          className="px-4 py-2.5 text-xs tabular-nums text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Idle Prompt State */}
                  {aiPromptPdf.status === "idle" && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          triggerAiGeneration(
                            aiPromptPdf.id,
                            aiPromptPdf.title,
                            aiPromptPdf.subject,
                            aiPromptPdf.paperCode
                          )
                        }
                        className="apple-glass-btn px-6 py-3 text-xs sm:text-sm font-apfel font-bold cursor-pointer inline-flex items-center gap-2 shadow-md"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Make flashcards, MCQs and formulas with AI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiPromptPdf(null)}
                        className="px-4 py-3 text-xs tabular-nums text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        Skip for now
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={publish} className="space-y-5">
                
                {/* 1. Format Selection: Video vs PDF */}
                <div>
                  <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)] mb-2">
                    What are you adding?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadKind("video");
                        setMaterialCategory("Concept Lecture");
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        uploadKind === "video"
                          ? "bg-[var(--brand)] text-[var(--on-brand)] border-[color:var(--brand)] shadow-md"
                          : "apple-glass-tile border-black/10 dark:border-white/10"
                      }`}
                    >
                      <Video className="w-5 h-5 shrink-0" />
                      <div>
                        <div className="font-apfel font-bold text-sm">Video Lecture</div>
                        <div className="text-[13px] tabular-nums opacity-75">MP4, WebM, or YouTube Link</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadKind("pdf");
                        setMaterialCategory("Comprehensive Chapter Notes");
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        uploadKind === "pdf"
                          ? "bg-[var(--brand)] text-[var(--on-brand)] border-[color:var(--brand)] shadow-md"
                          : "apple-glass-tile border-black/10 dark:border-white/10"
                      }`}
                    >
                      <FileText className="w-5 h-5 shrink-0" />
                      <div>
                        <div className="font-apfel font-bold text-sm">PDF Document</div>
                        <div className="text-[13px] tabular-nums opacity-75">Chapter Notes, Formulas, RTP</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Source Method: File Upload vs Link */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/10 w-full sm:w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setSource("file");
                      setPublishError("");
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs tabular-nums font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      source === "file"
                        ? "bg-[var(--brand)] text-[var(--on-brand)] shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Upload a file (up to 300 MB)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSource("link");
                      setPublishError("");
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs tabular-nums font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      source === "link"
                        ? "bg-[var(--brand)] text-[var(--on-brand)] shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Paste a link (YouTube, Drive)</span>
                  </button>
                </div>

                {/* 3. Subject & Paper Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)] mb-1.5">
                      Paper
                    </label>
                    <select
                      value={selectedPaperId}
                      onChange={(e) => {
                        setSelectedPaperId(e.target.value);
                        setSelectedChapter("");
                      }}
                      className="w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 p-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)]"
                    >
                      <optgroup label="CMA Intermediate - Group 1">
                        <option value="5">Paper 5 · Business Laws and Ethics</option>
                        <option value="6">Paper 6 · Financial Accounting</option>
                        <option value="7">Paper 7 · Direct and Indirect Taxation</option>
                        <option value="8">Paper 8 · Cost Accounting</option>
                      </optgroup>
                      <optgroup label="CMA Intermediate - Group 2">
                        <option value="9">Paper 9 · Operations & Strategic Mgmt</option>
                        <option value="10">Paper 10 · Corporate Accounting & Auditing</option>
                        <option value="11">Paper 11 · Financial Management & BDA</option>
                        <option value="12">Paper 12 · Management Accounting</option>
                      </optgroup>
                      <optgroup label="CMA Final - Group 3">
                        <option value="13">Paper 13 · Corporate & Economic Laws</option>
                        <option value="14">Paper 14 · Strategic Financial Mgmt (SFM)</option>
                        <option value="15">Paper 15 · Direct Tax Laws & International Tax</option>
                        <option value="16">Paper 16 · Strategic Cost Management (SCM)</option>
                      </optgroup>
                      <optgroup label="CMA Final - Group 4">
                        <option value="17">Paper 17 · Cost & Management Audit</option>
                        <option value="18">Paper 18 · Corporate Financial Reporting (CFR)</option>
                        <option value="19">Paper 19 · Indirect Tax Laws & Practice</option>
                        <option value="20A">Paper 20A · Strategic Performance Mgmt</option>
                        <option value="20B">Paper 20B · Risk Mgmt in Banking & Insurance</option>
                        <option value="20C">Paper 20C · Entrepreneurship & Startups</option>
                      </optgroup>
                      <optgroup label="CMA Foundation">
                        <option value="1">Paper 1 · Fundamentals of Business Laws</option>
                        <option value="2">Paper 2 · Fundamentals of Financial Accounting</option>
                        <option value="3">Paper 3 · Fundamentals of Business Maths & Stats</option>
                        <option value="4">Paper 4 · Fundamentals of Business Economics</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* 4. Category Tag */}
                  <div>
                    <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)] mb-1.5">
                      Type
                    </label>
                    <select
                      value={materialCategory}
                      onChange={(e) => setMaterialCategory(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 p-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)]"
                    >
                      {uploadKind === "video" ? (
                        <>
                          <option value="Concept Lecture">Concept Lecture</option>
                          <option value="Fast-Track Marathon">Fast-Track Marathon</option>
                          <option value="Problem Solving & Practical">Problem Solving & Practical</option>
                          <option value="Past Paper / RTP Discussion">Past Paper / RTP Discussion</option>
                          <option value="Exam Strategy & Tips">Exam Strategy & Tips</option>
                        </>
                      ) : (
                        <>
                          <option value="Comprehensive Chapter Notes">Comprehensive Chapter Notes</option>
                          <option value="Formula Book & Formats">Formula Book & Formats</option>
                          <option value="Past 5 Years Questions & Solutions">Past 5 Years Questions & Solutions</option>
                          <option value="RTP / MTP Mock Papers">RTP / MTP Mock Papers</option>
                          <option value="Quick Revision Handouts">Quick Revision Handouts</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* 5. Chapter / Module Autocomplete */}
                <div>
                  <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)] mb-1.5">
                    Chapter
                  </label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 p-3 text-xs sm:text-sm font-medium"
                  >
                    <option value="">Choose a chapter</option>
                    {chapterSuggestions.map((chap, idx) => (
                      <option key={idx} value={chap}>
                        {chap}
                      </option>
                    ))}
                    <option value="custom">Type your own chapter…</option>
                  </select>

                  {selectedChapter === "custom" && (
                    <div className="apple-glass-input-wrapper px-4 py-2.5 mt-2">
                      <input
                        type="text"
                        placeholder="Chapter name, like Standard Costing"
                        value={customChapter}
                        onChange={(e) => setCustomChapter(e.target.value)}
                        className="text-xs sm:text-sm font-semibold"
                      />
                    </div>
                  )}
                </div>

                {/* 6. Title Field */}
                <div>
                  <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)] mb-1.5">
                    Title
                  </label>
                  <div className="apple-glass-input-wrapper px-4 py-3">
                    <input
                      name="title"
                      required
                      maxLength={200}
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      placeholder="Like Marginal Costing: full lecture"
                      className="text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* 7. Faculty and Duration Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)] mb-1.5">
                      Teacher name
                    </label>
                    <div className="apple-glass-input-wrapper px-4 py-2.5">
                      <input
                        type="text"
                        placeholder="e.g. CMA Nihal Kumar"
                        value={facultyName}
                        onChange={(e) => setFacultyName(e.target.value)}
                        className="text-xs sm:text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {uploadKind === "video" && (
                    <div>
                      <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)] mb-1.5">
                        Video length
                      </label>
                      <div className="apple-glass-input-wrapper px-4 py-2.5">
                        <input
                          type="text"
                          placeholder="Like 45 min or 1h 20m"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                          className="text-xs sm:text-sm font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 8. File Input or Web Link Input */}
                {source === "file" ? (
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2">
                    <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)]">
                      {uploadKind === "video" ? "Select Video File (.mp4, .webm, .mov, max 300MB)" : "Select PDF Document (max 50MB)"}
                    </label>
                    <input
                      name="file"
                      required
                      type="file"
                      accept={uploadKind === "video" ? ".mp4,.webm,.mov,.m4v,.mkv" : ".pdf"}
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                      className="w-full text-xs file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:font-bold file:bg-[var(--brand)] file:text-[var(--on-brand)] cursor-pointer"
                    />
                    {selectedFile && (
                      <div className="text-[13px] tabular-nums text-[var(--text-secondary)] flex items-center justify-between pt-1">
                        <span>Selected: {selectedFile.name}</span>
                        <span>{formatSize(selectedFile.size)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs tabular-nums uppercase font-bold text-[var(--text-secondary)] mb-1.5">
                      {uploadKind === "video"
                        ? "Public Video Link (YouTube, Vimeo, Google Drive)"
                        : "Public PDF Link (Google Drive, Cloud Storage)"}
                    </label>
                    <div className="apple-glass-input-wrapper px-4 py-3">
                      <input
                        name="url"
                        required
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/..."
                        className="text-sm font-semibold"
                      />
                    </div>
                    <span className="block text-[13px] tabular-nums text-[var(--text-secondary)] mt-1.5">
                      YouTube videos will be embedded seamlessly in a high-resolution 16:9 player for students.
                    </span>
                  </div>
                )}

                {/* Auto AI Toggle for PDFs */}
                {uploadKind === "pdf" && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="auto-ai-toggle"
                      checked={autoGenerateAi}
                      onChange={(e) => setAutoGenerateAi(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="auto-ai-toggle" className="text-xs cursor-pointer select-none space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold font-apfel text-[var(--text-primary)]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Make flashcards, 10 MCQs and a formula sheet with AI after upload</span>
                      </div>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        PDF upload complete hote hi Google Gemini AI automatically important formulas extract karega, 10 exam MCQs banayega aur revision flashcards tayyar karega.
                      </p>
                    </label>
                  </div>
                )}

                {/* Upload Button & Animated Progress */}
                <button
                  type="submit"
                  disabled={publishing}
                  className="apple-glass-btn w-full py-4 text-sm font-apfel font-bold cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  {publishing ? (
                    progress > 0 && progress < 100 ? (
                      `Uploading to Cloud Storage (${progress}%)…`
                    ) : (
                      "Publishing to Student Library…"
                    )
                  ) : (
                    <>
                      {uploadKind === "video" ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      <span>Publish {uploadKind === "video" ? "Video Lecture" : "PDF Notes"}</span>
                    </>
                  )}
                </button>

                {publishing && source === "file" && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs tabular-nums">
                      <span>Uploading file…</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-[var(--brand)] transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <ErrorText>{publishError}</ErrorText>
                {message && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: PUBLISHED SHELF / LIBRARY */}
        {tab === "shelf" && (
          <div className="apple-glass-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <span className="text-xs tabular-nums font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  CMA STUDY REPOSITORY
                </span>
                <h2 className="text-xl sm:text-2xl font-apfel font-bold text-[var(--text-primary)] mt-1">
                  Published Library ({items?.length ?? 0} Items)
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  Live across all enrolled students’ portal and syllabus blueprints.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTab("publisher")}
                className="apple-glass-btn px-5 py-2.5 text-xs font-apfel font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add a video or PDF</span>
              </button>
            </div>

            {/* Shelf Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={shelfPaperFilter}
                onChange={(e) => setShelfPaperFilter(e.target.value)}
                className="w-full sm:w-72 rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 p-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)]"
              >
                <option value="All">All subjects</option>
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    Paper {s.id} · {s.name}
                  </option>
                ))}
              </select>

              <select
                value={shelfTypeFilter}
                onChange={(e) => setShelfTypeFilter(e.target.value as any)}
                className="w-full sm:w-36 rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 p-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)]"
              >
                <option value="all">All types</option>
                <option value="video">Videos</option>
                <option value="pdf">PDFs</option>
              </select>

              <div className="apple-glass-input-wrapper flex-1 flex items-center px-4 py-3 gap-2 w-full">
                <Search className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                <input
                  type="search"
                  placeholder="Search title, chapter, teacher or paper"
                  value={shelfSearch}
                  onChange={(e) => setShelfSearch(e.target.value)}
                  className="flex-1 text-xs sm:text-sm font-medium placeholder:text-[var(--text-muted)]"
                />
                {shelfSearch && (
                  <button
                    type="button"
                    onClick={() => setShelfSearch("")}
                    className="text-[13px] tabular-nums text-[var(--text-secondary)]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Published Items Grid */}
            {!items ? (
              <div className="py-16 text-center text-xs tabular-nums text-[var(--text-secondary)]">
                Loading published materials…
              </div>
            ) : !filteredShelfMaterials.length ? (
              <div className="py-16 text-center text-xs text-[var(--text-secondary)] border border-dashed border-black/10 dark:border-white/10 rounded-3xl p-8 space-y-2">
                <p className="font-semibold text-sm">Nothing matches</p>
                <p>Choose All subjects or clear the search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShelfMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-5 rounded-3xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-3.5 transition-all hover:border-black/20 dark:hover:border-white/20 hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[13px] tabular-nums font-bold flex items-center gap-1.5 ${
                              mat.type === "video"
                                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {mat.type === "video" ? <Video className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                            <span>{mat.type.toUpperCase()}</span>
                          </span>

                          <span className="text-[13px] tabular-nums font-bold px-2.5 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-[var(--text-primary)]">
                            {mat.paperCode || `Paper ${mat.subjectId || "?"}`}
                          </span>

                          {mat.category && (
                            <span className="text-[13px] tabular-nums text-[var(--text-secondary)] truncate">
                              · {mat.category}
                            </span>
                          )}
                        </div>

                        {mat.teacherId === user?.uid && (
                          <button
                            type="button"
                            disabled={deleting !== null}
                            onClick={() => remove(mat)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                            title="Delete this material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <h4 className="font-apfel font-bold text-sm text-[var(--text-primary)] leading-snug line-clamp-2">
                          {mat.title}
                        </h4>
                        {mat.chapter && (
                          <p className="text-[13px] tabular-nums text-[var(--text-secondary)] mt-1 truncate">
                            Module: {mat.chapter}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs tabular-nums text-[var(--text-secondary)] pt-3 border-t border-black/5 dark:border-white/5">
                      <span className="truncate pr-2">
                        {mat.faculty ? `By ${mat.faculty}` : `By ${mat.teacherName || "Admin"}`}
                        {mat.duration ? ` · ${mat.duration}` : mat.size > 0 ? ` · ${formatSize(mat.size)}` : ""}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        {mat.type === "pdf" && (
                          <button
                            type="button"
                            onClick={() =>
                              triggerAiGeneration(
                                mat.id,
                                mat.title,
                                mat.subject || "",
                                mat.paperCode || `Paper ${mat.subjectId || "?"}`
                              )
                            }
                            className="text-[13px] tabular-nums font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            title="Make or update flashcards, MCQs and formulas with AI"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>AI Pack</span>
                          </button>
                        )}

                        <Link
                          href={`/learn/${mat.id}`}
                          target="_blank"
                          className="text-[13px] font-semibold text-[var(--text-primary)] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENTS ROSTER */}
        {tab === "students" && (
          <div className="space-y-6">
            <div className="apple-glass-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-apfel font-bold text-[var(--text-primary)]">
                    Enrolled Students
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    Real-time study times, login check-ins, and active subjects.
                  </p>
                </div>

                <div className="apple-glass-input-wrapper flex items-center px-4 py-2.5 gap-2 w-full sm:w-80">
                  <Search className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  <input
                    type="search"
                    placeholder="Search name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 text-xs sm:text-sm font-medium placeholder:text-[var(--text-muted)]"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="text-xs tabular-nums text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-sm text-[var(--text-secondary)] tabular-nums">
                  Loading student roster…
                </div>
              ) : !filteredStudents.length ? (
                <div className="p-12 text-center space-y-3 border border-dashed border-black/10 dark:border-white/15 rounded-2xl">
                  <Users className="w-8 h-8 mx-auto text-[var(--text-secondary)]" />
                  <h3 className="font-apfel font-bold text-lg text-[var(--text-primary)]">
                    {students.length ? "No matching students found" : "No students registered yet"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                    {students.length
                      ? "Try searching with a different name or email address."
                      : "New student registrations will appear here automatically."}
                  </p>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="apple-glass-btn px-4 py-2 text-xs font-apfel font-bold"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full overflow-x-auto -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[620px] text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 dark:border-white/10 text-[13px] tabular-nums uppercase text-[var(--text-secondary)]">
                        <th className="py-3 px-4 font-bold">Student</th>
                        <th className="py-3 px-4 font-bold">CMA Level</th>
                        <th className="py-3 px-4 font-bold">Role</th>
                        <th className="py-3 px-4 font-bold">Check-ins</th>
                        <th className="py-3 px-4 font-bold">Focus Time</th>
                        <th className="py-3 px-4 font-bold">Studying now</th>
                        <th className="py-3 px-4 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5 font-sans">
                      {filteredStudents.map((student) => {
                        const isLive = student.active && now - student.active.last < 90000;
                        const subjectName = student.active?.subject
                          ? SUBJECTS.find((s) => s.id === student.active?.subject)?.name
                          : null;

                        return (
                          <tr
                            key={student.id}
                            onClick={() => openStudent(student)}
                            className={`transition-colors cursor-pointer ${
                              selected?.id === student.id
                                ? "bg-black/5 dark:bg-white/10"
                                : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                                  {student.name ? student.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm text-[var(--text-primary)] truncate">
                                    {student.name || "Unnamed Student"}
                                  </div>
                                  <div className="text-xs tabular-nums text-[var(--text-secondary)] truncate">
                                    {student.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-full text-[13px] tabular-nums font-bold bg-black/5 dark:bg-white/10 text-[var(--text-primary)]">
                                {student.level ? `CMA ${student.level}` : "Not Selected"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[13px] tabular-nums font-bold ${
                                student.role === "teacher"
                                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                                  : "bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]"
                              }`}>
                                {student.role === "teacher" ? "Teacher" : "Student"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 tabular-nums text-xs">
                              <div className="font-bold text-[var(--text-primary)]">
                                {student.checkinCount ?? 0} days
                              </div>
                              <div className="text-[13px] text-[var(--text-secondary)]">
                                {student.lastCheckin ? `Last: ${student.lastCheckin}` : "No check-in"}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 tabular-nums text-xs">
                              <div className="font-bold text-[var(--text-primary)]">
                                {duration(student.totalSeconds)}
                              </div>
                              <div className="text-[13px] text-[var(--text-secondary)]">All-time</div>
                            </td>

                            <td className="py-3.5 px-4">
                              {isLive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs tabular-nums font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                                  Studying {subjectName || "Subject"}
                                </span>
                              ) : (
                                <span className="text-xs text-[var(--text-secondary)] line-clamp-1">
                                  {student.lastMaterial || "No active session"}
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => openStudent(student)}
                                className="px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Selected Student Activity Dossier (Precedents: Duolingo, SchoolAI, Uxcel, Codecademy) */}
            {selected && (
              <StudentDossier
                student={selected}
                detail={detail}
                detailError={detailError}
                now={now}
                onClose={() => {
                  detailRequest.current++;
                  setSelected(null);
                }}
              />
            )}
          </div>
        )}

        {/* TAB 3: ADMIN ACCESS */}
        {tab === "admins" && (
          <div className="max-w-2xl mx-auto">
            <div className="apple-glass-card p-6 sm:p-8">
              <AdminAccess onChanged={() => void refresh()} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
