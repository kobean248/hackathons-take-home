import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";

export function QuickStatCard({
  icon,
  label,
  value,
  href,
  cta,
  secondary,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  href: string;
  cta: string;
  secondary?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "card-lift group flex h-fit flex-col gap-3 self-start rounded-xl border border-line bg-surface p-5"
      )}
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
      {secondary && <div>{secondary}</div>}
      <span className="text-2xs font-medium text-sunset opacity-0 transition-opacity group-hover:opacity-100">
        {cta} →
      </span>
    </Link>
  );
}
