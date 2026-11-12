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
  Layers,
  Sparkles,
  FileText,
  Video,
  ExternalLink,
  CheckCircle2,
  Calculator,
  ListChecks,
  Loader2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { RequireRole, useAuth } from "@/lib/auth";
import { useMaterials } from "@/lib/hooks";
import { postAi } from "@/lib/ai-client";
import { checkFile, formatSize, titleFromFileName } from "@/lib/files";
import { deleteMaterial, Material, uploadMaterial } from "@/lib/materials";
import { duration, SUBJECTS, StudyState } from "@/lib/cma";
import { SYLLABUS_DATA } from "@/lib/syllabus-data";
import { ErrorText, Logo, LogoMark } from "@/components/auth-card";
import { ArrowSquareOut as PArrowSquare, Books as PBooks, Broadcast as PBroadcast, CaretRight as PCaret, Clock as PClock, FilePdf as PFilePdf, Fire as PFire, House as PHome, Play as PPlay, Plus as PPlus, ShieldCheck as PShield, SignOut as PSignOut, Sparkle as PSparkle, UsersThree as PUsers } from "@phosphor-icons/react";
import "./admin.css";
import { useScrollChrome } from "@/lib/use-scroll-chrome";
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


  const first = (profile?.name ?? "Teacher").split(" ")[0];
  const hour = new Date(now).getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const weekAgo = now - 7 * 86400000;
  const millis = (v: unknown) => (typeof (v as { toMillis?: () => number })?.toMillis === "function" ? (v as { toMillis: () => number }).toMillis() : Number(v) || 0);
  const newStudents = students.filter((s) => (s.joinedAt ?? 0) > weekAgo).length;
  const newItems = (items ?? []).filter((m) => millis(m.createdAt) > weekAgo).length;
  const liveList = students.filter((s) => s.active && now - s.active.last < 90000);
  const streakers = [...students].filter((s) => (s.streak ?? 0) > 0).sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0)).slice(0, 5);
  const ago = (t: number) => { const m = Math.max(1, Math.round((now - t) / 60000)); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
  const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const TITLES = { overview: "Overview", publisher: "Add a video or PDF", shelf: "Published", students: "Students", admins: "Admins" } as const;
  const NAV = [
    { id: "overview" as const, label: "Home", icon: PHome },
    { id: "students" as const, label: "Students", icon: PUsers, badge: students.length },
    { id: "publisher" as const, label: "Upload", icon: PPlus },
    { id: "shelf" as const, label: "Published", icon: PBooks, badge: items?.length ?? 0 },
    { id: "admins" as const, label: "Admins", icon: PShield },
  ];
  const go = (id: typeof tab) => { setTab(id); window.scrollTo({ top: 0 }); };
  const tucked = useScrollChrome();

  return (
    <div className="cma adm">
      {/* Desktop sidebar */}
      <aside className="adm-side" aria-label="Admin menu">
        <Logo />
        <span className="adm-side-tag">Teacher console</span>
        <nav>
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => go(id)}>
              <Icon size={21} weight={tab === id ? "fill" : "duotone"} aria-hidden="true" />{label === "Home" ? "Overview" : label}
              {!!badge && <span className="adm-badge">{badge}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <Link href="/" className="adm-side-link"><PArrowSquare size={18} aria-hidden="true" />Open student app</Link>
          <div className="adm-me">
            <span className="adm-avatar tint" data-tint="green">{initials(profile?.name ?? "T")}</span>
            <span><b>{profile?.name}</b><small>{profile?.email}</small></span>
            <button type="button" aria-label="Log out" onClick={handleSignOut}><PSignOut size={19} /></button>
          </div>
        </div>
      </aside>

      <div className="adm-body">
        <header className="cma-top adm-top">
          <div className="adm-top-title">
            <span className="adm-mobile-logo"><LogoMark size={32} /></span>
            <div><span className="cma-eyebrow">Teacher console</span><h1>{TITLES[tab]}</h1></div>
          </div>
          <div className="adm-top-actions">
            {studying > 0 && <button type="button" className="adm-live" onClick={() => go("students")}><span className="cma-live-dot" />{studying} studying</button>}
            {tab !== "publisher" && <button type="button" className="cma-primary adm-upload" onClick={() => go("publisher")}><PPlus size={17} weight="bold" aria-hidden="true" />Upload</button>}
            <button type="button" className="adm-me-mobile" aria-label="Log out" onClick={handleSignOut}><span className="adm-avatar tint" data-tint="green">{initials(profile?.name ?? "T")}</span></button>
          </div>
        </header>

        <main className="adm-main">
        <ErrorText>{error || materialsError}</ErrorText>

        {tab !== "overview" && (() => {
          const hero = {
            students: { art: "characters-playing-chess-game", tint: "blue", title: loading ? "Your class" : `${students.length} ${students.length === 1 ? "student" : "students"} in your class`, text: studying ? `${studying} studying right now. Tap anyone to see their days and sessions.` : "See who comes daily, who studies most, and who needs a nudge." },
            publisher: { art: "person-using-smartphone-successfully", tint: "green", title: "Share a class with your students", text: "Pick the paper and chapter, add a title, and publish. It shows in their Library at once." },
            shelf: { art: "character-reading-newspaper-with-coffee", tint: "amber", title: `${items?.length ?? 0} videos and PDFs published`, text: "Search, open or remove anything. For PDFs you can make AI flashcards and MCQs." },
            admins: { art: "confident-person-walking", tint: "violet", title: "Choose who can manage the class", text: "Admins can upload, see every student and add other admins. Give this only to people you trust." },
          }[tab];
          return (
            <section className="adm-hero" data-tint={hero.tint}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
              <img src={`/illustrations/doodles/${hero.art}.svg`} alt="" className="doodle" />
              <div><h2>{hero.title}</h2><p>{hero.text}</p></div>
            </section>
          );
        })()}

        {tab === "overview" && (
          <div className="adm-overview">
            <section className="adm-hello">
              <div>
                <span className="cma-eyebrow">{new Date(now).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
                <h2>{greet}, {first}</h2>
                <p>{studying ? `${studying} ${studying === 1 ? "student is" : "students are"} studying right now.` : "Here is how your class is doing."}</p>
              </div>
            </section>

            <section className="adm-kpis" aria-label="Class at a glance">
              {[
                { icon: PUsers, tint: "blue", value: students.length, label: "Students", note: newStudents ? `+${newStudents} this week` : "No new this week", go: "students" as const },
                { icon: PBroadcast, tint: "green", value: studying, label: "Studying now", note: studying ? "Live in the last minute" : "No one right now", go: "students" as const },
                { icon: PClock, tint: "violet", value: Math.round(totalStudySeconds / 3600), label: "Hours studied", note: "By all students", go: "students" as const },
                { icon: PBooks, tint: "amber", value: items?.length ?? 0, label: "Videos and PDFs", note: newItems ? `+${newItems} this week` : "Add your first", go: "shelf" as const },
              ].map(({ icon: Icon, ...k }) => (
                <button type="button" key={k.label} onClick={() => go(k.go)}>
                  <span className="tint" data-tint={k.tint}><Icon size={22} aria-hidden="true" /></span>
                  <strong>{loading ? "—" : k.value}</strong>
                  <span>{k.label}</span>
                  <small>{k.note}</small>
                </button>
              ))}
            </section>

            <button type="button" className="adm-cta" onClick={() => go("publisher")}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
              <img src="/illustrations/doodles/person-working-on-laptop.svg" alt="" className="doodle" />
              <span>
                <span className="cma-eyebrow"><PSparkle size={14} aria-hidden="true" />Teach something new</span>
                <b>Add a video or PDF</b>
                <small>Students see it in their Library at once. AI can make flashcards and MCQs from PDFs.</small>
                <span className="cma-primary"><PPlus size={17} weight="bold" aria-hidden="true" />Upload now</span>
              </span>
            </button>

            <div className="adm-cols">
              <section className="adm-card" aria-labelledby="adm-recent">
                <header><h3 id="adm-recent">Recent uploads</h3>{!!items?.length && <button type="button" className="cma-text-button" onClick={() => go("shelf")}>See all<PCaret size={15} aria-hidden="true" /></button>}</header>
                {!items?.length ? (
                  <div className="adm-empty">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
                    <img src="/illustrations/doodles/character-with-phone-and-star.svg" alt="" className="doodle" />
                    <b>Nothing published yet</b><span>Upload your first video or PDF for students.</span>
                  </div>
                ) : (
                  <ul className="adm-list">
                    {items.slice(0, 5).map((m) => (
                      <li key={m.id}>
                        <span className="tint" data-tint={m.type === "video" ? "blue" : "amber"}>{m.type === "video" ? <PPlay size={18} weight="fill" aria-hidden="true" /> : <PFilePdf size={19} aria-hidden="true" />}</span>
                        <span className="adm-list-main"><b>{m.title}</b><small>Paper {m.subjectId ?? "?"}{m.chapter ? ` · ${m.chapter}` : ""}</small></span>
                        <small className="adm-when">{millis(m.createdAt) ? ago(millis(m.createdAt)) : ""}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="adm-card" aria-labelledby="adm-live">
                <header><h3 id="adm-live"><span className="cma-live-dot" />Studying now</h3><button type="button" className="cma-text-button" onClick={() => go("students")}>All students<PCaret size={15} aria-hidden="true" /></button></header>
                {!liveList.length ? (
                  <div className="adm-empty">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
                    <img src="/illustrations/doodles/character-reading-newspaper-with-coffee.svg" alt="" className="doodle" />
                    <b>No one is studying right now</b><span>When a student starts the timer, they show up here live.</span>
                  </div>
                ) : (
                  <ul className="adm-list">
                    {liveList.map((s) => (
                      <li key={s.id}>
                        <span className="adm-avatar tint" data-tint="green" data-live="">{initials(s.name)}</span>
                        <span className="adm-list-main"><b>{s.name}</b><small>Paper {s.active!.subject} · {SUBJECTS.find((x) => x.id === s.active!.subject)?.name}</small></span>
                        <small className="adm-when">{duration((now - s.active!.startedAt) / 1000)}</small>
                      </li>
                    ))}
                  </ul>
                )}
                {!!streakers.length && <>
                  <h4 className="adm-sub">Longest streaks</h4>
                  <ul className="adm-list">
                    {streakers.map((s, i) => (
                      <li key={s.id}>
                        <span className="adm-rank">{i + 1}</span>
                        <span className="adm-list-main"><b>{s.name}</b><small>CMA {s.level ?? "—"}</small></span>
                        <span className="adm-streak"><PFire size={15} weight="fill" aria-hidden="true" />{s.streak}</span>
                      </li>
                    ))}
                  </ul>
                </>}
              </section>
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
                onChange={(e) => setShelfTypeFilter(e.target.value as "all" | "video" | "pdf")}
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
                <ul className="adm-roster">
                  {filteredStudents.map((student) => {
                    const isLive = !!student.active && now - student.active.last < 90000;
                    const subjectName = student.active?.subject ? SUBJECTS.find((x) => x.id === student.active?.subject)?.name : null;
                    return (
                      <li key={student.id}>
                        <button type="button" onClick={() => openStudent(student)} aria-current={selected?.id === student.id ? "true" : undefined}>
                          <span className="adm-avatar tint" data-tint={isLive ? "green" : "blue"} data-live={isLive ? "" : undefined}>{initials(student.name || "S")}</span>
                          <span className="adm-roster-who">
                            <b>{student.name || "Unnamed student"}</b>
                            <small>{student.email}</small>
                            <span className="adm-chips">
                              <span>{student.level ? `CMA ${student.level}` : "Level not set"}</span>
                              {student.role === "teacher" && <span data-teacher="">Teacher</span>}
                            </span>
                          </span>
                          <span className="adm-roster-stats">
                          <span className="adm-roster-stat" data-n="1"><b>{student.checkinCount ?? 0}</b><small>days present</small></span>
                          <span className="adm-roster-stat" data-n="2"><b>{duration(student.totalSeconds)}</b><small>studied</small></span>
                          </span>
                          <span className="adm-roster-now" data-live={isLive ? "" : undefined}>{isLive ? <><span className="cma-live-dot" />{subjectName || "Studying"}</> : student.lastMaterial || "Not studying"}</span>
                          <PCaret size={18} className="adm-roster-go" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
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

      {/* Phone: the same glass tab bar students know, with Upload in the middle. */}
      <nav className="adm-tabbar" aria-label="Admin menu" data-tucked={tucked || undefined}>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-current={tab === id ? "page" : undefined} data-upload={id === "publisher" ? "" : undefined} onClick={() => go(id)}>
            <Icon size={id === "publisher" ? 26 : 24} weight={tab === id || id === "publisher" ? "fill" : "duotone"} aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
