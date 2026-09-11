import type { CSSProperties } from "react";
import { cn } from "cn";

/** Circular progress for fractions (reviews done/assigned, capacity, etc.). */
export function RingProgress({
  value,
  max,
  size = 40,
  strokeWidth = 3.5,
  className,
  trackClassName = "stroke-[var(--color-line)]",
  fillClassName = "stroke-[var(--color-mint)]",
  label,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      role="img"
      aria-label={label ?? `${value} of ${max}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 shrink-0"
        aria-hidden="true"
        style={
          {
            ["--ring-circumference"]: String(c),
          } as CSSProperties
        }
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClassName}
        />
        {max > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("ring-draw", fillClassName)}
          />
        )}
      </svg>
      {label !== undefined ? (
        <span className="text-2xs tabular-nums text-ink-soft">{label}</span>
      ) : (
        <span className="text-2xs tabular-nums text-ink-soft">
          {value}/{max}
        </span>
      )}
    </span>
  );
}
