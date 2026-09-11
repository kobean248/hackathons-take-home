import { PublicWorld } from "@/components/shell/public-world";
import { SceneFaqSearch } from "@/components/illustrations/berkeley-scenes";
import { FaqAccordion } from "@/components/public/faq-accordion";

const ITEMS = [
  {
    q: "Who can apply?",
    a: "Any current student (undergrad or grad) 18+ can apply as a hacker. Mentors and volunteers don't need to be enrolled — industry folks welcome.",
  },
  {
    q: "What's the team size?",
    a: "Teams of 1–4. You can apply solo and find teammates on the portal's Teams board after you're accepted, or arrive with a crew.",
  },
  {
    q: "What should I bring?",
    a: "Laptop, charger, student ID, and a reusable water bottle. Hardware track folks: bring your own boards if you can — limited loaner kits on site.",
  },
  {
    q: "Is travel reimbursed?",
    a: "Limited travel stipends go out after acceptances. Priority for folks outside the Bay Area — details land in your acceptance email.",
  },
  {
    q: "Code of Conduct?",
    a: "Yes — we follow a standard hackathon CoC. Harassment of any kind means removal. Full text ships with acceptance materials.",
  },
  {
    q: "I'm a beginner — should I still apply?",
    a: "Absolutely. We run beginner workshops Friday night and have a dedicated Beginner track prize. Mentors are there for first-timers.",
  },
];

export default function FaqPage() {
  return (
    <PublicWorld
      scene={<SceneFaqSearch className="mx-auto h-auto w-full max-w-2xl" />}
    >
      <main className="mx-auto max-w-[1120px] px-6 py-12 sm:py-16">
        <div className="relative max-w-xl">
          <p className="text-2xs font-medium tracking-wide text-cal-gold">FAQ</p>
          <h1 className="mt-2 font-hero text-h1 font-extrabold tracking-tight">
            Questions from Sproul
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Can&apos;t find what you need? Email{" "}
            <span className="text-cal-gold">hello@hackathons.berkeley.edu</span>{" "}
            (placeholder) and we&apos;ll get back to you.
          </p>
        </div>

        <div className="mt-12 max-w-2xl">
          <FaqAccordion items={ITEMS} />
        </div>
      </main>
    </PublicWorld>
  );
}
