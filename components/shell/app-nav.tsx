"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ApplyIcon, OverviewIcon, SettingsIcon, TeamsIcon } from "@/components/icons";
import { UserMenu } from "@/components/shell/user-menu";
import { CountdownNavChip } from "@/components/countdown/countdown";
import { CampanileMark } from "@/components/brand/wordmark";
import { SlidingNavPills } from "@/components/shell/sliding-nav-pills";
import {
  CommandPalette,
  CommandPaletteHint,
  buildApplicantCommands,
} from "@/components/shell/command-palette";
import type { AppRole } from "@/types";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: OverviewIcon },
  { href: "/apply", label: "Apply", icon: ApplyIcon },
  { href: "/teams", label: "Teams", icon: TeamsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppNav({
  email,
  fullName,
  role,
}: {
  email: string;
  fullName?: string | null;
  role?: AppRole | null;
}) {
  const pathname = usePathname();
  const showConsole = role === "organizer" || role === "reviewer";

  const pills = NAV.map(({ href, label, icon: Icon }) => {
    const active =
      href === "/dashboard"
        ? pathname === "/dashboard" || pathname.startsWith("/dashboard/")
        : pathname === href || pathname.startsWith(`${href}/`);
    return {
      key: href,
      href,
      active,
      label: (
        <>
          <Icon className="size-4" />
          {label}
        </>
      ),
    };
  });

  return (
    <>
      <header className="glass-nav sticky top-0 z-40 text-white">
        <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between gap-3 px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5"
              aria-label="Browse marketing site"
            >
              <CampanileMark className="h-7 w-4" />
            </Link>
            <nav aria-label="Applicant">
              <SlidingNavPills items={pills} />
            </nav>
            {showConsole && (
              <Link
                href="/organizer/applications"
                className="inline-flex items-center gap-2 rounded-full border border-sunset/50 bg-sunset/15 px-3.5 py-1.5 text-sm font-medium text-sunset transition-transform hover:bg-sunset hover:text-navy-950 active:scale-[0.97]"
              >
                Console
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <CommandPaletteHint />
            <CountdownNavChip className="hidden sm:inline-flex" />
            <UserMenu
              email={email}
              fullName={fullName}
              showOrganizerLink={showConsole}
            />
          </div>
        </div>
      </header>
      <CommandPalette items={buildApplicantCommands({ showConsole })} />
    </>
  );
}
