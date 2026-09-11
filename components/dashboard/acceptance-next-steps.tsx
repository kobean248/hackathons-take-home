import Link from "next/link";
import { CatalogSeal } from "@/components/brand/catalog-seal";
import type { ApplicationTypeKey } from "@/lib/applicationTypes";
import { canAccessShifts, canAccessTeams } from "@/lib/event-roles";

const STEPS = [
  {
    title: "Join Discord",
    body: "Invite link lands in your acceptance email. Channels for teams, travel, and hardware open ~1 week before kickoff.",
    cta: { href: "#", label: "Discord (placeholder)" },
  },
  {
    title: "Travel & lodging",
    body: "If you requested a stipend, watch for a follow-up form. Bay Area folks: Muni/BART to campus; limited overnight rooms TBA.",
  },
  {
    title: "What to bring",
    body: "Laptop + charger, student ID, reusable bottle, hoodie. Hardware track: bring boards if you have them.",
  },
  {
    title: "Check-in",
    body: "Friday 5:00p at Memorial Glade tents. Bring photo ID. Wristband gets you meals and venue access.",
  },
];

export function AcceptanceNextSteps({
  typeLabel,
  type,
}: {
  typeLabel: string;
  type: ApplicationTypeKey;
}) {
  const portal =
    type === "hacker"
      ? { href: "/teams", label: "Find a team", blurb: "Form or join a squad for the weekend." }
      : canAccessShifts([type])
        ? {
            href: "/shifts",
            label: "Pick your shifts",
            blurb: "Claim mentor, volunteer, or judge blocks on the weekend calendar.",
          }
        : null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-mint/35 bg-mint/8 p-4 sm:p-5">
      <CatalogSeal
        topText="APPROVED"
        bottomText="REGISTRAR"
        ringColor="var(--color-mint)"
        glyphColor="var(--color-mint)"
        className="pointer-events-none absolute -right-2 -top-2 w-16 opacity-80"
      />
      <p className="font-display text-sm font-semibold text-ink">
        You&apos;re in as a {typeLabel}
      </p>
      <p className="mt-1 text-2xs text-ink-soft">
        Next steps before the weekend — details also go to your email.
      </p>
      {portal && (
        <Link
          href={portal.href}
          className="mt-3 flex flex-col rounded-lg border border-mint/30 bg-surface/80 px-3 py-2.5 transition-colors hover:border-sunset/40"
        >
          <span className="text-sm font-medium text-sunset">{portal.label} →</span>
          <span className="text-2xs text-ink-soft">{portal.blurb}</span>
        </Link>
      )}
      <ol className="mt-4 space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint/20 font-display text-2xs font-semibold tabular-nums text-mint">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{step.title}</p>
              <p className="mt-0.5 text-2xs leading-relaxed text-ink-soft">
                {step.body}
              </p>
              {step.cta && (
                <Link
                  href={step.cta.href}
                  className="mt-1 inline-block text-2xs font-medium text-sunset"
                >
                  {step.cta.label} →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
      <Link
        href="/dashboard/next-steps"
        className="mt-4 inline-block text-2xs font-medium text-sky"
      >
        Full next-steps page →
      </Link>
    </div>
  );
}

/** Keep canAccessTeams imported for type narrowing clarity in callers. */
void canAccessTeams;
