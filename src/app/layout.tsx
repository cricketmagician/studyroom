import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppProvider } from "@/lib/store/app-store";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skillverse — Premium Academic Learning Platform",
  description:
    "Editorial, minimalist, and modern college learning environment for students, instructors, and academic administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased font-sans flex flex-col selection:bg-[#C58B51]/20 selection:text-[#C58B51]">
        <ThemeProvider>
          <AppProvider>
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
