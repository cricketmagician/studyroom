"use client";

import React, { useState } from "react";
import { ArrowLeft, Calendar, Plus, Check, Clock, Sparkles, AlertCircle, Trash2 } from "lucide-react";

interface StudyTask {
  id: string;
  time: string;
  subject: string;
  topic: string;
  done: boolean;
}

export function StudyPlannerView({ onBack }: { onBack?: () => void }) {
  const [tasks, setTasks] = useState<StudyTask[]>([
    {
      id: "p-1",
      time: "09:00 - 10:30 AM",
      subject: "Cost Accounting",
      topic: "Marginal Costing Formulas & Illustration 12-18",
      done: true,
    },
    {
      id: "p-2",
      time: "11:45 - 01:00 PM",
      subject: "Financial Accounting",
      topic: "Consignment Accounts: Abnormal Loss & Commission",
      done: true,
    },
    {
      id: "p-3",
      time: "03:30 - 05:00 PM",
      subject: "Direct Taxation",
      topic: "Capital Gains Deductions u/s 54, 54EC, 54F",
      done: false,
    },
    {
      id: "p-4",
      time: "07:00 - 08:00 PM",
      subject: "Business Laws",
      topic: "Companies Act: Disqualification of Directors Sec 164",
      done: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSub, setNewSub] = useState("Cost Accounting");
  const [newTopic, setNewTopic] = useState("");
  const [newTime, setNewTime] = useState("08:30 - 09:30 PM");

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = () => {
    if (!newTopic.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        time: newTime,
        subject: newSub,
        topic: newTopic.trim(),
        done: false,
      },
    ]);
    setNewTopic("");
    setShowAddModal(false);
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPct = Math.round((completedCount / (tasks.length || 1)) * 100);

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
              Study Planner
            </h1>
            <p className="text-xs text-[#71717A]">
              Strategic syllabus roadmap &amp; daily interval targets
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-2xl bg-[#111110] hover:bg-black text-white text-xs font-bold font-apfel flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Exam Countdown Hero */}
      <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#18181B] to-[#27272A] text-white space-y-4 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#34D399]" />
            ICMAI Exam Countdown
          </span>
          <span className="text-[#34D399] font-bold">June 2026 Session</span>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center pt-1">
          {[
            { val: "48", lbl: "Days" },
            { val: "14", lbl: "Hours" },
            { val: "32", lbl: "Mins" },
            { val: "100%", lbl: "Syllabus Target" },
          ].map((c, i) => (
            <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl sm:text-3xl font-apfel font-bold text-white tracking-tight">
                {c.val}
              </div>
              <div className="text-[10px] font-mono text-[#A1A1AA] uppercase mt-0.5">
                {c.lbl}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule Card */}
      <div className="p-6 rounded-[28px] bg-white border border-[#EBE8E1] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-apfel font-bold text-base text-[#111110]">
              Today&apos;s Target Schedule
            </h3>
            <p className="text-xs text-[#71717A]">
              {completedCount} of {tasks.length} Revision Blocks Completed ({progressPct}%)
            </p>
          </div>

          <div className="w-28 h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                task.done
                  ? "bg-[#FAFBF9] border-[#D1F2DD]"
                  : "bg-white border-[#EBE8E1] hover:border-[#D0CABE]"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    task.done
                      ? "bg-[#10B981] text-white"
                      : "border border-[#D4D4D8] text-transparent group-hover:border-[#111110]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">
                      {task.time}
                    </span>
                    <span className="text-xs font-semibold text-[#88867E]">
                      {task.subject}
                    </span>
                  </div>
                  <div
                    className={`font-apfel text-sm font-bold mt-1 truncate ${
                      task.done ? "line-through text-[#A1A1AA]" : "text-[#111110]"
                    }`}
                  >
                    {task.topic}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => deleteTask(task.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#AAA79E] hover:text-[#EF4444] transition-all cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#EBE8E1] p-6 space-y-4 shadow-2xl">
            <h3 className="font-apfel font-bold text-lg text-[#111110]">Add Study Task</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-mono uppercase text-[#71717A] text-[10px] font-bold block mb-1">
                  Subject
                </label>
                <select
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EBE8E1] outline-none"
                >
                  <option>Cost Accounting</option>
                  <option>Financial Accounting</option>
                  <option>Direct Taxation</option>
                  <option>Business Laws</option>
                </select>
              </div>

              <div>
                <label className="font-mono uppercase text-[#71717A] text-[10px] font-bold block mb-1">
                  Topic / Chapter Target
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Variance Analysis Exercise 1-5"
                  className="w-full p-2.5 rounded-xl border border-[#EBE8E1] outline-none"
                />
              </div>

              <div>
                <label className="font-mono uppercase text-[#71717A] text-[10px] font-bold block mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EBE8E1] outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={addTask}
                className="flex-1 py-2.5 rounded-xl bg-[#111110] text-white font-apfel font-bold text-xs uppercase cursor-pointer"
              >
                Save Task
              </button>
              <button
                onClick={() => setShowAddModal(false)}
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
