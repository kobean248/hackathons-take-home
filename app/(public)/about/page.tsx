import { PublicWorld } from "@/components/shell/public-world";
import { SceneFoundingStory } from "@/components/illustrations/berkeley-scenes";

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
    body: "A handful of Berkeley students ran an overnight build session in Soda Hall.",
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
    <PublicWorld
      scene={
        <SceneFoundingStory className="mx-auto h-auto w-full max-w-3xl" />
      }
    >
      <main className="mx-auto max-w-[1120px] px-6 py-12 sm:py-16">
        <div className="relative max-w-2xl">
          <p className="text-2xs font-medium tracking-wide text-cal-gold">
            About
          </p>
          <h1 className="mt-2 font-hero text-h1 font-extrabold tracking-tight">
            Founded under the Campanile
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Hackathons @ Berkeley exists to give students a weekend to ship
            something real — with mentors, sponsors, and a community that
            actually shows up on Sproul and beyond.
          </p>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-4 border-y border-navy-600/80 py-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="text-2xs text-white/45">{s.label}</dt>
              <dd className="mt-1 font-hero text-h2 font-bold tabular-nums text-cal-gold">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="mt-14 max-w-2xl">
          <h2 className="font-hero text-h3 font-bold">Our story</h2>
          <ol className="mt-6 flex flex-col gap-6">
            {TIMELINE.map((item) => (
              <li key={item.year} className="flex gap-4">
                <span className="w-14 shrink-0 font-hero text-sm font-bold tabular-nums text-sunset">
                  {item.year}
                </span>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
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
