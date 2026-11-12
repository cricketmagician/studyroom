"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, CaretRight as ChevronRight, Copy, Fire as Flame, ChatCircle as MessageCircle, Play, Plus, PaperPlaneRight as Send, ShareNetwork as Share2, Trophy, UserMinus, UserPlus, UsersThree as Users, X } from "@phosphor-icons/react";
import { postAi } from "@/lib/ai-client";
import { SUBJECTS, duration } from "@/lib/cma";
import { haptic } from "@/lib/haptics";
import { getNotificationPermission, requestNotificationPermission, showPushNotification } from "@/lib/notifications";
import "./friends.css";

type Friend = { id: string; name: string; streak?: number; totalSeconds?: number; studying?: { subjectId: string; subjectName: string; startedAt: number } | null; lastSeen?: number | null };
type Message = { id: string; senderId: string; senderName: string; text: string; createdAt: number };
type Challenge = { id: string; title: string; targetHours: number; subject: string; creatorId: string; creatorName: string; participants: string[]; endsAt: number; board: { uid: string; name: string; seconds: number }[]; others: number };

const TINTS = ["blue", "amber", "green", "pink", "violet", "orange"];
const tintFor = (id: string) => TINTS[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length];
const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
function ago(ts: number, now: number) {
  const m = Math.max(1, Math.round((now - ts) / 60000));
  return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
}

function Avatar({ friend, size = 44 }: { friend: Pick<Friend, "id" | "name" | "studying">; size?: number }) {
  return (
    <span className="fr-avatar tint" data-tint={tintFor(friend.id)} data-live={friend.studying ? "" : undefined} style={{ width: size, height: size }} aria-hidden="true">
      {initials(friend.name)}
    </span>
  );
}

export function FriendsHub({ currentUserId, onStartStudy }: { currentUserId?: string; currentUserName?: string; onStartStudy?: (subjectId: string) => void }) {
  const [tab, setTab] = useState<"friends" | "challenges">("friends");
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [hideStatus, setHideStatus] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notice, setNotice] = useState<{ text: string; bad?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [push, setPush] = useState<string>("default");
  const [now, setNow] = useState(() => Date.now());
  // Invite sheet
  const inviteSheet = useRef<HTMLDialogElement>(null);
  const [invite, setInvite] = useState<{ code: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState("");
  // Chat sheet
  const chatSheet = useRef<HTMLDialogElement>(null);
  const [chatWith, setChatWith] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  // New challenge sheet
  const challengeSheet = useRef<HTMLDialogElement>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newHours, setNewHours] = useState(10);
  const [newSubject, setNewSubject] = useState("All Subjects");

  const say = (text: string, bad = false) => { setNotice({ text, bad }); if (!bad) setTimeout(() => setNotice(null), 4000); };
  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try { await work(); } catch (e) { haptic("warning"); say((e as Error).message, true); } finally { setBusy(false); }
  };

  const loadFriends = useCallback(async () => {
    const res = await postAi<{ friends: Friend[]; hideStudyStatus?: boolean }>("/api/study", { action: "friends" });
    setFriends(res.friends ?? []);
    setHideStatus(Boolean(res.hideStudyStatus));
  }, []);
  const loadChallenges = useCallback(async () => {
    setChallenges((await postAi<{ challenges: Challenge[] }>("/api/study", { action: "challenge_list" })).challenges ?? []);
  }, []);

  useEffect(() => {
    const first = setTimeout(() => { setPush(getNotificationPermission()); loadFriends().catch((e) => say(e.message, true)); loadChallenges().catch(() => {}); }, 0);
    const every = setInterval(() => { setNow(Date.now()); loadFriends().catch(() => {}); }, 15000);
    return () => { clearTimeout(first); clearInterval(every); };
  }, [loadFriends, loadChallenges]);

  // Chat: poll while the sheet is open.
  useEffect(() => {
    if (!chatWith) return;
    const load = () => postAi<{ messages: Message[] }>("/api/study", { action: "chat_messages", friendId: chatWith.id }).then((r) => setMessages(r.messages ?? [])).catch(() => {});
    const first = setTimeout(load, 0);
    const every = setInterval(load, 3000);
    return () => { clearTimeout(first); clearInterval(every); };
  }, [chatWith]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [messages]);

  const openInvite = () => {
    inviteSheet.current?.showModal();
    if (invite) return;
    void run(async () => {
      const res = await postAi<{ token: string; code: string }>("/api/study", { action: "invite" });
      setInvite({ code: res.code, url: `${location.origin}/?invite=${res.token}` });
    });
  };
  const inviteText = invite ? `Let's study CMA together on Abhyas. Tap to add me: ${invite.url} (or use my code ${invite.code})` : "";
  const copyInvite = async () => { await navigator.clipboard.writeText(inviteText); haptic(); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareInvite = async () => { try { await navigator.share({ title: "Study with me on Abhyas", text: inviteText }); } catch { /* closed the share sheet */ } };

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    void run(async () => {
      await postAi("/api/study", { action: "accept", code: code.trim() });
      haptic("success"); setCode(""); inviteSheet.current?.close(); say("You are now friends.");
      await loadFriends();
    });
  };

  const openChat = (f: Friend) => { setMessages([]); setChatWith(f); chatSheet.current?.showModal(); };
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !chatWith) return;
    setDraft("");
    void run(async () => {
      const r = await postAi<{ message: Message }>("/api/study", { action: "chat_send", friendId: chatWith.id, text });
      haptic(); setMessages((m) => [...m, r.message]);
    });
  };
  const unfriend = () => {
    if (!chatWith || !confirm(`Remove ${chatWith.name} from your friends? Your chat with them will be deleted for both of you.`)) return;
    void run(async () => {
      await postAi("/api/study", { action: "unfriend", friendId: chatWith.id });
      chatSheet.current?.close(); setChatWith(null); say(`${chatWith.name} was removed.`);
      await loadFriends(); await loadChallenges();
    });
  };

  const createChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await postAi("/api/study", { action: "challenge_create", title: newTitle.trim(), targetHours: newHours, subject: newSubject });
      haptic("success"); challengeSheet.current?.close(); setNewTitle(""); say("Challenge started. Your friends can join it now.");
      await loadChallenges();
    });
  };
  const joinChallenge = (id: string) => void run(async () => { await postAi("/api/study", { action: "challenge_join", challengeId: id }); haptic("success"); await loadChallenges(); });

  const togglePrivacy = () => {
    const next = !hideStatus;
    setHideStatus(next); haptic();
    postAi("/api/study", { action: "privacy", hideStudyStatus: next }).catch(() => { setHideStatus(!next); say("Could not change this. Try again.", true); });
  };
  const enableAlerts = async () => {
    const p = await requestNotificationPermission();
    setPush(p);
    if (p === "granted") await showPushNotification("Abhyas: alerts are on", { body: "You will hear when friends start studying or invite you." });
  };

  const sorted = [...(friends ?? [])].sort((a, b) => Number(!!b.studying) - Number(!!a.studying) || (b.streak ?? 0) - (a.streak ?? 0));
  const live = sorted.filter((f) => f.studying);

  return (
    <section className="fr" aria-label="Friends">
      {notice && <p role={notice.bad ? "alert" : "status"} className={`fr-notice${notice.bad ? " bad" : ""}`}>{notice.text}{notice.bad && <button type="button" aria-label="Dismiss" onClick={() => setNotice(null)}><X size={16} /></button>}</p>}

      {live.length > 0 && (
        <div className="fr-live" aria-label="Friends studying now">
          <h2 className="cma-eyebrow"><span className="cma-live-dot" />Studying now</h2>
          <div>{live.map((f) => (
            <button type="button" key={f.id} onClick={() => openChat(f)}>
              <Avatar friend={f} size={55} />
              <b>{f.name.split(" ")[0]}</b>
              <small>{now - f.studying!.startedAt < 60000 ? "Just started" : duration((now - f.studying!.startedAt) / 1000)}</small>
            </button>
          ))}</div>
        </div>
      )}

      <div className="fr-bar">
        <div className="cma-segments" aria-label="Show">
          <button type="button" aria-pressed={tab === "friends"} onClick={() => setTab("friends")}><Users size={15} aria-hidden="true" />Friends{friends?.length ? ` (${friends.length})` : ""}</button>
          <button type="button" aria-pressed={tab === "challenges"} onClick={() => setTab("challenges")}><Trophy size={15} aria-hidden="true" />Challenges{challenges.length ? ` (${challenges.length})` : ""}</button>
        </div>
        <button type="button" className="cma-primary fr-add" onClick={tab === "friends" ? openInvite : () => challengeSheet.current?.showModal()}>
          {tab === "friends" ? <UserPlus size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}{tab === "friends" ? "Invite" : "New"}
        </button>
      </div>

      {tab === "friends" && (friends === null ? <p className="cma-loading">Loading your friends…</p> : !friends.length ? (
        <div className="cma-empty">
          {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
          <img src="/illustrations/doodles/characters-playing-chess-game.svg" alt="" className="doodle" />
          <h3>Study is better with friends</h3>
          <p>See when friends are studying, keep each other&apos;s streaks going, and race in weekly challenges.</p>
          <div className="fr-empty-actions">
            <button type="button" className="cma-primary" onClick={openInvite}><UserPlus size={17} aria-hidden="true" />Invite a friend</button>
            <button type="button" className="cma-secondary" onClick={openInvite}>I have a code</button>
          </div>
        </div>
      ) : (
        <ul className="fr-list">
          {sorted.map((f) => (
            <li key={f.id}>
              <button type="button" onClick={() => openChat(f)}>
                <Avatar friend={f} />
                <span className="fr-who">
                  <b>{f.name}</b>
                  <small data-live={f.studying ? "" : undefined}>
                    {f.studying ? `Studying ${f.studying.subjectName.replace(/^Paper \w+ · /, "")}` : f.lastSeen ? `Active ${ago(f.lastSeen, now)}` : "Study status hidden"}
                  </small>
                </span>
                <span className="fr-stats"><span><Flame size={13} aria-hidden="true" />{f.streak ?? 0}</span><span>{duration(f.totalSeconds ?? 0)}</span></span>
                <MessageCircle size={19} aria-label={`Chat with ${f.name}`} className="fr-chat-icon" />
              </button>
            </li>
          ))}
        </ul>
      ))}

      {tab === "challenges" && (!challenges.length ? (
        <div className="cma-empty">
          <span className="tint fr-empty-icon" data-tint="amber"><Trophy size={26} aria-hidden="true" /></span>
          <h3>Start a study race</h3>
          <p>Pick a target, like 10 hours this week. Friends join, and everyone sees who is ahead.</p>
          <button type="button" className="cma-primary" onClick={() => challengeSheet.current?.showModal()}><Plus size={17} aria-hidden="true" />New challenge</button>
        </div>
      ) : (
        <div className="fr-challenges">
          {challenges.map((c) => {
            const joined = !!currentUserId && c.participants.includes(currentUserId);
            const daysLeft = Math.ceil((c.endsAt - now) / 86400000);
            return (
              <article key={c.id} className="fr-challenge">
                <header>
                  <span className="tint" data-tint="amber"><Trophy size={20} aria-hidden="true" /></span>
                  <div><h3>{c.title}</h3><small>{c.targetHours} hours · {c.subject} · {daysLeft > 0 ? `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left` : "Ended"}</small></div>
                </header>
                <ol className="fr-board">
                  {c.board.map((p, i) => (
                    <li key={p.uid} data-me={p.uid === currentUserId ? "" : undefined}>
                      <span className="fr-rank">{i + 1}</span>
                      <span className="fr-board-name">{p.uid === currentUserId ? "You" : p.name}</span>
                      <span className="fr-board-bar"><progress value={Math.min(p.seconds, c.targetHours * 3600)} max={c.targetHours * 3600} aria-label={`${p.name}: ${duration(p.seconds)} of ${c.targetHours} hours`} /></span>
                      <span className="fr-board-time">{duration(p.seconds)}</span>
                    </li>
                  ))}
                </ol>
                {c.others > 0 && <small className="fr-others">+{c.others} more {c.others === 1 ? "person" : "people"}</small>}
                {!joined && daysLeft > 0 && <button type="button" className="cma-primary" disabled={busy} onClick={() => joinChallenge(c.id)}>Join {c.creatorName.split(" ")[0]}&apos;s challenge</button>}
              </article>
            );
          })}
        </div>
      ))}

      <h2 className="profile-group-title">Your settings</h2>
      <ul className="profile-list">
        <li><label><span className="tint" data-tint="green"><Users size={18} /></span><span className="profile-row-label">Friends can see when I study</span><input type="checkbox" role="switch" className="profile-switch" checked={!hideStatus} onChange={togglePrivacy} /></label></li>
        <li><div><span className="tint" data-tint="orange"><Bell size={18} /></span><span className="profile-row-label">Friend alerts</span>
          {push === "granted" ? <span className="profile-row-value"><Check size={16} aria-hidden="true" /> On</span>
            : <button type="button" className="profile-pill" disabled={push === "denied" || push === "unsupported"} onClick={enableAlerts}>{push === "denied" ? "Blocked in browser" : push === "unsupported" ? "Not on this browser" : "Turn on"}</button>}
        </div></li>
      </ul>

      {/* Invite sheet */}
      <dialog ref={inviteSheet} className="profile-sheet fr-sheet" aria-labelledby="invite-title">
        <div className="fr-sheet-body">
          <header><h2 id="invite-title">Invite a friend</h2><button type="button" aria-label="Close" onClick={() => inviteSheet.current?.close()}><X size={20} /></button></header>
          <p>Send your link. When your friend opens it and logs in, you are friends. It works for 7 days.</p>
          <div className="fr-code" aria-live="polite">{invite ? invite.code : "Making your code…"}</div>
          <div className="fr-share">
            <a className="fr-whatsapp" href={invite ? `https://wa.me/?text=${encodeURIComponent(inviteText)}` : undefined} target="_blank" rel="noreferrer" aria-disabled={!invite} onClick={() => haptic()}>
              <MessageCircle size={18} aria-hidden="true" />Share on WhatsApp
            </a>
            <button type="button" className="cma-secondary" disabled={!invite} onClick={copyInvite}>{copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}{copied ? "Copied" : "Copy link"}</button>
            {typeof navigator !== "undefined" && "share" in navigator && <button type="button" className="cma-secondary" disabled={!invite} onClick={shareInvite}><Share2 size={17} aria-hidden="true" />More</button>}
          </div>
          <form onSubmit={join} className="fr-join">
            <label htmlFor="friend-code">Got a code from a friend?</label>
            <div><input id="friend-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CMA-AB12CD" autoComplete="off" autoCapitalize="characters" maxLength={40} /><button type="submit" className="cma-primary" disabled={busy || !code.trim()}>Add</button></div>
          </form>
        </div>
      </dialog>

      {/* Chat sheet */}
      <dialog ref={chatSheet} className="profile-sheet fr-sheet fr-chat" aria-labelledby="chat-title" onClose={() => setChatWith(null)}>
        {chatWith && (
          <div className="fr-chat-wrap">
            <header>
              <Avatar friend={chatWith} size={40} />
              <div><h2 id="chat-title">{chatWith.name}</h2><small>{chatWith.studying ? `Studying now · ${chatWith.studying.subjectName}` : `${chatWith.streak ?? 0} day streak · ${duration(chatWith.totalSeconds ?? 0)} studied`}</small></div>
              <button type="button" aria-label="Close" onClick={() => chatSheet.current?.close()}><X size={20} /></button>
            </header>
            {chatWith.studying && onStartStudy && (
              <button type="button" className="fr-together" onClick={() => { haptic("success"); chatSheet.current?.close(); onStartStudy(chatWith.studying!.subjectId); }}>
                <Play size={16} aria-hidden="true" />Study {chatWith.studying.subjectName.replace(/^Paper \w+ · /, "")} with {chatWith.name.split(" ")[0]}<ChevronRight size={16} aria-hidden="true" />
              </button>
            )}
            <div className="fr-messages" aria-live="polite">
              {!messages.length && <p className="fr-hint">Say hi, or ask what {chatWith.name.split(" ")[0]} is studying today.</p>}
              {messages.map((m) => <p key={m.id} className="fr-msg" data-me={m.senderId === currentUserId ? "" : undefined}>{m.text}<small>{new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</small></p>)}
              <div ref={bottom} />
            </div>
            <form onSubmit={send} className="fr-compose">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message" aria-label={`Message ${chatWith.name}`} maxLength={2000} autoComplete="off" />
              <button type="submit" aria-label="Send" disabled={!draft.trim()}><Send size={18} /></button>
            </form>
            <button type="button" className="fr-remove" onClick={unfriend}><UserMinus size={15} aria-hidden="true" />Remove friend</button>
          </div>
        )}
      </dialog>

      {/* New challenge sheet */}
      <dialog ref={challengeSheet} className="profile-sheet fr-sheet" aria-labelledby="challenge-title">
        <form onSubmit={createChallenge}>
          <header><h2 id="challenge-title">New challenge</h2><button type="button" aria-label="Close" onClick={() => challengeSheet.current?.close()}><X size={20} /></button></header>
          <label>Name<input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Cost Accounting sprint" maxLength={120} required /></label>
          <fieldset><legend>Target for the next 7 days</legend><div className="profile-chips">{[5, 10, 15, 20, 30].map((h) => <label key={h}><input type="radio" name="hours" checked={newHours === h} onChange={() => setNewHours(h)} />{h} hours</label>)}</div></fieldset>
          <label>Subject<select value={newSubject} onChange={(e) => setNewSubject(e.target.value)}><option>All Subjects</option>{SUBJECTS.map((s) => <option key={s.id} value={s.name}>Paper {s.id} · {s.name}</option>)}</select></label>
          <button type="submit" className="cma-primary" disabled={busy}>{busy ? "Starting…" : "Start challenge"}</button>
        </form>
      </dialog>
    </section>
  );
}
