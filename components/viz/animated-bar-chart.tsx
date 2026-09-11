"use client";

import { cn } from "cn";
import { CountUp } from "@/components/count-up";

export type BarDatum = {
  key: string;
  label: string;
  value: number;
  barClassName?: string;
};

/** Horizontal bars that grow from 0 on mount — used on Analytics. */
export function AnimatedBarChart({
  rows,
  className,
}: {
  rows: BarDatum[];
  className?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {rows.map((row, i) => {
        const pct = (row.value / max) * 100;
        return (
          <div key={row.key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xs text-ink-soft">{row.label}</span>
              <span className="font-display text-sm font-semibold tabular-nums text-ink">
                <CountUp value={row.value} />
              </span>
            </div>
            <div className="relative h-7 w-full overflow-hidden rounded-chip bg-paper">
              <div
                className="pointer-events-none absolute inset-0 flex"
                aria-hidden
              >
                {[25, 50, 75].map((t) => (
                  <span
                    key={t}
                    className="absolute top-0 h-full w-px bg-line"
                    style={{ left: `${t}%` }}
                  />
                ))}
              </div>
              <div
                className={cn(
                  "bar-grow relative h-7 rounded-chip",
                  row.barClassName ?? "bg-sky"
                )}
                style={{
                  width: `${Math.max(pct, row.value > 0 ? 4 : 0)}%`,
                  animationDelay: `${i * 55}ms`,
                }}
              >
                {row.value > 0 && pct > 18 && (
                  <span className="absolute inset-y-0 right-2 flex items-center font-display text-2xs font-semibold tabular-nums text-navy-950/80">
                    {row.value}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
