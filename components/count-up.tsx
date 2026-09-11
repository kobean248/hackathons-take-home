"use client";

import { useEffect, useRef, useState } from "react";

// Animates 0 -> value on mount (ease-out, ~800ms default) instead of a
// number just appearing. Respects prefers-reduced-motion.
export function CountUp({
  value,
  durationMs = 800,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }

    let raf: number;
    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - pct, 3); // ease-out cubic
      setDisplay(Math.round(eased * value));
      if (pct < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
