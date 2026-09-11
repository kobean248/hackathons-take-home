import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { StatusBadge } from "@/components/apply/status-badge";
import { DeadlineChip } from "@/components/deadline-chip";
import {
  BearCelebrating,
  BearFlying,
  BearWaving,
  CloudShape,
} from "@/components/illustrations";
import { PRIORITY_DEADLINE_LABEL } from "@/lib/deadlines";
import type { ApplicationStatus } from "@/types";

const TYPES = Object.keys(APPLICATION_TYPES) as ApplicationTypeKey[];

const ROLE_META: Record<
  ApplicationTypeKey,
  { blurb: string; pose: "flying" | "waving" | "celebrating"; accent: string }
> = {
  hacker: {
    blurb: "Build something wild. Full application + rubric review.",
    pose: "flying",
    accent: "var(--color-sunset)",
  },
  mentor: {
    blurb: "Help teams unstick. Lighter form, organizer decision.",
    pose: "waving",
    accent: "var(--color-sky)",
  },
  volunteer: {
    blurb: "Keep the event flying. Short form, accept/reject.",
    pose: "celebrating",
    accent: "var(--color-mint)",
  },
};

function RoleBear({
  pose,
  className,
}: {
  pose: "flying" | "waving" | "celebrating";
  className?: string;
}) {
  if (pose === "waving") return <BearWaving className={className} />;
  if (pose === "celebrating") return <BearCelebrating className={className} />;
  return <BearFlying className={className} />;
}

export default async function ApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("type, status")
    .eq("applicant_id", user.id)
    .returns<{ type: ApplicationTypeKey; status: ApplicationStatus }[]>();

  const statusByType = new Map(
    (applications ?? []).map((a) => [a.type, a.status])
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8">
        <CloudShape
          variant={2}
          cream="var(--color-sky)"
          className="pointer-events-none absolute -right-8 -top-6 w-48 opacity-[0.12]"
        />
        <div className="relative z-10">
          <DeadlineChip date={PRIORITY_DEADLINE_LABEL} label="Priority due" />
          <h1 className="mt-3 font-display text-h1 font-semibold tracking-tight text-ink">
            Choose a role
          </h1>
          <p className="mt-2 max-w-prose text-sm text-ink-soft">
            Apply as a hacker, mentor, or volunteer. You can start more than
            one — each has its own form and status.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {TYPES.map((type) => {
          const config = APPLICATION_TYPES[type];
          const meta = ROLE_META[type];
          const status = statusByType.get(type);
          const cta = status
            ? status === "draft"
              ? "Continue draft"
              : "View application"
            : "Start application";

          return (
            <Link
              key={type}
              href={`/apply/${type}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface p-5 hover:border-ink/20"
            >
              <CloudShape
                variant={4}
                cream={meta.accent}
                className="pointer-events-none absolute -bottom-4 -right-4 w-28 opacity-[0.14] transition-opacity group-hover:opacity-[0.22]"
              />
              <RoleBear
                pose={meta.pose}
                className="relative z-10 mb-3 w-20 self-end sm:w-24"
              />
              <div className="relative z-10 mt-auto flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-h3 font-semibold text-ink">
                    {config.label}
                  </h2>
                  {status ? (
                    <StatusBadge status={status} />
                  ) : (
                    <span className="text-2xs text-ink-soft">Not started</span>
                  )}
                </div>
                <p className="text-2xs leading-relaxed text-ink-soft">
                  {meta.blurb}
                </p>
                <span className="mt-2 text-sm font-medium text-sunset">
                  {cta} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
