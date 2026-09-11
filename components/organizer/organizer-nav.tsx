"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/organizer/applications", label: "Applications" },
  { href: "/organizer/reviewers", label: "Reviewers" },
  { href: "/organizer/analytics", label: "Analytics" },
];

export function OrganizerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-black/[.08] pb-4 text-sm dark:border-white/[.145]">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
