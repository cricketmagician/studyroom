"use client";
/* eslint-disable @next/next/no-img-element -- Local SVG artwork and Tegaki animation do not need image optimization. */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpenText as BookOpen, Play, Pause, Check, ArrowRight, ArrowUpRight, CaretDown as ChevronDown, Fire as Flame, TrendDown as TrendingDown, TrendUp as TrendingUp, Clock as Clock3, UserCircle as User, GraduationCap, ShieldCheck } from "@phosphor-icons/react";
import { haptic } from "@/lib/haptics";
import { useAuth } from "@/lib/auth";
import { useMaterials, useMyLibrary } from "@/lib/hooks";
import { postAi } from "@/lib/ai-client";
import { DEFAULT_GOAL_MINUTES, duration, indiaWeek, LEVELS, Level, SUBJECTS, StudyState, indiaDay } from "@/lib/cma";
import { StudyLibrary, SubjectCard, TINTS } from "./subject-library";
import { FriendsHub } from "./friends-hub";
import { SyllabusHub } from "./syllabus-hub";
import { ProfileSetupModal } from "./profile-setup-modal";
import { ErrorText, Logo } from "@/components/auth-card";
import "./study-hub.css";
import { HandNote } from "@/components/hand-note";
import { StudyNavigation } from "./study-navigation";
import { RoutinesSection } from './routines-section';
type Detail = {
    state: StudyState;
    now: number;
    today: string;
    daily: { day: string; seconds: number; subjects: Record<string, number> }[];
    sessions: {
        subject: string;
        seconds: number;
        startedAt: number;
    }[];
    checkins: {
        day: string;
    }[];
};
export function StudyHub() {
    const { user, profile } = useAuth();
    const { items, error: materialsError } = useMaterials();
    const entries = useMyLibrary();
    const [detail, setDetail] = useState<Detail | null>(null);
    const [tab, setTab] = useState("Overview");
    const [range, setRange] = useState("week");
    const [level, setLevel] = useState<Level>(profile?.level ?? "Intermediate");
    const [focusSubject, setFocusSubject] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [clock, setClock] = useState(0);
    const [invite, setInvite] = useState("");
    const [pendingInvite, setPendingInvite] = useState("");
    const [friends, setFriends] = useState<{
        id: string;
        name: string;
    }[]>([]);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const state = detail?.state ?? {};
    const active = state.active;
    const refresh = useCallback(async () => {
        let data = await postAi<Detail>("/api/study", { action: "detail" });
        if (data.state.active && data.now - data.state.active.last > 90000) {
            await postAi('/api/study', {action:'tick',sessionId:data.state.active.id}).catch(() => {});
            data = await postAi<Detail>('/api/study', {action:'detail'});
        }
        setDetail(data);
        if (data.state.level)
            setLevel(data.state.level);
        if (data.state.onboardingCompleted === false || (!data.state.onboardingCompleted && !data.state.totalSeconds && !data.state.lastCheckin)) {
            setShowSetupModal(true);
        }
        setClock(data.now);
    }, []);
    const loadFriends = useCallback(async () => {
        const data = await postAi<{
            friends: {
                id: string;
                name: string;
            }[];
        }>("/api/study", { action: "friends" });
        setFriends(data.friends);
    }, []);
    useEffect(() => {
        // Fetching persisted state is the initial synchronization with the server.
        const initial = setTimeout(() => {
            const params = new URLSearchParams(location.search);
            const view = params.get("view");
            if (view && ["Overview", "Library", "Syllabus", "Progress", "Friends"].includes(view)) setTab(view);
            const startPaper = params.get("startPaper");
            if (startPaper) {
                setFocusSubject(startPaper);
                void act({ action: "start", subject: startPaper });
            }
            refresh().catch(e => setError(e.message));
            loadFriends().catch(e => setError(e.message));
            setPendingInvite(sessionStorage.getItem("cma-invite") ?? "");
        }, 0);
        const readView = () => {
            const view = new URLSearchParams(location.search).get("view");
            setTab(view && ["Overview","Library","Syllabus","Progress","Friends"].includes(view) ? view : "Overview");
        };
        window.addEventListener("popstate",readView);
        const sync = () => { if (document.visibilityState === "visible") refresh().catch(e => setError(e.message)); };
        window.addEventListener("studyroom:session",sync);
        document.addEventListener("visibilitychange",sync);
        const update = setInterval(() => { if (document.visibilityState === "visible") refresh().catch(e => setError(e.message)); }, 60000);
        return () => { clearTimeout(initial); clearInterval(update); window.removeEventListener("popstate",readView); window.removeEventListener("studyroom:session",sync); document.removeEventListener("visibilitychange",sync); };
    }, [refresh, loadFriends]);
    useEffect(() => {
        const id = setInterval(() => setClock(c => c + 1000), 1000);
        return () => clearInterval(id);
    }, []);
    const act = async (body: object) => {
        setBusy(true);
        setError("");
        try {
            await postAi("/api/study", body);
            await refresh();
            window.dispatchEvent(new Event("studyroom:session"));
        }
        catch (e) {
            setError((e as Error).message);
            await refresh().catch(() => {});
        }
        finally {
            setBusy(false);
        }
    };
    const subjects = SUBJECTS.filter(s => s.level === level);
    const selected = focusSubject || subjects[0].id;
    const presentDays = new Set((detail?.checkins ?? []).map(c => c.day));
    const presentThisWeek = indiaWeek(clock).filter(d => presentDays.has(d)).length;
    const seconds = active ? active.seconds + Math.max(0, Math.min(90, Math.floor((clock - active.last) / 1000))) : 0;
    const selectedDays = (detail?.daily ?? []).filter(d => range === "today" ? d.day === indiaDay(clock) : range === "month" ? d.day.startsWith(indiaDay(clock).slice(0,7)) : indiaWeek(clock).includes(d.day));
    const rangeSubjects: Record<string, number> = range === "total" ? state.subjects ?? {} : selectedDays.reduce((totals,d) => { for (const [id,seconds] of Object.entries(d.subjects ?? {})) totals[id] = (totals[id] ?? 0)+seconds; return totals; }, {} as Record<string,number>);
    const weekMax = Math.max(3600,...(detail?.daily ?? []).filter(d => indiaWeek(clock).includes(d.day)).map(d=>d.seconds));
    const todaySeconds = detail?.daily.find(d => d.day === indiaDay(clock))?.seconds ?? 0;
    const weekSeconds = (detail?.daily ?? []).filter(d => indiaWeek(clock).includes(d.day)).reduce((sum,d) => sum+d.seconds,0);
    const goal = state.dailyGoalMinutes ?? DEFAULT_GOAL_MINUTES;
    const goalPercent = Math.min(100,Math.round(todaySeconds/(goal*60)*100));
    // Progress page numbers: this period vs the one before, goal days, and a 5-week calendar.
    const dailyMap = new Map((detail?.daily ?? []).map(d => [d.day, d.seconds]));
    const sumOf = (days: string[]) => days.reduce((sum, d) => sum + (dailyMap.get(d) ?? 0), 0);
    const thisMonth = indiaDay(clock).slice(0, 7);
    const [ty, tm] = thisMonth.split("-").map(Number);
    const lastMonth = tm === 1 ? `${ty - 1}-12` : `${ty}-${String(tm - 1).padStart(2, "0")}`;
    const rangeTotal = range === "total" ? state.totalSeconds ?? 0 : selectedDays.reduce((sum, d) => sum + d.seconds, 0);
    const prevTotal = range === "today" ? sumOf([indiaDay(clock - 86400000)]) : range === "week" ? sumOf(indiaWeek(clock - 7 * 86400000)) : range === "month" ? (detail?.daily ?? []).filter(d => d.day.startsWith(lastMonth)).reduce((sum, d) => sum + d.seconds, 0) : null;
    const chartMax = Math.max(weekMax, goal * 66);
    const goalDays = indiaWeek(clock).filter(d => (dailyMap.get(d) ?? 0) >= goal * 60).length;
    const present = new Set((detail?.checkins ?? []).map(c => c.day));
    const heatDays = Array.from({ length: 35 }, (_, i) => new Date(Date.parse(`${indiaWeek(clock)[0]}T00:00:00Z`) + (i - 28) * 86400000).toISOString().slice(0, 10));
    const heatLevel = (sec: number) => !sec ? 0 : sec < goal * 15 ? 1 : sec < goal * 45 ? 2 : sec < goal * 60 ? 3 : 4;
    const levelPapers = SUBJECTS.filter(x => x.level === level);
    const tintOf = (id: string) => { const i = levelPapers.findIndex(x => x.id === id); return TINTS[(i >= 0 ? i : Math.max(0, SUBJECTS.findIndex(x => x.id === id))) % TINTS.length]; };
    const rangeSum = Math.max(1, Object.values(rangeSubjects).reduce((sum, t) => sum + t, 0));
    const goToView = (view: string, paper?: string) => {
        setTab(view);
        const url = new URL(location.href);
        if (view === "Overview") url.searchParams.delete("view"); else url.searchParams.set("view", view);
        if (paper) url.searchParams.set("paper",paper); else url.searchParams.delete("paper");
        history.pushState(null,"",url);
        window.dispatchEvent(new PopStateEvent("popstate"));
        window.scrollTo({top:0,behavior:"auto"});
    };
    const checked = !!detail && state.lastCheckin === indiaDay(clock);
    const streak = state.lastCheckin && [indiaDay(clock), indiaDay(clock - 86400000)].includes(state.lastCheckin) ? state.streak ?? 0 : 0;
    const accept = async () => {
        setBusy(true);
        try {
            await postAi("/api/study", { action: "accept", token: pendingInvite });
            sessionStorage.removeItem("cma-invite");
            setPendingInvite("");
            await loadFriends();
            goToView("Friends");
        }
        catch (e) {
            setError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    };
    return <div className="cma">
      <a href="#study-content" className="cma-skip">Skip to content</a>
      <main className="cma-main" id="study-content">
        <header className="cma-top">
          <Logo/>
          <div className="flex items-center gap-2">
            <label className="cma-level"><span>Your course</span><select value={level} disabled={busy || !!active} onChange={e => {setLevel(e.target.value as Level);setFocusSubject("");void act({action:"level",level:e.target.value});}}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></label>
            <button type="button" onClick={() => goToView("Syllabus")} className="cma-icon-button" title="ICMAI Syllabus 2022 Blueprint" aria-label="Syllabus"><GraduationCap size={18} /></button>
            <Link href="/profile" className="cma-icon-button" title="View & edit your CMA profile" aria-label="Your profile"><User size={18} /></Link>
          </div>
        </header>
        <div className="cma-page-heading"><div><span className="cma-eyebrow">CMA {level}</span><h1>{tab === "Overview" ? `Hi, ${profile?.name.split(" ")[0] ?? "there"}` : tab === "Library" ? "Study material" : tab === "Syllabus" ? "Syllabus" : tab === "Progress" ? "Your progress" : "Friends"}</h1><p>{tab === "Overview" ? "Pick a subject and press Start. Your study time is saved on its own." : tab === "Library" ? "Videos and PDFs for every paper. Open a subject to begin." : tab === "Syllabus" ? "All papers, chapters and how many marks each part carries." : tab === "Progress" ? "See how much you have studied and keep your streak going." : "Add friends, see who is studying, and keep each other going."}</p>{tab === "Overview" && <HandNote text={goalPercent >= 100 ? "Goal done. Well done!" : "One day at a time."}/>}</div>{tab === "Overview" && <img className="cma-heading-art doodle" src={goalPercent >= 100 ? "/illustrations/doodles/person-using-smartphone-successfully.svg" : "/illustrations/doodles/person-working-on-laptop.svg"} alt=""/>}</div>
        <ErrorText>{error || materialsError}</ErrorText>
        {pendingInvite && <section className="cma-panel cma-invite"><div><h2>A friend invited you</h2><p>If you accept, you both see each other’s name, streak and study time.</p></div><div className="cma-actions"><button disabled={busy} className="cma-primary" onClick={accept}>Accept</button><button className="cma-secondary" onClick={() => {sessionStorage.removeItem("cma-invite");setPendingInvite("");}}>Dismiss</button></div></section>}
        {tab === "Overview" && <section className="cma-stats" aria-label="Study snapshot">{[{icon:Clock3,label:"This week",value:duration(weekSeconds),note:"Monday to Sunday"},{icon:Flame,label:"Streak",value:`${streak} ${streak === 1 ? "day" : "days"}`,note:"Days in a row you opened the app"},{icon:BookOpen,label:"Finished",value:String(Object.values(entries).filter(e=>e.done).length),note:"Videos and PDFs marked done"}].map(({icon:Icon,...s}) => <div key={s.label}><span className="cma-stat-icon"><Icon size={19}/></span><div><span>{s.label}</span><strong>{detail ? s.value : "—"}</strong><small>{s.note}</small></div></div>)}</section>}
        {(tab === "Overview" || !!active) && <section className="cma-focus-card" aria-label="Study timer">
          <div className="cma-focus-copy">
            <span className="cma-eyebrow"><span className={active ? "cma-live-dot" : "cma-idle-dot"}/>{active ? "TIMER RUNNING" : "STUDY TIMER"}</span>
            <h2>{active ? "You are studying" : "Start studying"}</h2>
            {active ? <p className="cma-now-studying"><span className="tint" data-tint="green">{active.subject}</span>{SUBJECTS.find(x => x.id === active.subject)?.name}</p> : <fieldset className="cma-subject-picker" disabled={busy}>
              <legend>Pick a subject</legend>
              <div>{subjects.map(s => <label key={s.id}><input type="radio" name="focus-subject" value={s.id} checked={selected === s.id} onChange={() => {haptic();setFocusSubject(s.id);}}/><b>{s.id}</b><span>{s.name}</span></label>)}</div>
            </fieldset>}
            <button className="cma-primary" disabled={busy || !detail} onClick={() => {haptic(active ? "success" : "tap");void act(active ? {action:"stop",sessionId:active.id} : {action:"start",subject:selected});}}>{active ? <Pause size={19}/> : <Play size={19}/>} {busy ? "Saving…" : active ? "Stop and save" : `Start Paper ${selected}`}</button>
            <p className="cma-focus-foot"><Check size={14}/>{active ? "You can open notes or PDFs. The timer keeps running and saves every 30 seconds." : "Your time saves every 30 seconds. Keep this app open while you study."}</p>
          </div>
          <div className="cma-timer">
            <div className="cma-ring">
              <svg viewBox="0 0 233 233" aria-hidden="true"><circle className="cma-ring-track" cx="116.5" cy="116.5" r="108"/><circle className="cma-ring-fill" cx="116.5" cy="116.5" r="108" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - goalPercent} data-empty={goalPercent ? undefined : ""}/></svg>
              <div><output aria-label="Time studied in this session">{String(Math.floor(seconds/3600)).padStart(2,"0")}:{String(Math.floor(seconds%3600/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</output><small>{goalPercent >= 100 ? "Today’s goal done. Well done!" : `${duration(todaySeconds)} of ${duration(goal*60)} today`}</small></div>
            </div>
            <details className="cma-goal-edit"><summary>Change daily goal</summary><form onSubmit={e => {e.preventDefault();const minutes=Number(new FormData(e.currentTarget).get("minutes"));void act({action:"goal",minutes});}}><label>Daily goal in minutes<input name="minutes" type="number" min={15} max={720} step={15} required defaultValue={goal}/></label><button disabled={busy} className="cma-primary">Save goal</button></form></details>
          </div>
        </section>}
        {tab === "Overview" && <>
          <div className="cma-attendance" role="status">
              <span className="tint" data-tint="green"><Check size={18} aria-hidden="true"/></span>
              <span><b>{checked ? "Present today" : "Marking you present…"}</b><small>{presentThisWeek} of 7 days this week</small></span>
              <ol aria-hidden="true">{indiaWeek(clock).map(day => <li key={day} data-present={presentDays.has(day) || undefined} data-today={day === indiaDay(clock) || undefined}><i>{presentDays.has(day) && <Check size={11} strokeWidth={3}/>}</i>{new Date(`${day}T12:00:00`).toLocaleDateString("en-IN",{weekday:"narrow"})}</li>)}</ol>
            </div>

          <section><div className="cma-section-title"><div><h2>Your subjects</h2><p>Open a subject to watch videos and read PDFs.</p></div><div className="flex items-center gap-2"><button className="cma-text-button" onClick={() => goToView("Library")}>See all<ArrowRight size={17}/></button></div></div><div className="subject-grid cma-recent-grid">{subjects.slice(0,3).map((s,i) => {const files=(items ?? []).filter(m=>m.subjectId===s.id);const videos=files.filter(m=>m.type==="video").length;return <SubjectCard key={s.id} id={s.id} name={s.name} videos={videos} pdfs={files.length-videos} done={files.filter(m=>entries[m.id]?.done).length} index={SUBJECTS.filter(x=>x.level===level).findIndex(x=>x.id===s.id)} onOpen={() => goToView("Library",s.id)}/>;})}</div></section>
          <RoutinesSection compact/>
        </>}
        {tab === "Library" && <StudyLibrary key={level} level={level} items={items} entries={entries} onError={setError} onOpenSyllabus={() => goToView("Syllabus")}/>}
        {tab === "Syllabus" && (
          <SyllabusHub
            currentLevel={level}
            onStartStudy={(subId) => {
              setTab("Overview");
              setFocusSubject(subId);
              void act({ action: "start", subject: subId });
            }}
            onOpenLibrary={(subId) => {
              goToView("Library", subId);
            }}
          />
        )}
        {tab === "Progress" && <>
          <section className="prog-hero" aria-label="Time studied">
            <div className="cma-segments" aria-label="Choose a period">{[["today","Today"],["week","Week"],["month","Month"],["total","All time"]].map(([id,label])=><button key={id} aria-pressed={range===id} onClick={()=>setRange(id)}>{label}</button>)}</div>
            <div className="prog-total"><strong>{detail ? duration(rangeTotal) : "—"}</strong><span>studied {range==="total" ? "in total" : range==="today" ? "today" : range==="month" ? "this month" : "this week"}</span></div>
            {detail && prevTotal !== null && (prevTotal || rangeTotal) > 0 && <p className="prog-compare" data-up={rangeTotal >= prevTotal || undefined}>{rangeTotal >= prevTotal ? <TrendingUp size={16} aria-hidden="true"/> : <TrendingDown size={16} aria-hidden="true"/>}{duration(Math.abs(rangeTotal - prevTotal))} {rangeTotal >= prevTotal ? "more" : "less"} than {range==="today" ? "yesterday" : range==="week" ? "last week" : "last month"}</p>}
            <div className="prog-mini">
              <div><span className="tint" data-tint="orange"><Flame size={16} aria-hidden="true"/></span><b>{streak}</b><small>day streak</small></div>
              <div><span className="tint" data-tint="green"><Check size={16} aria-hidden="true"/></span><b>{goalDays}/7</b><small>goal days this week</small></div>
              <div><span className="tint" data-tint="blue"><Clock3 size={16} aria-hidden="true"/></span><b>{state.checkinCount ?? 0}</b><small>days present</small></div>
            </div>
          </section>

          <section className="cma-panel">
            <div className="cma-section-title"><div><h2>This week</h2><p>Dashed line is your goal of {duration(goal*60)} a day.</p></div></div>
            <div className="cma-week-chart prog-chart" style={{"--goal": `${goal*60/chartMax*100}%`} as React.CSSProperties} role="img" aria-label={"Study time this week: "+indiaWeek(clock).map(day=>day+" "+duration(dailyMap.get(day))).join(", ")}>{indiaWeek(clock).map(day=>{const time=dailyMap.get(day) ?? 0;return <div key={day} data-today={day===indiaDay(clock)} data-met={time >= goal*60 || undefined}><span>{time ? duration(time) : ""}</span><div className="cma-chart-track"><div style={{height:`${time ? Math.max(4,time/chartMax*100) : 0}%`}}/></div><small>{new Date(day+"T00:00:00Z").toLocaleDateString("en",{weekday:"short",timeZone:"UTC"})}</small></div>;})}</div>
          </section>

          <section className="cma-panel">
            <div className="cma-section-title"><div><h2>By subject</h2><p>Where your {range==="total" ? "" : range==="today" ? "today’s " : range==="month" ? "month’s " : "week’s "}time went.</p></div></div>
            {!Object.keys(rangeSubjects).length ? <div className="cma-empty"><img className="doodle" src="/illustrations/doodles/confident-person-walking.svg" alt="" loading="lazy"/><h3>No study time yet</h3><p>Start the timer on Home. Your time will show here.</p><button className="cma-secondary" onClick={()=>goToView("Overview")}>Go to Home</button></div> : <>
              <div className="prog-stack" aria-hidden="true">{Object.entries(rangeSubjects).sort((a,b)=>b[1]-a[1]).map(([id,time])=><span key={id} className="tint" data-tint={tintOf(id)} style={{width:`${time/rangeSum*100}%`}}/>)}</div>
              <ul className="prog-subjects">{Object.entries(rangeSubjects).sort((a,b)=>b[1]-a[1]).map(([id,time])=><li key={id}><span className="tint" data-tint={tintOf(id)}>{id}</span><span>{SUBJECTS.find(x=>x.id===id)?.name}</span><b>{duration(time)}</b><small>{Math.round(time/rangeSum*100)}%</small></li>)}</ul>
            </>}
          </section>

          <section className="cma-panel">
            <div className="cma-section-title"><div><h2>Last 5 weeks</h2><p>Darker means more study. A dashed box means you opened the app but did not study.</p></div></div>
            <div className="prog-heat" role="img" aria-label={`Studied on ${heatDays.filter(d => dailyMap.get(d)).length} of the last 35 days`}>
              {["M","T","W","T","F","S","S"].map((d,i)=><b key={i}>{d}</b>)}
              {heatDays.map(d => <span key={d} data-level={heatLevel(dailyMap.get(d) ?? 0)} data-present={present.has(d) || undefined} data-today={d === indiaDay(clock) || undefined} data-future={d > indiaDay(clock) || undefined} title={`${d}: ${duration(dailyMap.get(d))}`}/>)}
            </div>
            <div className="prog-legend" aria-hidden="true">Less{[0,1,2,3,4].map(l=><span key={l} data-level={l}/>)}More</div>
          </section>

          <section className="cma-panel">
            <div className="cma-section-title"><div><h2>Recent sessions</h2></div></div>
            {detail?.sessions.length ? <ul className="prog-sessions">{detail.sessions.slice(0,8).map((x,i)=><li key={i}><span className="tint" data-tint={tintOf(x.subject)}>{x.subject}</span><span><b>{SUBJECTS.find(y=>y.id===x.subject)?.name}</b><small>{new Date(x.startedAt).toLocaleString("en-IN",{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}</small></span><strong>{duration(x.seconds)}</strong></li>)}</ul> : <p>No sessions yet. Start the timer on Home.</p>}
          </section>
        </>}
        {tab === "Friends" && (
          <FriendsHub
            currentUserId={user?.uid}
            currentUserName={profile?.name}
            onStartStudy={(subId) => {
              setTab("Overview");
              setFocusSubject(subId);
              void act({ action: "start", subject: subId });
            }}
          />
        )}
        <footer className="cma-footer">
          <div className="cma-footer-links">
            <details><summary><span className="tint" data-tint="green"><ShieldCheck size={17} aria-hidden="true"/></span>Who can see my data?<ChevronDown size={18} aria-hidden="true"/></summary><p>Your teacher can see your profile, days present, study time and the files you opened. Friends see your name, streak, total study time and when you are studying. You can hide your study status in Friends.</p></details>
            <a href="https://icmai.in/ClntStudents/Student_Syllabus_2022" target="_blank" rel="noreferrer"><span className="tint" data-tint="violet"><GraduationCap size={17} aria-hidden="true"/></span>ICMAI syllabus 2022<ArrowUpRight size={18} aria-hidden="true"/><span className="sr-only">(opens in a new tab)</span></a>
          </div>
          <p className="cma-footer-sign"><strong>abhyas.</strong> Daily practice for CMA students in India.</p>
        </footer>
        <ProfileSetupModal
          isOpen={showSetupModal}
          initialName={profile?.name || ""}
          initialLevel={level}
          onComplete={(saved) => {
            setShowSetupModal(false);
            if (saved.level) setLevel(saved.level);
            refresh().catch(() => {});
          }}
          onClose={() => setShowSetupModal(false)}
          canDismiss={!!detail?.state?.onboardingCompleted}
        />
      </main>
      <StudyNavigation active={tab} onChange={goToView}/>
    </div>;
}
