import type { ReactNode } from "react";
import {
  BearFlying,
  CloudShape,
  PlaneMark,
  StarField,
} from "@/components/illustrations";

// Dark "front of house" panel with the illustrated world bleeding through
// + a light form column for the task — design-doc.md §7.
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
        <StarField
          density="normal"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
        />
        <CloudShape
          variant={3}
          cream="var(--color-navy-800)"
          className="pointer-events-none absolute -right-6 top-10 w-36 opacity-70"
        />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-2">
            <PlaneMark className="size-7" />
            <span className="font-display text-sm font-semibold">
              Hackathons @ Berkeley
            </span>
          </div>
          <h1 className="font-display text-h2 font-semibold leading-tight">
            Welcome back
            <span className="mt-1 block text-sunset">pilot.</span>
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            {tagline}
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <BearFlying className="w-36 lg:w-44" />
          <CloudShape
            variant={4}
            cream="var(--color-navy-800)"
            className="mb-4 w-28 opacity-80"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-paper px-6 py-12">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
