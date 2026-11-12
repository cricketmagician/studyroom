"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, FileText, Play, Search } from "lucide-react";
import { Level, LEVELS } from "@/lib/cma";
import { SYLLABUS_DATA } from "@/lib/syllabus-data";

interface SyllabusHubProps {
  currentLevel?: Level;
  onStartStudy?: (paperId: string) => void;
  onOpenLibrary?: (paperId: string) => void;
}

export function SyllabusHub({ currentLevel = "Intermediate", onStartStudy, onOpenLibrary }: SyllabusHubProps) {
  const [level, setLevel] = useState<Level>(currentLevel);
  const [activeGroup, setActiveGroup] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filteredPapers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SYLLABUS_DATA.filter((paper) => {
      if (paper.level !== level) return false;
      if (activeGroup !== "All" && paper.group !== activeGroup) return false;
      if (!q) return true;
      return (
        [paper.name, paper.code, `paper ${paper.id}`, paper.overview].some((t) => t.toLowerCase().includes(q)) ||
        paper.sections.some((sec) => sec.title.toLowerCase().includes(q) || sec.chapters.some((c) => c.toLowerCase().includes(q)))
      );
    });
  }, [level, activeGroup, search]);

  return (
    <section aria-label="Syllabus">
      <div className="cma-segments" aria-label="Choose course">
        {LEVELS.map((l) => (
          <button type="button" key={l} aria-pressed={level === l} onClick={() => { setLevel(l); setActiveGroup("All"); }}>{l}</button>
        ))}
      </div>

      <div className="library-toolbar">
        {level !== "Foundation" && (
          <div className="cma-segments" aria-label="Show group">
            {(level === "Intermediate" ? ["All", "Group 1", "Group 2"] : ["All", "Group 3", "Group 4"]).map((grp) => (
              <button type="button" key={grp} aria-pressed={activeGroup === grp} onClick={() => setActiveGroup(grp)}>{grp}</button>
            ))}
          </div>
        )}
        <label className="cma-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" aria-label="Search the syllabus" placeholder="Search a topic, like GST" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      {!filteredPapers.length ? (
        <div className="cma-empty">
          {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
          <img src="/illustrations/doodles/character-with-phone-and-star.svg" alt="" className="doodle" />
          <h3>Nothing found</h3>
          <p>No paper or chapter in CMA {level} matches “{search}”.</p>
          <button type="button" className="cma-secondary" onClick={() => setSearch("")}>Show all papers</button>
        </div>
      ) : (
        <div className="syllabus-list">
          {filteredPapers.map((paper, i) => (
            // Native <details name> is a keyboard-friendly accordion: opening one paper closes the others.
            <details key={paper.id} name="syllabus-paper" open={i === 0} className="syllabus-paper">
              <summary>
                <span className="syllabus-badge" aria-hidden="true">{paper.id}</span>
                <span className="syllabus-head">
                  <strong>Paper {paper.id}: {paper.name}</strong>
                  <small>{[paper.group, paper.duration, `${paper.totalMarks} marks`, paper.scoringDifficulty].join(" · ")}</small>
                </span>
                <ChevronDown size={20} aria-hidden="true" />
              </summary>

              <div className="syllabus-body">
                <p>{paper.overview}</p>

                <h4>Marks by section</h4>
                <div className="syllabus-bar" aria-hidden="true">
                  {paper.sections.map((sec, idx) => <span key={sec.title} style={{ width: `${sec.weight}%`, opacity: 1 - idx * 0.2 }} />)}
                </div>
                <ul className="syllabus-sections">
                  {paper.sections.map((sec) => (
                    <li key={sec.title}>
                      <div><h5>{sec.title}</h5><b>{sec.weight}% marks</b></div>
                      <p>{sec.description}</p>
                      <ul>{sec.chapters.map((chap, n) => <li key={n}>{chap}</li>)}</ul>
                    </li>
                  ))}
                </ul>

                <h4>Tips to score well</h4>
                <ol className="syllabus-tips">{paper.examStrategy.map((tip, n) => <li key={n}>{tip}</li>)}</ol>

                {(onOpenLibrary || onStartStudy) && (
                  <div className="cma-actions">
                    {onOpenLibrary && <button type="button" className="cma-secondary" onClick={() => onOpenLibrary(paper.id)}><FileText size={17} aria-hidden="true" />Videos and PDFs</button>}
                    {onStartStudy && <button type="button" className="cma-primary" onClick={() => onStartStudy(paper.id)}><Play size={17} aria-hidden="true" />Start studying</button>}
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
