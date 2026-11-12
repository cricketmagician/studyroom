"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RequireRole, useAuth } from "@/lib/auth";
import { SyllabusHub } from "@/components/syllabus-hub";

export default function SyllabusPage() {
  return (
    <RequireRole>
      <SyllabusView />
    </RequireRole>
  );
}

function SyllabusView() {
  const { profile } = useAuth();
  const router = useRouter();

  const handleStartStudy = (paperId: string) => {
    // Navigate home with paper selected and start timer
    router.push(`/?startPaper=${paperId}`);
  };

  const handleOpenLibrary = (paperId: string) => {
    router.push(`/?view=Library&paper=${paperId}`);
  };

  return (
    <>
      <div className="cma-page-heading"><div><h1>Syllabus</h1><p>All papers, chapters and how many marks each part carries.</p></div></div>
      <SyllabusHub
        currentLevel={profile?.level || "Intermediate"}
        onStartStudy={handleStartStudy}
        onOpenLibrary={handleOpenLibrary}
      />
    </>
  );
}
