"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ApplyIcon, OverviewIcon, SettingsIcon, TeamsIcon } from "@/components/icons";
import { UserMenu } from "@/components/shell/user-menu";
import { CountdownNavChip } from "@/components/countdown/countdown";
import { PlaneMark } from "@/components/illustrations";
import type { AppRole } from "@/types";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: OverviewIcon },
  { href: "/apply", label: "Apply", icon: ApplyIcon },
  { href: "/teams", label: "Teams", icon: TeamsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

// Cloud-chip nav: the marketing site's cloud call-outs translated into
// product chrome — rounded cloud-ish pills, filled when active.
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

  return (
    <header className="sticky top-0 z-40 bg-navy-950 text-white">
      <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between gap-3 px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5"
            aria-label="Browse marketing site"
          >
            <PlaneMark className="size-5" />
          </Link>
          <nav className="flex items-center gap-1.5" aria-label="Applicant">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/dashboard"
                  ? pathname === "/dashboard" ||
                    pathname.startsWith("/dashboard/")
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                    active
                      ? "bg-navy-800 text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      : "border border-navy-600 bg-transparent text-sky hover:border-sky/50 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
            {showConsole && (
              <Link
                href="/organizer/applications"
                className="inline-flex items-center gap-2 rounded-full border border-sunset/50 bg-sunset/15 px-3.5 py-1.5 text-sm font-medium text-sunset hover:bg-sunset hover:text-navy-950"
              >
                Console
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          <CountdownNavChip className="hidden sm:inline-flex" />
          <UserMenu
            email={email}
            fullName={fullName}
            showOrganizerLink={showConsole}
          />
        </div>
      </div>
    </header>
  );
}
