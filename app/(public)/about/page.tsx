import { PublicWorld } from "@/components/shell/public-world";
import { BearReading } from "@/components/illustrations";

const STATS = [
  { label: "Years running", value: "13" },
  { label: "Hackers last year", value: "2,400+" },
  { label: "Projects shipped", value: "500+" },
  { label: "Schools represented", value: "120+" },
];

const TIMELINE = [
  {
    year: "2013",
    title: "First weekend",
    body: "A handful of Berkeley students ran a overnight build session in Soda Hall.",
  },
  {
    year: "2016",
    title: "Cal Hacks scales",
    body: "The event outgrew campus rooms and became one of the largest collegiate hackathons.",
  },
  {
    year: "2020",
    title: "Remote edition",
    body: "We rebuilt the experience online — Discord stages, remote mentoring, still the same chaos.",
  },
  {
    year: "2024",
    title: "Portal 13.0",
    body: "Applications, reviews, and team formation live in one place — this portal.",
  },
];

export default function AboutPage() {
  return (
    <PublicWorld>
      <main className="mx-auto max-w-[1120px] px-6 py-16 sm:py-20">
        <div className="relative max-w-2xl">
          <BearReading className="pointer-events-none absolute -right-4 -top-6 w-28 opacity-90 sm:-right-28 sm:top-0 sm:w-40" />
          <p className="text-2xs font-medium tracking-wide text-sky">About</p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight">
            Built for builders at Berkeley
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Hackathons @ Berkeley exists to give students a weekend to ship
            something real — with mentors, sponsors, and a community that
            actually shows up.
          </p>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-4 border-y border-navy-600/80 py-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="text-2xs text-white/45">{s.label}</dt>
              <dd className="mt-1 font-display text-h2 font-semibold tabular-nums text-sunset">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="mt-14 max-w-2xl">
          <h2 className="font-display text-h3 font-semibold">Past chapters</h2>
          <ol className="mt-8 space-y-0">
            {TIMELINE.map((item, i) => (
              <li key={item.year} className="relative flex gap-6 pb-10 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="size-2.5 shrink-0 rounded-full bg-sunset" />
                  {i < TIMELINE.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-navy-600" />
                  )}
                </div>
                <div className="-mt-1">
                  <p className="text-2xs font-medium tabular-nums text-sky">
                    {item.year}
                  </p>
                  <h3 className="mt-1 font-display text-sm font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/65">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </PublicWorld>
  );
}
