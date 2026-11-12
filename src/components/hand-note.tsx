"use client";
import dynamic from "next/dynamic";

// Tegaki draws on a canvas and its font bundle is large, so load it only in the browser, after first paint.
const Handwriting = dynamic(async () => {
  const [{ TegakiRenderer }, { default: caveat }] = await Promise.all([import("tegaki/react"), import("tegaki/fonts/caveat")]);
  return function Handwriting({ text }: { text: string }) {
    return <TegakiRenderer font={caveat} reducedMotion="user">{text}</TegakiRenderer>;
  };
}, { ssr: false });

/** A short handwritten line that writes itself once. Decorative: screen readers get the plain text. */
export function HandNote({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`hand-note ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true"><Handwriting key={text} text={text} /></span>
    </span>
  );
}
