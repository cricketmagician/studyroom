"use client";

import React from "react";
import { StudentNav } from "@/components/navigation/student-nav";
import { SkillverseDashboard } from "@/components/dashboard/skillverse-dashboard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F6F4EF] dark:bg-[#171715] flex flex-col selection:bg-orange-500/20">
      <StudentNav />
      <div className="flex-1 w-full">
        <SkillverseDashboard />
      </div>
    </div>
  );
}
