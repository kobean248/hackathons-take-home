import type { ReactNode } from "react";
import { BracketsIcon } from "@/components/icons";

// Dark "front of house" panel (matches the marketing site's register) +
// a light form column for the actual task — per design-doc.md §7. The
// dark panel is decorative and hidden on small screens so the form stays
// the only thing that has to work on mobile.
export function AuthSplitLayout({
  tagline,
  children,
}: {
  tagline: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-2/5 flex-col justify-center bg-navy-950 px-12 text-white md:flex">
        <BracketsIcon className="mb-6 size-8 text-sky" />
        <h1 className="font-display text-h2 font-semibold">
          Hackathons @ Berkeley
        </h1>
        <p className="mt-3 max-w-xs text-white/70">{tagline}</p>
      </div>
      <div className="flex flex-1 flex-col justify-center bg-paper px-6 py-12">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
