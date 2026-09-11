"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BracketsIcon } from "@/components/icons";

const NAV = [
  { href: "/organizer/applications", label: "Applications" },
  { href: "/organizer/reviewers", label: "Reviewers" },
  { href: "/organizer/analytics", label: "Analytics" },
];

// Dark navy "front of house" chrome — the sidebar keeps the marketing
// site's identity while the working area (siblings of this component)
// stays flat/light. Row on small screens, column sidebar from md up.
export function OrganizerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center gap-2 bg-navy-950 px-4 py-3 text-white md:w-56 md:flex-col md:items-stretch md:gap-1 md:px-4 md:py-6">
      <div className="mb-2 hidden items-center gap-2 px-3 md:flex">
        <BracketsIcon className="size-5 text-sky" />
        <span className="font-display text-sm font-semibold">Organizer</span>
      </div>
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-chip px-3 py-1.5 text-sm font-medium transition-colors md:py-2 ${
              active
                ? "bg-sunset text-navy-950"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
