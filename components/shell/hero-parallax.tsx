"use client";

import { useEffect, useRef } from "react";
import { BerkeleySkylineScene } from "@/components/illustrations/berkeley-scenes";
import { PlaneMark } from "@/components/illustrations";

/**
 * Landing hero scene with 2–3 layer parallax (sky / skyline / foreground).
 * Respects prefers-reduced-motion — layers stay static.
 */
export function HeroParallax({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const foreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    function onMove(e: PointerEvent) {
      const rect = root!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (skyRef.current) {
        skyRef.current.style.transform = `translate(${x * 6}px, ${y * 4}px)`;
      }
      if (midRef.current) {
        midRef.current.style.transform = `translate(${x * 12}px, ${y * 8}px)`;
      }
      if (foreRef.current) {
        foreRef.current.style.transform = `translate(${x * 18}px, ${y * 10}px)`;
      }
    }

    function onLeave() {
      for (const el of [skyRef.current, midRef.current, foreRef.current]) {
        if (el) el.style.transform = "translate(0, 0)";
      }
    }

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-interactive relative isolate min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Pattern texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23FDB515' stroke-width='1'><path d='M12 20c2-6 8-8 12-4'/><path d='M48 52l4-10 4 10h-8z'/><circle cx='64' cy='20' r='3'/></g></svg>`
          )}")`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Sky wash — flat block, not gradient */}
      <div
        ref={skyRef}
        className="pointer-events-none absolute inset-0 bg-berkeley/40 transition-transform duration-200 ease-out will-change-transform"
      />

      {/* Skyline mid layer */}
      <div
        ref={midRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 transition-transform duration-200 ease-out will-change-transform"
      >
        <BerkeleySkylineScene className="h-[min(52vh,420px)] w-full" />
      </div>

      {/* Foreground plane trail on interactive hover (CSS in globals) */}
      <div
        ref={foreRef}
        className="pointer-events-none absolute right-[8%] top-[18%] hidden transition-transform duration-200 ease-out will-change-transform sm:block"
      >
        <PlaneMark className="hero-plane size-10 opacity-90" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
