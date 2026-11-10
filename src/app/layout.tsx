import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/lib/auth";

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
  title: "Studyroom",
  description: "Class PDFs and videos from your teachers, in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${apfelGrotezk.variable} ${absans.variable} ${inter.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased font-sans selection:bg-orange-500/20">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
