import Link from "next/link";
import { PublicWorld } from "@/components/shell/public-world";
import { SceneSponsorMedals } from "@/components/illustrations/berkeley-scenes";
import { Button } from "@/components/ui/button";

const TIERS = [
  {
    name: "Title",
    slots: 1,
    logos: [{ label: "Title Partner" }],
  },
  {
    name: "Gold",
    slots: 4,
    logos: [
      { label: "Gold A" },
      { label: "Gold B" },
      { label: "Gold C" },
      { label: "Gold D" },
    ],
  },
  {
    name: "Silver",
    slots: 6,
    logos: [
      { label: "Silver 1" },
      { label: "Silver 2" },
      { label: "Silver 3" },
      { label: "Silver 4" },
      { label: "Silver 5" },
      { label: "Silver 6" },
    ],
  },
  {
    name: "Community",
    slots: 8,
    logos: Array.from({ length: 8 }, (_, i) => ({
      label: `Community ${i + 1}`,
    })),
  },
];

export default function SponsorsPage() {
  return (
    <PublicWorld
      scene={
        <SceneSponsorMedals className="mx-auto h-auto w-full max-w-2xl" />
      }
    >
      <main className="mx-auto max-w-[1120px] px-6 py-12 sm:py-16">
        <div className="relative max-w-xl">
          <p className="text-2xs font-medium tracking-wide text-cal-gold">
            Sponsors
          </p>
          <h1 className="mt-2 font-hero text-h1 font-extrabold tracking-tight">
            Partners who make it possible
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Logos below are placeholders until contracts land. Want your brand
            on this wall? Reach out.
          </p>
        </div>

        <div className="mt-14 space-y-12">
          {TIERS.map((tier) => (
            <section key={tier.name}>
              <h2
                className={`font-hero text-h3 font-bold ${
                  tier.name === "Title" || tier.name === "Gold"
                    ? "text-cal-gold"
                    : "text-sunset"
                }`}
              >
                {tier.name}
              </h2>
              <ul
                className={`mt-5 grid gap-3 ${
                  tier.name === "Title"
                    ? "grid-cols-1 sm:max-w-sm"
                    : tier.name === "Gold"
                      ? "grid-cols-2 sm:grid-cols-4"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                }`}
              >
                {tier.logos.map((logo) => (
                  <li
                    key={logo.label}
                    className="flex h-20 items-center justify-center rounded-xl border border-navy-600 bg-navy-800 px-4 text-center text-2xs font-medium text-white/45"
                  >
                    {logo.label}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-16 max-w-lg rounded-xl border border-navy-600 bg-navy-800/80 p-6 sm:p-8">
          <h2 className="font-display text-h3 font-semibold">
            Become a sponsor
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Reach thousands of builders across Berkeley and beyond — recruiting,
            brand, and workshop packages available.
          </p>
          <Button
            render={
              <Link href="mailto:sponsors@hackathons.berkeley.edu" />
            }
            nativeButton={false}
            size="lg"
            className="mt-6 rounded-chip bg-sunset px-5 text-navy-950 hover:bg-[color-mix(in_oklch,var(--color-sunset),black_8%)]"
          >
            Email sponsorship
          </Button>
        </section>
      </main>
    </PublicWorld>
  );
}
