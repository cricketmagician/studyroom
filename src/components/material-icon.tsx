import { CirclePlay, FileText } from "lucide-react";
import { Kind } from "@/lib/files";

export function MaterialIcon({ type, className = "w-6 h-6" }: { type: Kind; className?: string }) {
  return type === "pdf"
    ? <FileText className={className} aria-label="PDF" />
    : <CirclePlay className={className} aria-label="Video" />;
}
