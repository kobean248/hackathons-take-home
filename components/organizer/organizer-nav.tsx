"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AnalyticsIcon,
  ApplicationsIcon,
  AuditIcon,
  FlagIcon,
  QueueIcon,
  ReviewersIcon,
} from "@/components/icons";
import { UserMenu } from "@/components/shell/user-menu";
import { BracketsIcon } from "@/components/icons";
import {
  CommandPalette,
  CommandPaletteHint,
  buildOrganizerCommands,
} from "@/components/shell/command-palette";

type NavItem = {
  href: string;
  label: string;
  match: "all" | "queue" | "tiebreaker" | "path";
  icon: typeof ApplicationsIcon;
  badgeKey?: "total" | "queue";
};

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Review",
    items: [
      {
        href: "/organizer/applications",
        label: "Applications",
        match: "all",
        icon: ApplicationsIcon,
        badgeKey: "total",
      },
      {
        href: "/organizer/applications?assigned_to_me=true",
        label: "My queue",
        match: "queue",
        icon: QueueIcon,
        badgeKey: "queue",
      },
      {
        href: "/organizer/applications?tiebreaker=true",
        label: "Needs a tiebreaker",
        match: "tiebreaker",
        icon: FlagIcon,
      },
    ],
  },
  {
    label: "Manage",
    items: [
      {
        href: "/organizer/reviewers",
        label: "Reviewers",
        match: "path",
        icon: ReviewersIcon,
      },
      {
        href: "/organizer/analytics",
        label: "Analytics",
        match: "path",
        icon: AnalyticsIcon,
      },
      {
        href: "/organizer/audit",
        label: "Audit log",
        match: "path",
        icon: AuditIcon,
      },
    ],
  },
];

export function OrganizerNav({
  email,
  fullName,
  totalCount = 0,
  queueCount = 0,
}: {
  email: string;
  fullName?: string | null;
  totalCount?: number;
  queueCount?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mine = searchParams.get("assigned_to_me") === "true";
  const tiebreaker = searchParams.get("tiebreaker") === "true";
  const onApplications = pathname.startsWith("/organizer/applications");

  const badgeValue = (key?: "total" | "queue") =>
    key === "total" ? totalCount : key === "queue" ? queueCount : undefined;

  return (
    <>
      <nav className="flex shrink-0 flex-col border-r border-navy-600/40 bg-berkeley/88 text-white backdrop-blur-xl md:w-56 md:min-h-screen">
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 md:flex-col md:items-stretch md:gap-4 md:overflow-visible md:px-4 md:py-6">
          <div className="mb-1 hidden items-center justify-between gap-2 px-3 md:flex">
            <div className="flex items-center gap-2">
              <BracketsIcon className="size-5 text-sky" />
              <span className="font-display text-sm font-semibold text-cal-gold">
                Organizer
              </span>
            </div>
            <CommandPaletteHint className="!inline-flex border-navy-600/60" />
          </div>
          {SECTIONS.map((section) => (
            <div
              key={section.label}
              className="flex items-center gap-1 md:flex-col md:items-stretch md:gap-1"
            >
              <span className="hidden px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-white/35 md:block">
                {section.label}
              </span>
              {section.items.map((item) => {
                let active = false;
                if (item.match === "queue") {
                  active = onApplications && mine && !tiebreaker;
                } else if (item.match === "tiebreaker") {
                  active = onApplications && tiebreaker;
                } else if (item.match === "all") {
                  active = onApplications && !mine && !tiebreaker;
                } else {
                  active = pathname.startsWith(item.href.split("?")[0]!);
                }
                const Icon = item.icon;
                const badge = badgeValue(item.badgeKey);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative inline-flex shrink-0 items-center gap-2 rounded-chip py-1.5 pl-3 pr-2.5 text-sm font-medium transition-colors md:py-2 ${
                      active
                        ? "bg-sunset text-navy-950"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {active && (
                      <span className="absolute -left-4 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-full bg-cal-gold md:block" />
                    )}
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                    {typeof badge === "number" && badge > 0 && (
                      <span
                        className={`ml-auto inline-flex min-w-4 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-semibold tabular-nums ${
                          active
                            ? "bg-navy-950/20 text-navy-950"
                            : "bg-white/15 text-white"
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-auto hidden border-t border-navy-600/50 px-4 py-4 md:flex md:flex-col md:gap-3">
          <Link
            href="/dashboard"
            className="rounded-chip px-3 py-2 text-2xs text-white/55 hover:bg-white/10 hover:text-white"
          >
            ← Applicant overview
          </Link>
          <div className="flex items-center justify-between gap-2 rounded-chip bg-navy-800/80 px-2 py-2">
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
      <CommandPalette items={buildOrganizerCommands()} />
    </>
  );
}
