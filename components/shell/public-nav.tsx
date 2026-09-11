"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { SlidingNavPills } from "@/components/shell/sliding-nav-pills";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/schedule", label: "Schedule" },
  { href: "/faq", label: "FAQ" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/tracks", label: "Tracks" },
] as const;

export function PublicNav({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();

  const pills = LINKS.map(({ href, label }) => ({
    key: href,
    href,
    label,
    active: pathname === href || pathname.startsWith(`${href}/`),
    activeClassName: "text-cal-gold",
    inactiveClassName: "text-white/65 hover:text-white",
  }));

  return (
    <header className="glass-nav sticky top-0 z-40 text-white">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-6">
        <Link href="/" aria-label="Hackathons at Berkeley home">
          <Wordmark />
        </Link>

        <nav
          className="flex flex-1 items-center justify-end overflow-x-auto sm:justify-center"
          aria-label="Marketing"
        >
          <SlidingNavPills
            items={pills}
            className="gap-0.5"
            indicatorClassName="bg-berkeley"
          />
        </nav>

        <Link
          href={signedIn ? "/dashboard" : "/login"}
          className="pressable shrink-0 rounded-chip bg-sunset px-3.5 py-1.5 font-ui text-2xs font-semibold text-navy-950 hover:bg-[color-mix(in_oklch,var(--color-sunset),black_8%)]"
        >
          {signedIn ? "Portal" : "Enter Sather Gate"}
        </Link>
      </div>
    </header>
  );
}
