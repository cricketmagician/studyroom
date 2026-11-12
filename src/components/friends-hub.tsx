"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Books, CaretLeft, Check, CaretRight as ChevronRight, Copy, DotsThree, Fire as Flame, ChatCircle as MessageCircle, Plus, PaperPlaneRight as Send, ShareNetwork as Share2, Trophy, UserMinus, UserPlus, UsersThree as Users, X } from "@phosphor-icons/react";
import { postAi } from "@/lib/ai-client";
import { useAuth } from "@/lib/auth";
import { SUBJECTS, duration } from "@/lib/cma";
import { haptic } from "@/lib/haptics";
import { getNotificationPermission, requestNotificationPermission, showPushNotification } from "@/lib/notifications";
import "./friends.css";

type Friend = { id: string; name: string; streak?: number; totalSeconds?: number; studying?: { subjectId: string; subjectName: string; startedAt: number } | null; lastSeen?: number | null };
type Message = { id: string; senderId: string; senderName: string; text: string; createdAt: number; challengeId?: string };
const QUICK_REPLIES = ["Studying now?", "Let's study together", "Which chapter are you on?", "Done for today!"];
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
  const { profile } = useAuth();
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
  const [picked, setPicked] = useState<string[]>([]);
  // Invite friends to an existing challenge
  const pickSheet = useRef<HTMLDialogElement>(null);
  const [inviteFor, setInviteFor] = useState<Challenge | null>(null);
  const [menu, setMenu] = useState(false);

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

  const openChat = (f: Friend) => { setMessages([]); setMenu(false); setChatWith(f); chatSheet.current?.showModal(); };
  const send = (e?: React.FormEvent, quick?: string) => {
    e?.preventDefault();
    const text = (quick ?? draft).trim();
    if (!text || !chatWith) return;
    if (!quick) setDraft("");
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
      const r = await postAi<{ challenge: { id: string } }>("/api/study", { action: "challenge_create", title: newTitle.trim(), targetHours: newHours, subject: newSubject });
      if (picked.length) await postAi("/api/study", { action: "challenge_invite", challengeId: r.challenge.id, friendIds: picked });
      haptic("success"); challengeSheet.current?.close(); setNewTitle("");
      say(picked.length ? `Challenge started. Invite sent to ${picked.length} ${picked.length === 1 ? "friend" : "friends"} in chat.` : "Challenge started. Your friends can join it now.");
      setPicked([]);
      await loadChallenges();
    });
  };
  const joinChallenge = (id: string) => void run(async () => { await postAi("/api/study", { action: "challenge_join", challengeId: id }); haptic("success"); say("You joined the challenge."); await loadChallenges(); });
  const openPick = (c: Challenge) => { setInviteFor(c); setPicked([]); pickSheet.current?.showModal(); };
  const sendPicks = () => {
    if (!inviteFor || !picked.length) return;
    void run(async () => {
      await postAi("/api/study", { action: "challenge_invite", challengeId: inviteFor.id, friendIds: picked });
      haptic("success"); pickSheet.current?.close(); say(`Invite sent to ${picked.length} ${picked.length === 1 ? "friend" : "friends"} in chat.`); setPicked([]);
    });
  };
  const togglePick = (id: string) => { haptic(); setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); };
  // A picker of friends, shared by "new challenge" and "invite to challenge".
  const friendPicker = (exclude: string[] = []) => {
    const list = (friends ?? []).filter((f) => !exclude.includes(f.id));
    return list.length ? <div className="fr-pick">{list.map((f) => <label key={f.id}><input type="checkbox" checked={picked.includes(f.id)} onChange={() => togglePick(f.id)} /><Avatar friend={f} size={40} /><span>{f.name.split(" ")[0]}</span></label>)}</div>
      : <p className="fr-pick-empty">{friends?.length ? "All your friends are already in." : "Add friends first, then invite them here."}</p>;
  };

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
                {joined && daysLeft > 0 && !!friends?.length && <button type="button" className="cma-secondary fr-invite-btn" onClick={() => openPick(c)}><UserPlus size={17} aria-hidden="true" />Invite friends</button>}
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
              <button type="button" className="fr-back" aria-label="Back to friends" onClick={() => chatSheet.current?.close()}><CaretLeft size={22} /></button>
              <Avatar friend={chatWith} size={40} />
              <div><h2 id="chat-title">{chatWith.name}</h2><small data-live={chatWith.studying ? "" : undefined}>{chatWith.studying ? `Studying now · ${chatWith.studying.subjectName.replace(/^Paper \w+ · /, "")}` : `${chatWith.streak ?? 0} day streak · ${duration(chatWith.totalSeconds ?? 0)} studied`}</small></div>
              <div className="fr-menu">
                <button type="button" aria-label="More options" aria-expanded={menu} onClick={() => setMenu(!menu)}><DotsThree size={22} weight="bold" /></button>
                {menu && <div role="menu"><button type="button" role="menuitem" onClick={unfriend}><UserMinus size={17} aria-hidden="true" />Remove friend</button></div>}
              </div>
            </header>
            {chatWith.studying && onStartStudy && (
              <button type="button" className="fr-together" onClick={() => { haptic("success"); chatSheet.current?.close(); onStartStudy(chatWith.studying!.subjectId); }}>
                <span className="cma-live-dot" />Study {chatWith.studying.subjectName.replace(/^Paper \w+ · /, "")} with {chatWith.name.split(" ")[0]}<ChevronRight size={16} aria-hidden="true" />
              </button>
            )}
            <div className="fr-messages" aria-live="polite">
              {!messages.length && (
                <div className="fr-chat-empty">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Supplied local vector illustration. */}
                  <img src="/illustrations/doodles/characters-playing-chess-game.svg" alt="" className="doodle" />
                  <b>Say hi to {chatWith.name.split(" ")[0]}</b>
                  <span>Ask what they are studying, or plan a session together.</span>
                </div>
              )}
              {messages.map((m, i) => {
                const prev = messages[i - 1], next = messages[i + 1];
                const day = new Date(m.createdAt).toDateString();
                const newDay = !prev || new Date(prev.createdAt).toDateString() !== day;
                const lastOfGroup = !next || !!next.challengeId || next.senderId !== m.senderId || next.createdAt - m.createdAt > 300000;
                const mine = m.senderId === currentUserId;
                const ch = m.challengeId ? challenges.find((c) => c.id === m.challengeId) : undefined;
                const joinedCh = !!ch && !!currentUserId && ch.participants.includes(currentUserId);
                return (
                  <React.Fragment key={m.id}>
                    {newDay && <span className="fr-day">{day === new Date(now).toDateString() ? "Today" : day === new Date(now - 86400000).toDateString() ? "Yesterday" : new Date(m.createdAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>}
                    {m.challengeId ? (
                      <div className="fr-msg-card" data-me={mine ? "" : undefined}>
                        <span className="tint" data-tint="amber"><Trophy size={20} aria-hidden="true" /></span>
                        <b>{ch?.title ?? "Study challenge"}</b>
                        <span>{mine ? "You invited them to your challenge." : m.text}</span>
                        {!mine && (joinedCh ? <span className="fr-joined"><Check size={15} aria-hidden="true" />You are in</span> : ch ? <button type="button" className="cma-primary" disabled={busy} onClick={() => joinChallenge(ch.id)}>Join challenge</button> : <small>This challenge has ended.</small>)}
                      </div>
                    ) : (
                      <p className="fr-msg" data-me={mine ? "" : undefined} data-last={lastOfGroup ? "" : undefined}>{m.text}{lastOfGroup && <small>{new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</small>}</p>
                    )}
                  </React.Fragment>
                );
              })}
              <div ref={bottom} />
            </div>
            <div className="fr-quick" aria-label="Quick replies">{QUICK_REPLIES.map((q) => <button type="button" key={q} disabled={busy} onClick={() => send(undefined, q)}>{q}</button>)}</div>
            <form onSubmit={send} className="fr-compose">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${chatWith.name.split(" ")[0]}`} aria-label={`Message ${chatWith.name}`} maxLength={2000} autoComplete="off" enterKeyHint="send" />
              <button type="submit" aria-label="Send" disabled={!draft.trim()} data-ready={draft.trim() ? "" : undefined}><Send size={18} weight="fill" /></button>
            </form>
          </div>
        )}
      </dialog>

      {/* New challenge sheet */}
      <dialog ref={challengeSheet} className="profile-sheet fr-sheet" aria-labelledby="challenge-title">
        <form onSubmit={createChallenge}>
          <header><h2 id="challenge-title">New challenge</h2><button type="button" aria-label="Close" onClick={() => challengeSheet.current?.close()}><X size={20} /></button></header>
          <label>Name<input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Cost Accounting sprint" maxLength={120} required /></label>
          <fieldset><legend>Target for the next 7 days</legend><div className="profile-chips">{[5, 10, 15, 20, 30].map((h) => <label key={h}><input type="radio" name="hours" checked={newHours === h} onChange={() => setNewHours(h)} />{h} hours</label>)}</div></fieldset>
          <fieldset className="cma-subject-picker fr-subjects">
            <legend>Subject</legend>
            <div>
              <label><input type="radio" name="ch-subject" checked={newSubject === "All Subjects"} onChange={() => { haptic(); setNewSubject("All Subjects"); }} /><b><Books size={18} aria-hidden="true" /></b><span>All subjects</span></label>
              {SUBJECTS.filter((x) => x.level === (profile?.level ?? "Intermediate")).map((x) => <label key={x.id}><input type="radio" name="ch-subject" checked={newSubject === x.name} onChange={() => { haptic(); setNewSubject(x.name); }} /><b>{x.id}</b><span>{x.name}</span></label>)}
            </div>
          </fieldset>
          <fieldset><legend>Invite friends {picked.length ? `(${picked.length})` : "(optional)"}</legend>{friendPicker()}</fieldset>
          <button type="submit" className="cma-primary" disabled={busy}>{busy ? "Starting…" : picked.length ? `Start and invite ${picked.length}` : "Start challenge"}</button>
        </form>
      </dialog>

      {/* Invite friends to a challenge */}
      <dialog ref={pickSheet} className="profile-sheet fr-sheet" aria-labelledby="pick-title">
        <div className="fr-sheet-body">
          <header><h2 id="pick-title">Invite to {inviteFor?.title ?? "challenge"}</h2><button type="button" aria-label="Close" onClick={() => pickSheet.current?.close()}><X size={20} /></button></header>
          <p>They get a card in your chat and can join with one tap.</p>
          {friendPicker(inviteFor?.participants ?? [])}
          <button type="button" className="cma-primary" disabled={busy || !picked.length} onClick={sendPicks}><UserPlus size={17} aria-hidden="true" />{picked.length ? `Send invite to ${picked.length}` : "Choose friends"}</button>
        </div>
      </dialog>
    </section>
  );
}
