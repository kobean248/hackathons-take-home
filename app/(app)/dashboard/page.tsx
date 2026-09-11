import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES } from "@/lib/applicationTypes";
import { pipelineStepsForStatus } from "@/lib/application-pipeline";
import { StatusBadge } from "@/components/apply/status-badge";
import { EmptyApplicationState } from "@/components/apply/empty-application-state";
import { Timeline } from "@/components/timeline";
import { Countdown } from "@/components/countdown/countdown";
import { AcceptanceNextSteps } from "@/components/dashboard/acceptance-next-steps";
import {
  BearCelebrating,
  BearFlying,
  BearSleeping,
  BearWaving,
  GlobeCurve,
} from "@/components/illustrations";
import type { ApplicationRow, ApplicationStatus, AppRole } from "@/types";

function firstNameFrom(
  fullName: string | null | undefined,
  email: string
): string {
  if (fullName?.trim()) {
    return fullName.trim().split(/\s+/)[0] ?? "there";
  }
  const local = email.split("@")[0] ?? "there";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function statusHeadline(
  apps: ApplicationRow[],
  roleLabel: string | null
): string {
  if (apps.length === 0) {
    return roleLabel
      ? `You're signed in as a ${roleLabel}`
      : "You're signed in";
  }
  if (apps.length === 1) {
    const app = apps[0]!;
    const typeLabel = APPLICATION_TYPES[app.type].label;
    switch (app.status) {
      case "draft":
        return `Your ${typeLabel} application is a draft`;
      case "submitted":
        return `Your ${typeLabel} application is submitted`;
      case "under_review":
        return `Your ${typeLabel} application is under review`;
      case "accepted":
        return `You're accepted as a ${typeLabel}`;
      case "waitlisted":
        return `You're waitlisted as a ${typeLabel}`;
      case "rejected":
        return `Your ${typeLabel} application wasn't accepted`;
      default:
        return `Your ${typeLabel} application`;
    }
  }
  return `You have ${apps.length} applications in progress`;
}

function StageBear({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  if (status === "draft") return <BearSleeping className={className} />;
  if (status === "submitted") return <BearWaving className={className} />;
  if (status === "under_review") return <BearFlying className={className} />;
  if (status === "accepted") return <BearCelebrating className={className} />;
  if (status === "waitlisted") return <BearWaving className={className} />;
  return <BearSleeping className={className} />;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as AppRole | null | undefined;
  const isStaff = role === "organizer" || role === "reviewer";

  const { data: applications } = await supabase
    .from("applications")
    .select("id, type, status, submitted_at, decided_at")
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: true })
    .returns<ApplicationRow[]>();

  const apps = applications ?? [];
  const firstName = firstNameFrom(profile?.full_name, user.email ?? "");
  const primaryType = apps[0]?.type;
  const roleLabel = primaryType
    ? APPLICATION_TYPES[primaryType].label
    : null;

  const hackerApps = apps.filter((a) => a.type === "hacker");
  const hackerIds = hackerApps.map((a) => a.id);
  const reviewProgress = new Map<string, { done: number; total: number }>();

  if (hackerIds.length > 0) {
    const [{ data: assignments }, { data: reviews }] = await Promise.all([
      supabase
        .from("review_assignments")
        .select("application_id")
        .in("application_id", hackerIds),
      supabase
        .from("reviews")
        .select("application_id")
        .in("application_id", hackerIds),
    ]);

    for (const id of hackerIds) {
      reviewProgress.set(id, { done: 0, total: 0 });
    }
    for (const row of assignments ?? []) {
      const cur = reviewProgress.get(row.application_id);
      if (cur) cur.total += 1;
    }
    for (const row of reviews ?? []) {
      const cur = reviewProgress.get(row.application_id);
      if (cur) cur.done += 1;
    }
  }

  return (
    <main className="flex flex-col gap-6">
      {error && (
        <p className="rounded-chip bg-amber/12 px-3 py-2 text-sm text-amber">
          {error}
        </p>
      )}

      {isStaff && (
        <Link
          href="/organizer/applications"
          className="flex items-center justify-between gap-3 rounded-xl border border-sunset/40 bg-sunset/10 px-4 py-3 text-sm text-ink hover:bg-sunset/15"
        >
          <span>
            <span className="font-medium text-ink">Organizer console</span>
            <span className="text-ink-soft">
              {" "}
              — applications, grading, reviewers, analytics
            </span>
          </span>
          <span className="shrink-0 font-medium text-sunset">Open →</span>
        </Link>
      )}

      <section className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8">
        <GlobeCurve className="pointer-events-none absolute -bottom-16 -right-20 w-[120%] max-w-xl opacity-[0.14] sm:-right-10 sm:w-[70%] sm:opacity-[0.18]" />
        <BearWaving className="pointer-events-none absolute -right-2 top-2 w-24 opacity-90 sm:right-4 sm:top-4 sm:w-32" />

        <div className="relative z-10 max-w-lg">
          <p className="text-2xs font-medium text-ink-soft">
            Welcome, {firstName}
          </p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink">
            {statusHeadline(apps, roleLabel)}
          </h1>

          <div className="mt-8">
            <p className="mb-2 text-2xs font-medium text-ink-soft">
              Until kickoff
            </p>
            <Countdown size="inline" />
          </div>
        </div>
      </section>

      {apps.length === 0 ? (
        <EmptyApplicationState />
      ) : (
        <div className="flex flex-col gap-4">
          {apps.map((app) => {
            const progress = reviewProgress.get(app.id);
            const showReview =
              app.type === "hacker" &&
              progress &&
              progress.total > 0 &&
              (
                [
                  "submitted",
                  "under_review",
                  "accepted",
                  "waitlisted",
                  "rejected",
                ] as ApplicationStatus[]
              ).includes(app.status);

            return (
              <section
                key={app.id}
                className="relative overflow-hidden rounded-xl border border-line bg-surface p-6"
              >
                <StageBear
                  status={app.status}
                  className="pointer-events-none absolute -right-2 -top-1 w-20 opacity-90 sm:right-4 sm:top-2 sm:w-24"
                />

                <div className="relative z-10 flex max-w-[calc(100%-5.5rem)] flex-col gap-5 sm:max-w-[calc(100%-7rem)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-h3 font-semibold text-ink">
                      {APPLICATION_TYPES[app.type].label}
                    </h2>
                    <StatusBadge status={app.status} />
                  </div>

                  {app.status !== "draft" ? (
                    <Timeline steps={pipelineStepsForStatus(app.status)} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-ink-soft">
                        Finish and submit when you&apos;re ready — drafts stay
                        private until you submit.
                      </p>
                      <Link
                        href={`/apply/${app.type}`}
                        className="w-fit text-sm font-medium text-sunset"
                      >
                        Continue draft →
                      </Link>
                    </div>
                  )}

                  {showReview && (
                    <p className="text-sm text-ink-soft">
                      <span className="font-medium text-ink">
                        {progress!.done} of {progress!.total} reviews complete
                      </span>
                      {" — "}
                      reviewers are scoring your application now.
                    </p>
                  )}

                  {app.status === "accepted" && (
                    <AcceptanceNextSteps
                      typeLabel={APPLICATION_TYPES[app.type].label}
                    />
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
