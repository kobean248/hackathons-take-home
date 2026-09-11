// Small flat progress ring for "reviews completed / assigned" — replaces
// a plain "0/0" text fraction with something that reads at a glance.
export function ReviewRing({
  done,
  total,
  size = 26,
}: {
  done: number;
  total: number;
  size?: number;
}) {
  const pct = total > 0 ? Math.min(1, done / total) : 0;
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 shrink-0"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={3}
        />
        {total > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-mint)"
            strokeWidth={3}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        )}
      </svg>
      <span className="text-2xs tabular-nums text-ink-soft">
        {done}/{total}
      </span>
    </span>
  );
}
