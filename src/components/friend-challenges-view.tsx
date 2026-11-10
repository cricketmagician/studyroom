"use client";

import React, { useState } from "react";
import { ArrowLeft, Trophy, Users, Flame, Plus, Check, Swords, Shield, Medal } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  name: string;
  hours: number;
  streak: number;
  isMe?: boolean;
}

const LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: "Aarav Sharma", hours: 42.5, streak: 14 },
  { rank: 2, name: "Sneha Patel", hours: 38.0, streak: 11 },
  { rank: 3, name: "Rohan Deshmukh", hours: 35.5, streak: 9 },
  { rank: 4, name: "Neeraj Singh (You)", hours: 31.8, streak: 7, isMe: true },
  { rank: 5, name: "Pooja Hegde", hours: 28.2, streak: 5 },
  { rank: 6, name: "Kunal Ghosh", hours: 26.0, streak: 4 },
];

export function FriendChallengesView({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<"active" | "leaderboard">("active");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("15h");
  const [joinedChallenges, setJoinedChallenges] = useState<Record<string, boolean>>({
    c1: true,
  });

  const challenges = [
    {
      id: "c1",
      title: "CMA Inter 30-Hour Weekly Grind",
      desc: "Log 30 study hours across Cost Accounting & Direct Tax this week.",
      participants: 18,
      timeLeft: "3 Days Left",
      badge: "Group 1 League",
      progress: 68,
    },
    {
      id: "c2",
      title: "Marginal Costing 100-MCQ Sprint",
      desc: "Solve 100 MCQs with at least 80% accuracy before Sunday midnight.",
      participants: 24,
      timeLeft: "5 Days Left",
      badge: "Paper 8 Drill",
      progress: 40,
    },
    {
      id: "c3",
      title: "Companies Act 2013 Case Laws Sprint",
      desc: "Complete 15 case study analyses on Directors & Corporate Meetings.",
      participants: 14,
      timeLeft: "6 Days Left",
      badge: "Paper 5 Challenge",
      progress: 25,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full select-none pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white border border-[#EBE8E1] hover:bg-gray-50 flex items-center justify-center text-[#111110] transition-colors cursor-pointer shadow-2xs"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-apfel font-bold text-[#111110] tracking-tight">
              Friend Challenges
            </h1>
            <p className="text-xs text-[#71717A]">
              Compete with peer CMA aspirants, maintain streaks, and climb the leaderboard
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-2xl bg-[#111110] hover:bg-black text-white text-xs font-bold font-apfel flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Challenge</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#EFECE6] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
            activeTab === "active" ? "bg-[#111110] text-white" : "text-[#71717A] hover:text-[#111110]"
          }`}
        >
          Active Challenges (2)
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
            activeTab === "leaderboard" ? "bg-[#111110] text-white" : "text-[#71717A] hover:text-[#111110]"
          }`}
        >
          Weekly Leaderboard
        </button>
      </div>

      {/* Active Challenges View */}
      {activeTab === "active" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {challenges.map((item) => {
            const isJoined = !!joinedChallenges[item.id];
            return (
              <div
                key={item.id}
                className="p-5 rounded-[26px] bg-white border border-[#EBE8E1] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF2F8] text-[#EC4899] flex items-center justify-center">
                    <Swords className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EFECE6] text-[#71717A]">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-apfel font-bold text-base text-[#111110]">{item.title}</h3>
                  <p className="text-xs text-[#71717A] leading-relaxed">{item.desc}</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#88867E]">
                    <span>{item.progress}% Completed</span>
                    <span>{item.timeLeft}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#EC4899] rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F5F3ED] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                    <Users className="w-3.5 h-3.5 text-[#AAA79E]" />
                    <span>{item.participants} Competitors</span>
                  </div>

                  <button
                    onClick={() => setJoinedChallenges((prev) => ({ ...prev, [item.id]: !isJoined }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-apfel transition-all cursor-pointer ${
                      isJoined
                        ? "bg-[#EAF7EE] text-[#059669] border border-[#D1F2DD]"
                        : "bg-[#111110] text-white hover:bg-black"
                    }`}
                  >
                    {isJoined ? "Joined ✓" : "Join Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Leaderboard Table */
        <div className="rounded-[28px] bg-white border border-[#EBE8E1] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-[#F2EFE9]">
          {LEADERBOARD.map((u) => (
            <div
              key={u.rank}
              className={`p-4 flex items-center justify-between transition-colors ${
                u.isMe ? "bg-[#FAF8F5]" : "hover:bg-[#FCFBF9]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                    u.rank === 1
                      ? "bg-amber-100 text-amber-700"
                      : u.rank === 2
                      ? "bg-slate-100 text-slate-700"
                      : u.rank === 3
                      ? "bg-orange-100 text-orange-700"
                      : "text-[#71717A]"
                  }`}
                >
                  {u.rank}
                </div>
                <div>
                  <div className={`text-sm font-apfel font-bold ${u.isMe ? "text-[#111110]" : "text-[#27272A]"}`}>
                    {u.name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#88867E]">
                    <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                      <Flame className="w-3 h-3 fill-amber-500" /> {u.streak}D Streak
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-mono font-bold text-[#111110]">{u.hours} hrs</div>
                <div className="text-[10px] text-[#A1A1AA]">This Week</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#EBE8E1] p-6 space-y-4 shadow-2xl">
            <h3 className="font-apfel font-bold text-lg text-[#111110]">Create Study Challenge</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-mono uppercase text-[#71717A] text-[10px] font-bold block mb-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 20-Hour Cost Accounting Marathon"
                  className="w-full p-2.5 rounded-xl border border-[#EBE8E1] outline-none"
                />
              </div>

              <div>
                <label className="font-mono uppercase text-[#71717A] text-[10px] font-bold block mb-1">
                  Weekly Goal Target
                </label>
                <input
                  type="text"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EBE8E1] outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTitle("");
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#111110] text-white font-apfel font-bold text-xs uppercase cursor-pointer"
              >
                Create Challenge
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#EBE8E1] text-[#71717A] text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
