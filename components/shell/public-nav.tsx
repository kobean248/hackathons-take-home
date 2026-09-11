"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlaneMark } from "@/components/illustrations";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/schedule", label: "Schedule" },
  { href: "/faq", label: "FAQ" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/tracks", label: "Tracks" },
] as const;

// Cal Hacks marketing-style navy top bar — separate from AppNav.
export function PublicNav({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-navy-600/60 bg-navy-950 text-white">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-sm font-semibold tracking-tight"
          aria-label="Hackathons @ Berkeley home"
        >
          <PlaneMark className="size-5" />
          <span className="hidden sm:inline">
            Hackathons <span className="text-sunset">@</span> Berkeley
          </span>
        </Link>

        <nav
          className="flex flex-1 items-center justify-end gap-1 overflow-x-auto sm:justify-center sm:gap-0.5"
          aria-label="Marketing"
        >
          {LINKS.map(({ href, label }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded-chip px-2.5 py-1.5 text-2xs font-medium tracking-wide sm:px-3 ${
                  active
                    ? "bg-navy-800 text-white"
                    : "text-white/65 hover:bg-navy-800/70 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <Link
          href={signedIn ? "/dashboard" : "/login"}
          className="shrink-0 rounded-chip bg-sunset px-3.5 py-1.5 text-2xs font-semibold text-navy-950 hover:bg-[color-mix(in_oklch,var(--color-sunset),black_8%)]"
        >
          {signedIn ? "Portal" : "Sign in"}
        </Link>
      </div>
    </header>
  );
}
