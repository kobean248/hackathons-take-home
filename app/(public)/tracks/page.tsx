import { PublicWorld } from "@/components/shell/public-world";
import { BearFlying } from "@/components/illustrations";

const TRACKS = [
  {
    name: "Best AI",
    prize: "$2,000 + API credits",
    blurb: "Models, agents, or clever ML that actually ships in a weekend.",
  },
  {
    name: "Hardware",
    prize: "$1,500 + kit stipend",
    blurb: "Sensors, wearables, robots — if it blinks or moves, it's here.",
  },
  {
    name: "Beginner",
    prize: "$1,000",
    blurb: "First hackathon? This track is judged on learning and heart.",
  },
  {
    name: "Social Good",
    prize: "$1,500",
    blurb: "Projects that help communities, campuses, or the climate.",
  },
  {
    name: "Design",
    prize: "$1,000",
    blurb: "Polish, UX, and visual craft that makes a demo sing.",
  },
  {
    name: "Wildcard",
    prize: "Judges' pick",
    blurb: "Something we didn't expect. Surprise us.",
  },
];

export default function TracksPage() {
  return (
    <PublicWorld>
      <main className="mx-auto max-w-[1120px] px-6 py-16 sm:py-20">
        <div className="relative max-w-xl">
          <BearFlying className="pointer-events-none absolute -right-2 -top-4 w-28 opacity-90 sm:-right-24 sm:w-36" />
          <p className="text-2xs font-medium tracking-wide text-sky">Tracks</p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight">
            Prize tracks
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Submit to as many as fit — sponsors may add category prizes closer
            to the weekend.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((track) => (
            <li
              key={track.name}
              className="rounded-xl border border-navy-600 bg-navy-800/60 p-5"
            >
              <h2 className="font-display text-h3 font-semibold text-white">
                {track.name}
              </h2>
              <p className="mt-2 text-2xs font-medium text-sunset">
                {track.prize}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {track.blurb}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </PublicWorld>
  );
}
