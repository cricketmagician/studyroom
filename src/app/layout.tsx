import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { IconProvider } from "@/components/providers/icon-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { FocusStatus } from '@/components/focus-status';
import { PwaRegister } from '@/components/pwa-register';
import { RoutinesProvider } from '@/components/routines-provider';

const absans = localFont({
  src: "./fonts/Absans-Regular.woff2",
  variable: "--font-absans",
  display: "swap",
});

const apfelGrotezk = localFont({
  src: [
    {
      path: "./fonts/ApfelGrotezk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ApfelGrotezk-Mittel.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ApfelGrotezk-Fett.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/ApfelGrotezk-Brukt.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-apfel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abhyas · Daily CMA practice",
  description: "CMA Foundation, Intermediate and Final: notes, focus sessions and daily progress.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Abhyas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${apfelGrotezk.variable} ${absans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased font-sans selection:bg-orange-500/20">
        <IconProvider>
        <ThemeProvider>
          <AuthProvider>
            <RoutinesProvider>
            <PwaRegister />
            <Suspense fallback={null}>
              {children}
            </Suspense>
            <Suspense fallback={null}>
              <FocusStatus />
            </Suspense>
            </RoutinesProvider>
          </AuthProvider>
        </ThemeProvider>
        </IconProvider>
      </body>
    </html>
  );
}
