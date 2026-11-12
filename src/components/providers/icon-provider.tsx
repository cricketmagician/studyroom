"use client";
import { IconContext } from "@phosphor-icons/react";

/** Phosphor duotone by default: a soft filled layer under the outline reads as modern iOS-style iconography. */
export function IconProvider({ children }: { children: React.ReactNode }) {
  return <IconContext.Provider value={{ weight: "duotone" }}>{children}</IconContext.Provider>;
}
