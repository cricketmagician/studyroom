export type Kind = "pdf" | "video";

// Enforced again by /api/files/upload. Kept small: the free Vercel Blob plan holds about 1 GB in total.
export const MAX_BYTES: Record<Kind, number> = {
  pdf: 50 * 1024 * 1024,
  video: 300 * 1024 * 1024,
};

export function checkFile(file: { name: string; type: string; size: number }): { kind: Kind } | { error: string } {
  const name = file.name.toLowerCase();
  const kind: Kind | null =
    file.type === "application/pdf" || name.endsWith(".pdf") ? "pdf"
    : file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/.test(name) ? "video"
    : null;

  if (!kind) return { error: "Only PDF or video files (MP4, WebM, MOV) can be uploaded." };
  if (file.size === 0) return { error: "This file is empty." };
  if (file.size > MAX_BYTES[kind]) return { error: `This file is too big. The limit is ${formatSize(MAX_BYTES[kind])}.` };
  return { kind };
}

export function titleFromFileName(name: string) {
  return name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 * 1024
    ? `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    : `${Math.max(0.1, bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Upload details a teacher types, trimmed and capped the same way everywhere (keep in sync with firestore.rules). */
export function cleanDetails(d: { chapter?: unknown; faculty?: unknown; duration?: unknown; category?: unknown }) {
  const cap = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  return { chapter: cap(d.chapter, 200), faculty: cap(d.faculty, 80), duration: cap(d.duration, 20), category: cap(d.category, 40) };
}
