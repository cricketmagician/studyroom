"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, homeFor, Spinner } from "@/lib/auth";

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? homeFor(profile?.role ?? "student") : "/login");
  }, [loading, user, profile, router]);

  return <Spinner />;
}
