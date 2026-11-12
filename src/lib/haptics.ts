export type Haptic = "tap" | "success" | "warning";

export const PATTERNS: Record<Haptic, number | number[]> = { tap: 8, success: [12, 70, 22], warning: [30, 50, 30] };

/**
 * A small buzz for important moments. Android Chrome uses the Vibration API.
 * shortcut: iOS Safari has no haptics API; toggling a hidden `switch` checkbox makes iOS 18+ give one tick, upgrade if Apple ships a real API.
 */
export function haptic(kind: Haptic = "tap") {
  if (typeof window === "undefined") return;
  try {
    if ("vibrate" in navigator) { navigator.vibrate(PATTERNS[kind]); return; }
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    label.style.display = "none";
    label.append(input);
    document.body.append(label);
    label.click();
    label.remove();
  } catch { /* Haptics are a nice extra; never break a tap over them. */ }
}
