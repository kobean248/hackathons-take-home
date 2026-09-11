import { PublicWorld } from "@/components/shell/public-world";
import { SceneBulletinBoard } from "@/components/illustrations/berkeley-scenes";

const DAYS = [
  {
    day: "Friday",
    date: "Oct 17",
    events: [
      { time: "5:00p", title: "Check-in opens", detail: "Memorial Glade tents" },
      { time: "7:00p", title: "Opening ceremony", detail: "Welcome + rules" },
      { time: "8:30p", title: "Hacking begins", detail: "Find a table, form a team" },
      { time: "10:00p", title: "Team formation mixer", detail: "Looking for teammates?" },
    ],
  },
  {
    day: "Saturday",
    date: "Oct 18",
    events: [
      { time: "9:00a", title: "Breakfast", detail: "Sponsored meals all day" },
      { time: "11:00a", title: "Workshop block A", detail: "APIs, hardware, design" },
      { time: "2:00p", title: "Mentor hours", detail: "Drop-in help desks" },
      { time: "8:00p", title: "Midnight snack", detail: "Fuel for the final stretch" },
    ],
  },
  {
    day: "Sunday",
    date: "Oct 19",
    events: [
      { time: "8:00a", title: "Submissions due", detail: "Devpost hard stop" },
      { time: "10:00a", title: "Expo / judging", detail: "Demo your project" },
      { time: "2:00p", title: "Closing ceremony", detail: "Prizes + farewell" },
      { time: "3:30p", title: "Tear-down", detail: "See you next year" },
    ],
  },
];

export default function SchedulePage() {
  return (
    <PublicWorld
      scene={
        <SceneBulletinBoard className="mx-auto h-auto w-full max-w-3xl" />
      }
    >
      <main className="mx-auto max-w-[1120px] px-6 py-12 sm:py-16">
        <div className="relative max-w-xl">
          <p className="text-2xs font-medium tracking-wide text-cal-gold">
            Schedule
          </p>
          <h1 className="mt-2 font-hero text-h1 font-extrabold tracking-tight">
            Weekend on the Glade
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Times are Pacific. Exact rooms land closer to kickoff — watch your
            email and Discord once you&apos;re accepted.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-3">
          {DAYS.map((day) => (
            <section key={day.day}>
              <div className="border-b border-navy-600 pb-3">
                <h2 className="font-display text-h3 font-semibold">{day.day}</h2>
                <p className="mt-1 text-2xs text-white/45">{day.date}</p>
              </div>
              <ol className="mt-6 space-y-5">
                {day.events.map((ev) => (
                  <li key={ev.title} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 rounded-chip border border-navy-600 bg-navy-800 px-2 py-0.5 font-display text-2xs font-semibold tabular-nums text-sky">
                      {ev.time}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{ev.title}</p>
                      <p className="mt-0.5 text-2xs text-white/50">{ev.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </main>
    </PublicWorld>
  );
}
