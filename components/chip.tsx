import type { ReactNode } from "react";

// Flat rounded-rectangle "chip" — replaces the marketing site's soft,
// shadowed cloud call-outs with the same informational role (e.g. a
// deadline) in a flat, UI-appropriate shape. No shadow, no gradient.
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-chip border border-navy-600 bg-navy-800 px-3 py-1.5 text-2xs font-medium text-white">
      {children}
    </span>
  );
}
