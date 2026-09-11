"use client";

import { PlaneMark } from "@/components/illustrations";

/** Short one-shot plane flight — used for route loading & pending states. */
export function PlaneLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-10 w-48 items-center justify-center overflow-hidden">
        <PlaneMark className="size-8 motion-safe:animate-[plane-cross_280ms_ease_forwards]" />
      </div>
      <span className="text-2xs text-ink-soft">{label}</span>
    </div>
  );
}
