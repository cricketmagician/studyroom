"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookmarkSimple as Bookmark, Check, CaretRight as ChevronRight, FileText, Play, MagnifyingGlass as Search } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { Entry, updateEntry } from "@/lib/hooks";
import { Material } from "@/lib/materials";
import { SUBJECTS, Level } from "@/lib/cma";
import { SYLLABUS_DATA } from "@/lib/syllabus-data";
import { formatSize } from "@/lib/files";
import { haptic } from "@/lib/haptics";

export const TINTS = ["blue", "amber", "green", "pink", "violet", "orange"];

/** One paper, Apple Books style: a coloured "cover" with the paper number, the name, what is inside, and a small progress ring. */
export function SubjectCard({ id, name, group, tagline, videos, pdfs, done, index, onOpen }: { id: string; name: string; group?: string; tagline?: string; videos: number; pdfs: number; done: number; index: number; onOpen: () => void }) {
  const total = videos + pdfs;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <a href={`/?view=Library&paper=${id}`} onClick={(e) => { e.preventDefault(); onOpen(); }} className="subject-card">
      <span className="subject-cover tint" data-tint={TINTS[index % TINTS.length]} aria-hidden="true"><small>Paper</small>{id}</span>
      <span className="subject-body">
        {group && <span className="subject-group">{group}</span>}
        <h3>{name}</h3>
        {tagline && <p>{tagline}</p>}
        <span className="subject-foot">
          {total ? <>{videos > 0 && <span><Play size={13} aria-hidden="true" />{videos} {videos === 1 ? "video" : "videos"}</span>}{pdfs > 0 && <span><FileText size={13} aria-hidden="true" />{pdfs} {pdfs === 1 ? "PDF" : "PDFs"}</span>}</> : <span>Nothing added yet</span>}
        </span>
      </span>
      {total > 0 ? (
        <span className="subject-ring" role="img" aria-label={`${pct}% done`}>
          <svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" /><circle cx="18" cy="18" r="15" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - pct} data-empty={pct ? undefined : ""} /></svg>
          <b>{pct}</b>
        </span>
      ) : <ChevronRight className="subject-chevron" size={20} aria-hidden="true" />}
    </a>
  );
}

export function StudyLibrary({
  level,
  items,
  entries,
  onError,
  onOpenSyllabus,
}: {
  level: Level;
  items: Material[] | null;
  entries: Record<string, Entry>;
  onError: (message: string) => void;
  onOpenSyllabus: () => void;
}) {
  const { user } = useAuth();
  const [paper, setPaper] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [show, setShow] = useState<"all" | "video" | "pdf" | "saved">("all");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setPaper(new URLSearchParams(location.search).get("paper") ?? "");
    const initial = setTimeout(read, 0);
    window.addEventListener("popstate", read);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("popstate", read);
    };
  }, []);

  const choosePaper = (id: string) => {
    setPaper(id);
    setSearch("");
    setShow("all");
    const url = new URL(location.href);
    if (id) url.searchParams.set("paper", id);
    else url.searchParams.delete("paper");
    history.pushState(null, "", url);
  };

  const patch = async (id: string, entry: Entry) => {
    if (!user) return;
    haptic(entry.done ? "success" : "tap");
    setPending(id);
    try {
      await updateEntry(user.uid, id, entry);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setPending(null);
    }
  };

  // Filter subjects for the selected CMA level
  const subjects = useMemo(() => {
    return SUBJECTS.filter((s) => s.level === level);
  }, [level]);

  // Find syllabus info for the subjects
  const syllabusMap = useMemo(() => {
    const map = new Map<string, typeof SYLLABUS_DATA[0]>();
    SYLLABUS_DATA.forEach((s) => map.set(s.id, s));
    return map;
  }, []);

  const selectedSubject = subjects.find((s) => s.id === paper);
  const selectedSyllabus = paper ? syllabusMap.get(paper) : null;

  // Filter all materials belonging to this level
  const allLevelMaterials = useMemo(() => {
    return (items ?? []).filter((m) => !m.level || m.level === level);
  }, [items, level]);

  const getMaterialSubjectId = (m: Material) =>
    m.subjectId ?? subjects.find((s) => s.name === m.subject)?.id ?? "general";

  // Resources for the currently opened paper
  const paperResources = useMemo(() => {
    if (!paper) return [];
    return allLevelMaterials.filter((m) => getMaterialSubjectId(m) === paper);
  }, [allLevelMaterials, paper]);

  const videoCount = paperResources.filter((m) => m.type === "video").length;
  const pdfCount = paperResources.filter((m) => m.type === "pdf").length;
  const completedCount = paperResources.filter((m) => entries[m.id]?.done).length;

  // Filtered resources for the list view
  const visibleResources = useMemo(() => {
    return paperResources.filter((m) => {
      if (show === "saved" ? !entries[m.id]?.saved : show !== "all" && m.type !== show) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        (m.chapter && m.chapter.toLowerCase().includes(q)) ||
        (m.faculty && m.faculty.toLowerCase().includes(q)) ||
        (m.category && m.category.toLowerCase().includes(q))
      );
    });
  }, [paperResources, show, search, entries]);

  // Subject cards filterable by Group & Search
  const visibleSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const syl = syllabusMap.get(s.id);
      if (groupFilter !== "All" && syl && syl.group !== groupFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        `paper ${s.id}`.toLowerCase().includes(q)
      );
    });
  }, [subjects, groupFilter, search, syllabusMap]);

  const SHOW = [["all", "All", paperResources.length], ["video", "Videos", videoCount], ["pdf", "PDFs", pdfCount], ["saved", "Saved", null]] as const;

  if (!selectedSubject) return (
    <section aria-label="Your subjects">
      <div className="cma-section-title">
        {level !== "Foundation" ? (
          <div className="cma-segments" aria-label="Show group">
            {(level === "Intermediate" ? ["All", "Group 1", "Group 2"] : ["All", "Group 3", "Group 4"]).map((grp) => (
              <button type="button" key={grp} aria-pressed={groupFilter === grp} onClick={() => setGroupFilter(grp)}>{grp}</button>
            ))}
          </div>
        ) : <span />}
        <button type="button" onClick={onOpenSyllabus} className="cma-text-button">See syllabus and marks<ArrowRight size={17} aria-hidden="true" /></button>
      </div>
      <div className="subject-grid">
        {visibleSubjects.map((s, i) => {
          const files = allLevelMaterials.filter((m) => getMaterialSubjectId(m) === s.id);
          const videos = files.filter((m) => m.type === "video").length;
          const syl = syllabusMap.get(s.id);
          return <SubjectCard key={s.id} id={s.id} name={s.name} group={syl?.group} tagline={syl?.tagline} videos={videos} pdfs={files.length - videos} done={files.filter((m) => entries[m.id]?.done).length} index={i} onOpen={() => choosePaper(s.id)} />;
        })}
      </div>
    </section>
  );

  return (
    <section aria-label={selectedSubject.name}>
      <button type="button" className="cma-text-button" onClick={() => choosePaper("")}><ArrowLeft size={18} aria-hidden="true" />All subjects</button>
      <div className="subject-detail-hero">
        <div>
          <span className="cma-eyebrow">Paper {selectedSubject.id}{selectedSyllabus?.group ? ` · ${selectedSyllabus.group}` : ""}</span>
          <h2>{selectedSubject.name}</h2>
          <p>{selectedSyllabus?.tagline || "Videos and PDFs from your teacher."}</p>
          <div className="collection-progress">
            {!!paperResources.length && <>{completedCount} of {paperResources.length} done<progress value={completedCount} max={paperResources.length} aria-label="Done in this subject" /></>}
            <button type="button" onClick={onOpenSyllabus} className="cma-text-button">See chapters and marks<ArrowRight size={16} aria-hidden="true" /></button>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
        <img src="/illustrations/doodles/person-commuting-on-train.svg" alt="" className="doodle" />
      </div>

      {!!paperResources.length && <div className="library-toolbar">
        <div className="cma-segments" aria-label="Show">
          {SHOW.map(([id, label, count]) => (
            <button type="button" key={id} aria-pressed={show === id} onClick={() => setShow(id)}>
              {id === "saved" && <Bookmark size={14} aria-hidden="true" />}{label}{count !== null && ` (${count})`}
            </button>
          ))}
        </div>
        <label className="cma-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" aria-label="Search in this subject" placeholder="Search chapter or topic" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>}

      {items === null ? (
        <p className="cma-loading">Loading videos and PDFs…</p>
      ) : !visibleResources.length ? (
        <div className="cma-empty">
          {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
          <img src="/illustrations/doodles/character-with-phone-and-star.svg" alt="" className="doodle" />
          <h3>{paperResources.length ? (show === "saved" ? "Nothing saved yet" : "Nothing found") : "Nothing added yet"}</h3>
          <p>{paperResources.length ? (show === "saved" ? "Tap the bookmark on a video or PDF to keep it here." : "Try a different word, or show all.") : "Your teacher will add videos and PDFs for this subject soon."}</p>
          {(search || show !== "all") && !!paperResources.length && (
            <button type="button" className="cma-secondary" onClick={() => { setSearch(""); setShow("all"); }}>Show all</button>
          )}
        </div>
      ) : (
        <div className="resource-list">
          {visibleResources.map((m) => {
            const isDone = !!entries[m.id]?.done;
            const isSaved = !!entries[m.id]?.saved;
            return (
              <article key={m.id} className="resource-row">
                <span className="resource-number tint" data-tint={m.type === "video" ? "blue" : "amber"} aria-hidden="true">{m.type === "video" ? <Play size={18} /> : <FileText size={18} />}</span>
                <div className="resource-title">
                  <Link href={`/learn/${m.id}`}>{m.title}</Link>
                  <small>{[m.type === "video" ? "Video" : "PDF", m.chapter, m.faculty, m.duration, m.size > 0 && formatSize(m.size)].filter(Boolean).join(" · ")}</small>
                </div>
                <button type="button" className="cma-icon-button" disabled={pending === m.id} aria-pressed={isSaved} aria-label={isSaved ? "Remove from saved" : "Save for later"} onClick={() => patch(m.id, { saved: !isSaved })}>
                  <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                </button>
                <button type="button" className="resource-done" disabled={pending === m.id} aria-pressed={isDone} onClick={() => patch(m.id, { done: !isDone })}>
                  <Check size={15} aria-hidden="true" />{isDone ? "Done" : "Mark done"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
