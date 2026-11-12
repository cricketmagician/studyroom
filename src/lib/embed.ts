/**
 * Utility to parse and format video and document embed URLs.
 * Supports YouTube, Vimeo, Google Drive, and direct MP4/PDF files.
 */

export interface EmbedInfo {
  type: "youtube" | "vimeo" | "gdrive" | "direct";
  embedUrl: string;
  originalUrl: string;
}

export function parseVideoUrl(url: string): EmbedInfo {
  if (!url) return { type: "direct", embedUrl: "", originalUrl: "" };
  const clean = url.trim();

  // YouTube matchers: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/live/ID
  const ytMatch = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([\w-]{11})/
  );
  if (ytMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1&playsinline=1`,
      originalUrl: clean,
    };
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = clean.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      originalUrl: clean,
    };
  }

  // Google Drive: drive.google.com/file/d/ID/...
  const gdriveMatch = clean.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (gdriveMatch) {
    return {
      type: "gdrive",
      embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
      originalUrl: clean,
    };
  }

  return {
    type: "direct",
    embedUrl: clean,
    originalUrl: clean,
  };
}

export function parsePdfUrl(url: string, page: number = 1): string {
  if (!url) return "";
  const clean = url.trim();

  // Google drive PDF: convert /view to /preview for clean embedding
  const gdriveMatch = clean.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (gdriveMatch) {
    return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
  }

  // Standard PDF with page jump anchor
  return `${clean}#page=${page}`;
}
