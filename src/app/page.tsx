"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireRole, useAuth } from "@/lib/auth";
import { StudyHub } from "@/components/study-hub";

export default function Home() {
    const { profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const invite = new URLSearchParams(location.search).get("invite");
        if (invite && /^[a-f0-9-]{36}$/.test(invite))
            sessionStorage.setItem("cma-invite", invite);
    }, []);

    useEffect(() => {
        if (!loading && profile?.role === "teacher") {
            router.replace("/admin");
        }
    }, [loading, profile, router]);

    if (!loading && profile?.role === "teacher") {
        return null;
    }

    return <RequireRole><StudyHub /></RequireRole>;
}
