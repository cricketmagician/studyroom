export type Kind = "pdf" | "video";

// Keep in sync with storage.rules.
export const MAX_BYTES: Record<Kind, number> = {
  pdf: 100 * 1024 * 1024,
  video: 2048 * 1024 * 1024,
};

export function checkFile(file: { name: string; type: string; size: number }): { kind: Kind } | { error: string } {
  const name = file.name.toLowerCase();
  const kind: Kind | null =
    file.type === "application/pdf" || name.endsWith(".pdf") ? "pdf"
    : file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/.test(name) ? "video"
    : null;

  if (!kind) return { error: "Only PDF or video files (MP4, WebM, MOV) can be uploaded." };
  if (file.size === 0) return { error: "This file is empty." };
  if (file.size > MAX_BYTES[kind]) return { error: `This file is too big. The limit is ${kind === "pdf" ? "100 MB" : "2 GB"}.` };
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
