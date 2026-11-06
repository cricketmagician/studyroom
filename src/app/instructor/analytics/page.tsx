"use client";

import React from "react";
import { useApp } from "@/lib/store/app-store";
import { BarChart3, TrendingUp, Eye, PlayCircle, FileText, CheckCircle2 } from "lucide-react";

export default function InstructorAnalyticsPage() {
  const { courses } = useApp();

  const metrics = [
    { label: "Total Lecture Starts", value: "1,420", change: "+14% this month" },
    { label: "Avg. Completion Rate", value: "78.4%", change: "+5.2% vs previous term" },
    { label: "Monograph PDF Reads", value: "892", change: "Top: Readwise Heuristic" },
    { label: "Active Discussion Notes", value: "340", change: "18 new today" }
  ];

  const lessonRetention = [
    { name: "L1: Spatial Models & Cognitive Interfaces", starts: 420, completed: 380, rate: 90 },
    { name: "L2: The Readwise Heuristic (PDF)", starts: 380, completed: 345, rate: 91 },
    { name: "L3: Design System Spec (Assignment)", starts: 310, completed: 285, rate: 92 },
    { name: "L4: Typographic Scales: Manrope & Inter", starts: 280, completed: 210, rate: 75 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
          Curriculum Analytics & Engagement
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Real-time telemetry on video playback completion, monograph access, and student retention
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xs">
            <span className="text-xs text-[var(--text-secondary)]">{m.label}</span>
            <div className="text-2xl font-heading font-bold text-[var(--text-primary)] mt-1">{m.value}</div>
            <span className="text-[10px] text-emerald-600 font-medium">{m.change}</span>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-xs space-y-4">
        <h2 className="text-base font-heading font-bold text-[var(--text-primary)]">
          Lesson Completion Rates (DES-401)
        </h2>

        <div className="space-y-4">
          {lessonRetention.map((item) => (
            <div key={item.name} className="space-y-1.5 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-[var(--text-primary)]">{item.name}</span>
                <span className="font-mono text-[var(--accent)] font-semibold">{item.rate}% ({item.completed}/{item.starts})</span>
              </div>
              <div className="w-full bg-[var(--border-color)]/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
