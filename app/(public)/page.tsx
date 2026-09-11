import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/countdown/countdown";
import { HeroParallax } from "@/components/shell/hero-parallax";
import { CountUp } from "@/components/count-up";
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
    : "Enter Sather Gate";

  return (
    <HeroParallax>
      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-1 flex-col justify-center px-6 py-16 lg:py-20">
        <div className="relative max-w-xl pb-[min(38vh,280px)] pt-6 sm:pt-10">
          <p className="mb-4 text-2xs font-medium tracking-wide text-cal-gold">
            Hackathons @ Berkeley · Portal 13.0
          </p>
          <h1 className="font-hero text-[2.75rem] font-extrabold leading-[0.95] tracking-tight text-white sm:text-[3.5rem]">
            Build under
            <span className="mt-1 block text-cal-gold">the Campanile</span>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            Apply, track your status, and — if you&apos;re an organizer —
            review applications.
          </p>

          <div className="mt-8">
            <p className="mb-3 text-2xs font-medium text-white/45">
              Countdown to Kickoff at the Campanile
            </p>
            <Countdown size="hero" light />
          </div>

          {stats && (stats.applications > 0 || stats.schools > 0) && (
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:max-w-md">
              <div>
                <dt className="text-2xs text-white/45">Applications</dt>
                <dd className="font-hero text-h2 font-bold tabular-nums text-paper">
                  <CountUp value={stats.applications} />
                </dd>
              </div>
              <div>
                <dt className="text-2xs text-white/45">Schools</dt>
                <dd className="font-hero text-h2 font-bold tabular-nums text-sky">
                  <CountUp value={stats.schools} />
                </dd>
              </div>
              <div>
                <dt className="text-2xs text-white/45">Accepted</dt>
                <dd className="font-hero text-h2 font-bold tabular-nums text-cal-gold">
                  <CountUp value={stats.accepted} />
                </dd>
              </div>
            </dl>
          )}

          <Button
            render={<Link href={ctaHref} />}
            nativeButton={false}
            size="lg"
            className="mt-10 rounded-chip bg-sunset px-6 font-ui text-navy-950 hover:bg-[color-mix(in_oklch,var(--color-sunset),black_8%)]"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </HeroParallax>
  );
}
