import Link from "next/link";
import type { ReactNode } from "react";

// Small stat/quick-link card — fills the second row of the dashboard so it
// doesn't end after one hero card and a lot of empty paper below the fold.
export function QuickStatCard({
  icon,
  label,
  value,
  href,
  cta,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-sunset/40"
    >
      <span className="flex size-9 items-center justify-center rounded-chip bg-berkeley/8 text-berkeley">
        {icon}
      </span>
      <div>
        <p className="text-2xs text-ink-soft">{label}</p>
        <p className="mt-0.5 font-display text-h3 font-semibold text-ink">
          {value}
        </p>
      </div>
      <span className="mt-auto text-2xs font-medium text-sunset opacity-0 transition-opacity group-hover:opacity-100">
        {cta} →
      </span>
    </Link>
  );
}
