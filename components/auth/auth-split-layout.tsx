import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { BerkeleySkylineScene } from "@/components/illustrations/berkeley-scenes";
import { BearFlying } from "@/components/illustrations";

// Dark panel with Berkeley skyline + light form column.
export function AuthSplitLayout({
  tagline,
  children,
}: {
  tagline: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-navy-950 px-12 py-12 text-white md:flex">
        <div className="pointer-events-none absolute inset-0 bg-berkeley/30" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-80">
          <BerkeleySkylineScene className="h-56 w-full" />
        </div>

        <div className="relative z-10">
          <Wordmark className="mb-8" />
          <h1 className="font-hero text-h2 font-extrabold leading-tight">
            Welcome back
            <span className="mt-1 block text-cal-gold">Golden Bear.</span>
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            {tagline}
          </p>
        </div>

        <div className="relative z-10">
          <BearFlying className="w-36 lg:w-44" />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-paper px-6 py-12">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
