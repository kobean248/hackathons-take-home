import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { StatusBadge } from "@/components/apply/status-badge";
import { DeadlineChip } from "@/components/deadline-chip";
import { CatalogSeal } from "@/components/brand/catalog-seal";
import { CheckIcon, GraduationCapIcon, QueueIcon } from "@/components/icons";
import { PRIORITY_DEADLINE_LABEL } from "@/lib/deadlines";
import { PortalHero } from "@/components/shell/portal-hero";
import { SceneSatherGate } from "@/components/illustrations/berkeley-scenes";
import type { ApplicationStatus } from "@/types";

const TYPES = Object.keys(APPLICATION_TYPES) as ApplicationTypeKey[];

/** CalCentral-flavored course cards — Berkeley-only joke. */
const COURSE_META: Record<
  ApplicationTypeKey,
  {
    code: string;
    units: string;
    meeting: string;
    instructor: string;
    prereq: string;
    blurb: string;
  }
> = {
  hacker: {
    code: "HACK 189",
    units: "3 units",
    meeting: "Fri–Sun · Memorial Glade",
    instructor: "MLH / Cal Hacks",
    prereq: "Enthusiasm",
    blurb: "Full application + rubric review. Ship something wild.",
  },
  mentor: {
    code: "MENT 101",
    units: "1 unit",
    meeting: "Drop-in · Sat–Sun",
    instructor: "Industry staff",
    prereq: "Experience",
    blurb: "Help teams unstick. Lighter form, organizer decision.",
  },
  volunteer: {
    code: "VOL 10A",
    units: "P/NP",
    meeting: "Shifts · TBD",
    instructor: "Ops crew",
    prereq: "None",
    blurb: "Keep the event flying. Short form, accept/reject.",
  },
  judge: {
    code: "JUDG 200",
    units: "1 unit",
    meeting: "Sun · Expo floor",
    instructor: "Sponsors / alumni",
    prereq: "Domain depth",
    blurb: "Score demos at expo. Short form, organizer decision.",
  },
};

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
      <PortalHero
        title="Course registration"
        description="Pick a role like you’d add a class in CalCentral — you can enroll in more than one."
        scene={<SceneSatherGate className="h-full w-full" />}
        seal={
          <CatalogSeal className="pointer-events-none absolute -right-3 -top-3 z-[1] w-24 opacity-90 sm:w-28" />
        }
      >
        <div className="mt-4">
          <DeadlineChip date={PRIORITY_DEADLINE_LABEL} label="Priority due" />
        </div>
      </PortalHero>

      <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TYPES.map((type) => {
          const config = APPLICATION_TYPES[type];
          const course = COURSE_META[type];
          const status = statusByType.get(type);
          const cta = status
            ? status === "draft"
              ? "Continue draft"
              : "View application"
            : "Add to cart";

          return (
            <Link
              key={type}
              href={`/apply/${type}`}
              className="card-lift group flex flex-col overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="border-b border-line bg-berkeley px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-ui text-2xs font-semibold tracking-wide text-cal-gold">
                    {course.code}
                  </span>
                  <span className="font-ui text-2xs text-white/70">
                    {course.units}
                  </span>
                </div>
                <p className="mt-0.5 font-ui text-2xs text-white/55">
                  {course.meeting}
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-hero text-h3 font-bold text-ink">
                    {config.label}
                  </h2>
                  {status ? (
                    <StatusBadge status={status} />
                  ) : (
                    <span className="text-2xs text-ink-soft">Open</span>
                  )}
                </div>
                <dl className="space-y-1.5 text-2xs text-ink-soft">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="flex items-center gap-1.5">
                      <GraduationCapIcon className="size-3.5" />
                      Instructor
                    </dt>
                    <dd className="font-medium text-ink">{course.instructor}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="flex items-center gap-1.5">
                      <CheckIcon className="size-3.5" />
                      Prerequisites
                    </dt>
                    <dd className="font-medium text-ink">{course.prereq}</dd>
                  </div>
                </dl>
                <p className="text-2xs leading-relaxed text-ink-soft">
                  {course.blurb}
                </p>
                <span className="mt-auto pt-2 text-sm font-medium text-sunset">
                  {cta} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col items-start gap-2 border-t border-line px-1 pt-3 text-2xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-1.5">
          <QueueIcon className="size-3.5 shrink-0" />
          Add/drop deadline: priority round closes{" "}
          <span className="font-medium text-ink">
            {PRIORITY_DEADLINE_LABEL}
          </span>
          . Late enrollment is reviewed at organizer discretion.
        </span>
      </div>
      </div>
    </div>
  );
}
