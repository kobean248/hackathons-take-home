"use client";

import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

export function PublicNav({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="glass-nav sticky top-0 z-40 text-white">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-6">
        <Link href="/" aria-label="Hackathons at Berkeley home">
          <Wordmark />
        </Link>

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
