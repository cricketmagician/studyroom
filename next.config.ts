import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `npm run local` builds into its own folder so it can run next to a normal `npm run dev`.
  distDir: process.env.NEXT_PUBLIC_USE_EMULATOR === "true" ? ".next-local" : ".next",
};

export default nextConfig;
