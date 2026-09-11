"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AnalyticsIcon,
  ApplicationsIcon,
  CalibrationIcon,
  QueueIcon,
  ReviewersIcon,
} from "@/components/icons";
import { UserMenu } from "@/components/shell/user-menu";
import { BracketsIcon } from "@/components/icons";

const NAV = [
  {
    href: "/organizer/applications",
    label: "Applications",
    match: "all" as const,
    icon: ApplicationsIcon,
  },
  {
    href: "/organizer/applications?assigned_to_me=true",
    label: "My queue",
    match: "queue" as const,
    icon: QueueIcon,
  },
  {
    href: "/organizer/calibration",
    label: "Calibration",
    match: "path" as const,
    icon: CalibrationIcon,
  },
  {
    href: "/organizer/reviewers",
    label: "Reviewers",
    match: "path" as const,
    icon: ReviewersIcon,
  },
  {
    href: "/organizer/analytics",
    label: "Analytics",
    match: "path" as const,
    icon: AnalyticsIcon,
  },
];

// Dark navy sidebar — its own identity vs. the applicant top-nav.
// Illustration stays out of dense tables; empty states carry the bear.
export function OrganizerNav({
  email,
  fullName,
}: {
  email: string;
  fullName?: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mine = searchParams.get("assigned_to_me") === "true";

  return (
    <nav className="flex shrink-0 flex-col bg-navy-950 text-white md:w-56 md:min-h-screen">
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 md:flex-col md:items-stretch md:gap-1 md:overflow-visible md:px-4 md:py-6">
        <div className="mb-2 hidden items-center gap-2 px-3 md:flex">
          <BracketsIcon className="size-5 text-sky" />
          <span className="font-display text-sm font-semibold">Organizer</span>
        </div>
        {NAV.map((item) => {
          let active = false;
          if (item.match === "queue") {
            active = pathname.startsWith("/organizer/applications") && mine;
          } else if (item.match === "all") {
            active = pathname.startsWith("/organizer/applications") && !mine;
          } else {
            active = pathname.startsWith(item.href.split("?")[0]!);
          }
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex shrink-0 items-center gap-2 rounded-chip px-3 py-1.5 text-sm font-medium md:py-2 ${
                active
                  ? "bg-sunset text-navy-950"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto hidden border-t border-navy-600 px-4 py-4 md:flex md:flex-col md:gap-3">
        <Link
          href="/dashboard"
          className="rounded-chip px-3 py-2 text-2xs text-white/55 hover:bg-white/10 hover:text-white"
        >
          ← Applicant overview
        </Link>
        <div className="flex items-center justify-between gap-2 rounded-chip bg-navy-800 px-2 py-2">
          <div className="min-w-0">
            <p className="truncate text-2xs text-white/55">Signed in</p>
            <p className="truncate text-2xs font-medium text-white">
              {fullName || email}
            </p>
          </div>
          <UserMenu email={email} fullName={fullName} showOrganizerLink />
        </div>
      </div>
    </nav>
  );
}
