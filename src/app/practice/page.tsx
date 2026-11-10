"use client";

import React from "react";
import Link from "next/link";
import { PracticeView } from "@/components/practice-view";
import { MaterialIcon } from "@/components/material-icon";

export default function PracticePage() {
  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] text-[#111110] font-absans flex flex-col lg:flex-row select-none">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#FCFBF8] border-r border-[#EFECE6] flex-col justify-between p-6 shrink-0 sticky top-0 h-screen select-none">
        <div className="space-y-8">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] text-[#059669] text-[11px] font-semibold border border-[#D1F2DD]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Practice Zone
            </span>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-8 h-8 rounded-xl bg-[#111110] text-white flex items-center justify-center shadow-xs">
                <MaterialIcon name="school" className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-apfel text-sm font-bold tracking-tight text-[#111110]">
                  CMA Study Hub
                </h1>
                <p className="text-[10px] text-[#88867E]">Student learning dashboard</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              href="/"
              className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-3 text-[#666560] hover:text-[#111110] hover:bg-[#F3EFE7] transition-all"
            >
              <MaterialIcon name="home" className="w-4 h-4 text-[#88867E]" />
              <span>Dashboard</span>
            </Link>
            <div className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-between bg-[#111110] text-white shadow-xs">
              <div className="flex items-center gap-3">
                <MaterialIcon name="practice-zone" className="w-4 h-4 text-white" />
                <span>Practice Zone</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen p-6 lg:p-10 max-w-4xl mx-auto w-full">
        <PracticeView onBack={() => window.history.back()} />
      </div>
    </div>
  );
}
