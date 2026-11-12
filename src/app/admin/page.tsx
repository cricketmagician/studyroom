"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
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
import { parseVideoUrl } from "@/lib/embed";
import { ErrorText, Logo, LogoMark } from "@/components/auth-card";
import { ArrowSquareOut as PArrowSquare, Books as PBooks, Broadcast as PBroadcast, CaretRight as PCaret, Clock as PClock, FilePdf as PFilePdf, Fire as PFire, House as PHome, Play as PPlay, Plus as PPlus, ShieldCheck as PShield, SignOut as PSignOut, UserCircle as PUserCircle, Moon as PMoon, Check as PCheck, PlayCircle as PPlayCircle, UploadSimple as PUpload, LinkSimple as PLink, Sparkle as PSparkle, UsersThree as PUsers } from "@phosphor-icons/react";
import "./admin.css";
import { useScrollChrome } from "@/lib/use-scroll-chrome";
import { useTheme } from "@/components/providers/theme-provider";
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
  const [step, setStep] = useState(1);
  const [linkUrl, setLinkUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [published, setPublished] = useState<{ title: string; kind: "video" | "pdf"; paper: string } | null>(null);
  const [paperLevel, setPaperLevel] = useState<string>("Intermediate");
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
    setPublishError("");
    if (!file) { setSelectedFile(null); return; }
    const checked = checkFile(file);
    if ("error" in checked) { setSelectedFile(null); setPublishError(checked.error); return; }
    setSelectedFile(file);
    setUploadKind(checked.kind); // the file decides: a PDF is never saved as a video
    if (!materialTitle) setMaterialTitle(titleFromFileName(file.name));
    if (checked.kind === "video") {
      // Read the lecture length from the file itself so the teacher never types it.
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => { const m = Math.round(v.duration / 60); if (m > 0) setVideoDuration(m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`); URL.revokeObjectURL(url); };
      v.onerror = () => URL.revokeObjectURL(url);
      v.src = url;
    }
  };

  const publish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

      // No silent default: "" means the whole paper.
      const chapterToSave = selectedChapter === "custom" ? customChapter.trim() : selectedChapter === "whole" ? "" : selectedChapter;

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
          checked.kind,
          title,
          { uid: user.uid, name: profile.name },
          setProgress,
          metadata
        );
      } else {
        const url = linkUrl.trim();
        if (!/^https:\/\//i.test(url)) throw new Error("Paste a link that starts with https://");

        const res = await postAi<{ id: string }>("/api/materials", {
          title,
          url,
          type: uploadKind,
          ...metadata,
        });
        createdId = res.id;
      }

      setPublished({ title, kind: source === "file" && selectedFile ? (checkFile(selectedFile) as { kind: "video" | "pdf" }).kind : uploadKind, paper: `Paper ${subject.id} · ${subject.name}` });
      setMaterialTitle("");
      setSelectedFile(null);
      setLinkUrl("");
      setCustomChapter("");
      setSelectedChapter("");
      setProgress(0);

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
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  // Close the account menu on an outside tap or Escape.
  useEffect(() => {
    if (!profileOpen) return;
    const away = (e: Event) => { if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setProfileOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [profileOpen]);

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
            <div className="adm-profile" ref={profileRef}>
              <button type="button" className="adm-profile-btn" aria-haspopup="menu" aria-expanded={profileOpen} aria-label="Your account" onClick={() => setProfileOpen(!profileOpen)}>
                <span className="adm-avatar tint" data-tint="green">{initials(profile?.name ?? "T")}</span>
              </button>
              {profileOpen && (
                <div className="adm-profile-menu" role="menu">
                  <div className="adm-profile-head">
                    <span className="adm-avatar tint" data-tint="green">{initials(profile?.name ?? "T")}</span>
                    <span><b>{profile?.name}</b><small>{profile?.email}</small><em>Teacher</em></span>
                  </div>
                  <Link href="/profile" role="menuitem" onClick={() => setProfileOpen(false)}><PUserCircle size={19} aria-hidden="true" />My profile</Link>
                  <Link href="/" role="menuitem" onClick={() => setProfileOpen(false)}><PArrowSquare size={19} aria-hidden="true" />Open student app</Link>
                  <label role="menuitem"><PMoon size={19} aria-hidden="true" />Dark mode<input type="checkbox" role="switch" className="profile-switch" checked={theme === "dark"} onChange={toggleTheme} /></label>
                  <button type="button" role="menuitem" className="adm-profile-out" onClick={() => { setProfileOpen(false); void handleSignOut(); }}><PSignOut size={19} aria-hidden="true" />Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="adm-main">
        <ErrorText>{error || materialsError}</ErrorText>
        {message && <p role="status" className="profile-note adm-toast">{message.replace(/^✓\s*/, "")}<button type="button" aria-label="Dismiss" onClick={() => setMessage("")}>×</button></p>}

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

              {published ? (
                <div className="up-done" role="status">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
                  <img src="/illustrations/doodles/person-using-smartphone-successfully.svg" alt="" className="doodle" />
                  <span className="tint" data-tint="green"><PCheck size={26} weight="bold" aria-hidden="true" /></span>
                  <h2>Published</h2>
                  <p>&ldquo;{published.title}&rdquo; is now in {published.paper}. Students can open it right away.</p>
                  <div className="up-done-actions">
                    <button type="button" className="cma-primary" onClick={() => { setPublished(null); setStep(1); }}><PPlus size={17} weight="bold" aria-hidden="true" />Add another</button>
                    <button type="button" className="cma-secondary" onClick={() => { setPublished(null); setStep(1); go("shelf"); }}>See all published</button>
                  </div>
                </div>
              ) : (
              <form onSubmit={publish} className="up" noValidate>
                <ol className="up-steps" aria-label="Steps">
                  {["Add file", "Where it goes", "Check and publish"].map((t, n) => (
                    <li key={t} data-state={step > n + 1 ? "done" : step === n + 1 ? "now" : undefined}><span>{step > n + 1 ? <PCheck size={13} weight="bold" aria-hidden="true" /> : n + 1}</span>{t}</li>
                  ))}
                </ol>

                {step === 1 && (
                  <section className="up-step" aria-labelledby="up-s1">
                    <h3 id="up-s1">What are you adding?</h3>
                    <div className="up-kinds">
                      {([["video", "Video class", "MP4, MOV or a YouTube / Drive link", "blue"], ["pdf", "PDF notes", "Notes, formulas, RTP or MTP", "amber"]] as const).map(([k, label, hint, tint]) => (
                        <button type="button" key={k} aria-pressed={uploadKind === k} onClick={() => { setUploadKind(k); if (k === "pdf" && source === "link") setSource("file"); setSelectedFile(null); setPublishError(""); setMaterialCategory(k === "video" ? "Concept Lecture" : "Comprehensive Chapter Notes"); }}>
                          <span className="tint" data-tint={tint}>{k === "video" ? <PPlayCircle size={28} aria-hidden="true" /> : <PFilePdf size={28} aria-hidden="true" />}</span>
                          <b>{label}</b><small>{hint}</small>
                        </button>
                      ))}
                    </div>

                    <div className="cma-segments up-source" aria-label="How to add it">
                      <button type="button" aria-pressed={source === "file"} onClick={() => setSource("file")}><PUpload size={15} aria-hidden="true" />Upload a file</button>
                      <button type="button" aria-pressed={source === "link"} onClick={() => setSource("link")}><PLink size={15} aria-hidden="true" />Paste a link</button>
                    </div>

                    {source === "file" ? (
                      <label className="up-drop" data-over={dragOver || undefined} data-has={selectedFile ? "" : undefined}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files?.[0] ?? null); }}>
                        <input type="file" accept={uploadKind === "pdf" ? "application/pdf,.pdf" : "video/*,.mp4,.mov,.webm,.m4v,application/pdf,.pdf"} onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
                        {selectedFile ? (
                          <>
                            <span className="tint" data-tint={uploadKind === "video" ? "blue" : "amber"}>{uploadKind === "video" ? <PPlayCircle size={26} aria-hidden="true" /> : <PFilePdf size={26} aria-hidden="true" />}</span>
                            <b>{selectedFile.name}</b>
                            <small>{formatSize(selectedFile.size)}{uploadKind === "video" && videoDuration ? ` · ${videoDuration}` : ""} · Tap to choose another</small>
                          </>
                        ) : (
                          <>
                            <span className="tint" data-tint="green"><PUpload size={26} aria-hidden="true" /></span>
                            <b>Drop your {uploadKind === "video" ? "video" : "PDF"} here, or tap to choose</b>
                            <small>{uploadKind === "video" ? "Up to 300 MB. For longer lectures, paste a YouTube link instead." : "Up to 50 MB."}</small>
                          </>
                        )}
                      </label>
                    ) : (() => {
                      const info = linkUrl.trim() ? parseVideoUrl(linkUrl.trim()) : null;
                      const yt = info?.type === "youtube" ? info.embedUrl.match(/embed\/([\w-]{11})/)?.[1] : null;
                      const okHttps = /^https:\/\//i.test(linkUrl.trim());
                      return (
                        <div className="up-link">
                          <label>Link<input type="url" inputMode="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder={uploadKind === "video" ? "https://youtube.com/watch?v=…" : "https://drive.google.com/…"} autoComplete="off" /></label>
                          {linkUrl.trim() && (
                            <div className="up-link-check" data-ok={okHttps && (uploadKind === "pdf" || (info && info.type !== "direct")) ? "" : undefined}>
                              {yt && <>
                                {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail preview */}
                                <img src={`https://i.ytimg.com/vi/${yt}/mqdefault.jpg`} alt="" />
                              </>}
                              <span>{!okHttps ? "The link must start with https://" : uploadKind === "pdf" ? "PDF link added. Make sure it is shared with anyone who has the link." : info?.type === "youtube" ? "YouTube video found. Students can play it inside the app." : info?.type === "gdrive" ? "Google Drive video found. Set sharing to \u201cAnyone with the link\u201d." : info?.type === "vimeo" ? "Vimeo video found." : "We could not recognise this video link. Students may have to open it outside the app."}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <ErrorText>{publishError}</ErrorText>
                    <div className="up-nav">
                      <span />
                      <button type="button" className="cma-primary" disabled={source === "file" ? !selectedFile : !/^https:\/\//i.test(linkUrl.trim())} onClick={() => { setPublishError(""); setStep(2); }}>Next<PCaret size={16} aria-hidden="true" /></button>
                    </div>
                  </section>
                )}

                {step === 2 && (
                  <section className="up-step" aria-labelledby="up-s2">
                    <h3 id="up-s2">Where should students find it?</h3>
                    <div className="cma-segments up-levels" aria-label="Course">
                      {["Foundation", "Intermediate", "Final"].map((l) => <button type="button" key={l} aria-pressed={paperLevel === l} onClick={() => setPaperLevel(l)}>{l}</button>)}
                    </div>
                    <fieldset className="cma-subject-picker up-papers">
                      <legend>Paper</legend>
                      <div>{SUBJECTS.filter((x) => x.level === paperLevel).map((x) => <label key={x.id}><input type="radio" name="paper" checked={selectedPaperId === x.id} onChange={() => { setSelectedPaperId(x.id); setSelectedChapter(""); }} /><b>{x.id}</b><span>{x.name}</span></label>)}</div>
                    </fieldset>
                    <label className="up-field">Chapter
                      <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}>
                        <option value="" disabled>Choose a chapter</option>
                        <option value="whole">Whole paper (no single chapter)</option>
                        {chapterSuggestions.map((c) => <option key={c} value={c}>{c}</option>)}
                        <option value="custom">Something else (type it)</option>
                      </select>
                    </label>
                    {selectedChapter === "custom" && <label className="up-field">Chapter name<input value={customChapter} onChange={(e) => setCustomChapter(e.target.value)} placeholder="Like Standard Costing" maxLength={200} /></label>}
                    <fieldset className="up-field"><legend>Kind of {uploadKind === "video" ? "video" : "PDF"}</legend>
                      <div className="profile-chips">{(uploadKind === "video" ? ["Concept Lecture", "Problem Solving & Practical", "Fast-Track Marathon", "Past Paper / RTP Discussion", "Exam Strategy & Tips"] : ["Comprehensive Chapter Notes", "Formula Book & Formats", "Quick Revision Handouts", "RTP / MTP Mock Papers", "Past 5 Years Questions & Solutions"]).map((c) => <label key={c}><input type="radio" name="kind" checked={materialCategory === c} onChange={() => setMaterialCategory(c)} />{c}</label>)}</div>
                    </fieldset>
                    <div className="up-nav">
                      <button type="button" className="cma-secondary" onClick={() => setStep(1)}>Back</button>
                      <button type="button" className="cma-primary" disabled={!selectedChapter || (selectedChapter === "custom" && !customChapter.trim())} onClick={() => setStep(3)}>Next<PCaret size={16} aria-hidden="true" /></button>
                    </div>
                  </section>
                )}

                {step === 3 && (() => {
                  const paper = SUBJECTS.find((x) => x.id === selectedPaperId);
                  const chapterText = selectedChapter === "custom" ? customChapter.trim() : selectedChapter === "whole" ? "" : selectedChapter;
                  return (
                    <section className="up-step" aria-labelledby="up-s3">
                      <h3 id="up-s3">Check and publish</h3>
                      <label className="up-field">Title students will see<input value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} placeholder="Like Marginal Costing: full lecture" maxLength={200} required /></label>
                      <div className="up-two">
                        <label className="up-field">Teacher name<input value={facultyName} onChange={(e) => setFacultyName(e.target.value)} maxLength={80} /></label>
                        {uploadKind === "video" && <label className="up-field">Length<input value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)} placeholder="45 min" maxLength={20} /></label>}
                      </div>
                      {uploadKind === "pdf" && (
                        <label className="up-ai"><PSparkle size={20} aria-hidden="true" /><span><b>Make AI flashcards and MCQs</b><small>From this PDF, after it uploads. You review them before students see them.</small></span><input type="checkbox" role="switch" className="profile-switch" checked={autoGenerateAi} onChange={(e) => setAutoGenerateAi(e.target.checked)} /></label>
                      )}
                      <div className="up-preview" aria-label="How students will see it">
                        <span className="cma-eyebrow">Students will see</span>
                        <div>
                          <span className="tint" data-tint={uploadKind === "video" ? "blue" : "amber"}>{uploadKind === "video" ? <PPlay size={18} weight="fill" aria-hidden="true" /> : <PFilePdf size={19} aria-hidden="true" />}</span>
                          <span><b>{materialTitle.trim() || "Your title"}</b><small>{[uploadKind === "video" ? "Video" : "PDF", paper ? `Paper ${paper.id}` : "", chapterText, facultyName, uploadKind === "video" ? videoDuration : ""].filter(Boolean).join(" · ")}</small></span>
                        </div>
                      </div>
                      {publishing && <div className="up-progress" role="status"><span>{source === "file" ? `Uploading… ${progress}%` : "Publishing…"}</span><progress value={source === "file" ? progress : undefined} max={100} /></div>}
                      <ErrorText>{publishError}</ErrorText>
                      <div className="up-nav">
                        <button type="button" className="cma-secondary" disabled={publishing} onClick={() => setStep(2)}>Back</button>
                        <button type="submit" className="cma-primary" disabled={publishing || !materialTitle.trim()}>{publishing ? "Publishing…" : "Publish for students"}</button>
                      </div>
                    </section>
                  );
                })()}
              </form>
              )}
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
