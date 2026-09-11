import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/countdown/countdown";
import {
  BearFlying,
  CloudShape,
  GlobeCurve,
  StarField,
} from "@/components/illustrations";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/home-path";
import type { AppRole } from "@/types";

type PortalStats = {
  applications: number;
  schools: number;
  reviews: number;
  accepted: number;
};

async function loadPortalStats(): Promise<PortalStats | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("portal_stats");
    if (error || !data) return null;
    const raw = data as Record<string, unknown>;
    return {
      applications: Number(raw.applications) || 0,
      schools: Number(raw.schools) || 0,
      reviews: Number(raw.reviews) || 0,
      accepted: Number(raw.accepted) || 0,
    };
  } catch {
    return null;
  }
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: AppRole | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile?.role as AppRole | null) ?? null;
  }

  const stats = await loadPortalStats();
  const ctaHref = user ? homePathForRole(role) : "/login";
  const ctaLabel = user
    ? role === "organizer" || role === "reviewer"
      ? "Open console"
      : "Open portal"
    : "Sign in";

  return (
    <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col overflow-hidden">
      <StarField
        density="dense"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      />

      <CloudShape
        variant={2}
        cream="var(--color-navy-800)"
        primary="var(--color-sky)"
        className="pointer-events-none absolute -left-8 top-16 w-40 opacity-60 sm:w-56"
      />
      <CloudShape
        variant={5}
        cream="var(--color-navy-800)"
        primary="var(--color-sky)"
        className="pointer-events-none absolute -right-10 top-28 w-48 opacity-50 sm:w-64"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-1 flex-col justify-center px-6 py-16 lg:py-20">
        <div className="relative min-h-[320px] sm:min-h-[420px]">
          <GlobeCurve className="pointer-events-none absolute -bottom-8 left-1/2 w-[140%] max-w-none -translate-x-1/2 opacity-90 sm:w-full sm:max-w-4xl" />

          <BearFlying className="absolute right-[4%] top-0 w-28 sm:right-[12%] sm:top-4 sm:w-40 lg:w-48" />

          <div className="relative z-10 max-w-xl pt-8 sm:pt-16">
            <p className="mb-3 text-2xs font-medium tracking-wide text-sky">
              Hackathons @ Berkeley
            </p>
            <h1 className="font-display text-[2.75rem] font-semibold leading-[0.95] tracking-tight sm:text-display">
              Portal
              <span className="mt-1 block text-sunset">13.0</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              Apply, track your status, and — if you&apos;re an organizer —
              review applications. Same world as the main site, built for the
              work.
            </p>

            <div className="mt-8">
              <p className="mb-3 text-2xs font-medium text-white/45">
                Until kickoff
              </p>
              <Countdown size="hero" light />
            </div>

            {stats && (stats.applications > 0 || stats.schools > 0) && (
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:max-w-md">
                <div>
                  <dt className="text-2xs text-white/45">Applications</dt>
                  <dd className="font-display text-h2 font-semibold tabular-nums text-paper">
                    {stats.applications.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-2xs text-white/45">Schools</dt>
                  <dd className="font-display text-h2 font-semibold tabular-nums text-sky">
                    {stats.schools.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-2xs text-white/45">Accepted</dt>
                  <dd className="font-display text-h2 font-semibold tabular-nums text-sunset">
                    {stats.accepted.toLocaleString()}
                  </dd>
                </div>
              </dl>
            )}

            <Button
              render={<Link href={ctaHref} />}
              nativeButton={false}
              size="lg"
              className="mt-10 rounded-chip bg-sunset px-6 text-navy-950 hover:bg-[color-mix(in_oklch,var(--color-sunset),black_8%)]"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
