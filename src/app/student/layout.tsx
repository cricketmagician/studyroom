"use client";

import React from "react";
import { StudentNav } from "@/components/navigation/student-nav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F4EF] dark:bg-[#171715] flex flex-col selection:bg-orange-500/20">
      <StudentNav />
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
