import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES } from "@/lib/applicationTypes";
import { pipelineStepsForStatus } from "@/lib/application-pipeline";
import { PRIORITY_DEADLINE, daysUntil } from "@/lib/deadlines";
import { StatusBadge } from "@/components/apply/status-badge";
import { EmptyApplicationState } from "@/components/apply/empty-application-state";
import { Timeline } from "@/components/timeline";
import { Countdown } from "@/components/countdown/countdown";
import { AcceptanceNextSteps } from "@/components/dashboard/acceptance-next-steps";
import { QuickStatCard } from "@/components/dashboard/quick-stat-card";
import { ApplicationsIcon, QueueIcon, ShiftsIcon, TeamsIcon } from "@/components/icons";
import { CountUp } from "@/components/count-up";
import { RingProgress } from "@/components/viz/ring-progress";
import {
  BearCelebrating,
  BearFlying,
  BearSleeping,
  BearWaving,
} from "@/components/illustrations";
import { CampanileTower } from "@/components/illustrations/berkeley-scenes";
import { CatalogSeal } from "@/components/brand/catalog-seal";
import { PortalHero } from "@/components/shell/portal-hero";
import { Avatar } from "@/components/avatar";
import {
  canAccessShifts,
  canAccessTeams,
  fetchEventRoles,
} from "@/lib/event-roles";
import type { ApplicationRow, ApplicationStatus, AppRole } from "@/types";

// Same semantic mapping as StatusBadge/StatusTimeline — a status dot
// sequence for the "Your applications" quick-stat card.
const STATUS_DOT_CLASS: Record<ApplicationStatus, string> = {
  draft: "bg-ink-soft/40",
  submitted: "bg-sky",
  under_review: "bg-amber",
  accepted: "bg-mint",
  waitlisted: "bg-amber",
  rejected: "bg-brick",
};

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
): { title: string; detail: string | null } {
  if (apps.length === 0) {
    return {
      title: "You're signed in",
      detail: roleLabel ? `Signed in as a ${roleLabel}` : null,
    };
  }
  if (apps.length === 1) {
    const app = apps[0]!;
    const typeLabel = APPLICATION_TYPES[app.type].label;
    switch (app.status) {
      case "draft":
        return {
          title: "Draft in progress",
          detail: `${typeLabel} application — finish when you're ready`,
        };
      case "submitted":
        return {
          title: "Application submitted",
          detail: `${typeLabel} — waiting for review`,
        };
      case "under_review":
        return {
          title: "Under review",
          detail: `${typeLabel} — reviewers are scoring now`,
        };
      case "accepted":
        return {
          title: "You're in",
          detail: `Accepted as a ${typeLabel}`,
        };
      case "waitlisted":
        return {
          title: "Waitlisted",
          detail: `${typeLabel} — hang tight for updates`,
        };
      case "rejected":
        return {
          title: "Not accepted this round",
          detail: `Your ${typeLabel} application`,
        };
      default:
        return { title: `${typeLabel} application`, detail: null };
    }
  }
  return {
    title: `${apps.length} applications`,
    detail: "Track each one below",
  };
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

  const [{ data: profile }, eventRoles] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle(),
    fetchEventRoles(supabase, user.id),
  ]);

  const role = profile?.role as AppRole | null | undefined;
  const isStaff = role === "organizer" || role === "reviewer";
  const showTeams = canAccessTeams(eventRoles);
  const showShifts = canAccessShifts(eventRoles);

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

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, teams(name)")
    .eq("user_id", user.id)
    .maybeSingle<{
      team_id: string;
      teams: { name: string } | { name: string }[] | null;
    }>();
  const teamRaw = membership?.teams;
  const teamName = Array.isArray(teamRaw) ? teamRaw[0]?.name : teamRaw?.name;

  let teammates: { user_id: string; full_name: string | null; email: string }[] =
    [];
  if (membership?.team_id) {
    const { data: teammateRows } = await supabase
      .from("team_members")
      .select("user_id, profiles(full_name, email)")
      .eq("team_id", membership.team_id)
      .returns<
        {
          user_id: string;
          profiles: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
        }[]
      >();
    teammates = (teammateRows ?? []).map((row) => {
      const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        user_id: row.user_id,
        full_name: p?.full_name ?? null,
        email: p?.email ?? "",
      };
    });
  }

  const draftCount = apps.filter((a) => a.status === "draft").length;
  const daysUntilDeadline = daysUntil(PRIORITY_DEADLINE);
  const headline = statusHeadline(apps, roleLabel);

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

      <PortalHero
        eyebrow={`Welcome, ${firstName}`}
        title={headline.title}
        description={headline.detail}
        scene={<CampanileTower className="h-full w-auto max-w-none opacity-90" />}
        seal={
          <>
            <BearWaving className="pointer-events-none absolute right-6 top-6 z-0 w-24 opacity-70 sm:right-10 sm:top-8 sm:w-32 max-md:hidden" />
            <CatalogSeal className="pointer-events-none absolute bottom-3 right-3 z-0 w-12 opacity-45 sm:bottom-4 sm:right-6 max-md:hidden" />
          </>
        }
      >
        <div className="mt-8">
          <p className="mb-2 text-2xs font-medium text-ink-soft">Until kickoff</p>
          <Countdown size="inline" />
        </div>
      </PortalHero>

      <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStatCard
          icon={<ApplicationsIcon className="size-5" />}
          label="Your applications"
          value={
            apps.length === 0 ? (
              "None yet"
            ) : draftCount > 0 ? (
              <>
                <CountUp value={draftCount} /> draft
                {draftCount === 1 ? "" : "s"}
              </>
            ) : (
              <>
                <CountUp value={apps.length} /> in progress
              </>
            )
          }
          href="/apply"
          cta="Manage"
          secondary={
            apps.length > 0 && (
              <div className="flex items-center gap-1.5">
                {apps.map((a) => (
                  <span
                    key={a.id}
                    title={`${APPLICATION_TYPES[a.type].label}: ${a.status}`}
                    className={`size-2 rounded-full ${STATUS_DOT_CLASS[a.status]}`}
                  />
                ))}
              </div>
            )
          }
        />
        <QuickStatCard
          icon={<QueueIcon className="size-5" />}
          label="Upcoming"
          value={
            daysUntilDeadline > 0 ? (
              <>
                Priority due in <CountUp value={daysUntilDeadline} />d
              </>
            ) : (
              "Priority round closed"
            )
          }
          href="/apply"
          cta="View deadline"
          secondary={
            <span className="text-2xs text-ink-soft">
              {PRIORITY_DEADLINE.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          }
        />
        <QuickStatCard
          icon={<TeamsIcon className="size-5" />}
          label="Team"
          value={
            showTeams
              ? teamName || "Not on a team yet"
              : "Unlocks after hacker accept"
          }
          href={showTeams ? "/teams" : "/apply/hacker"}
          cta={
            showTeams
              ? teamName
                ? "View team"
                : "Find a team"
              : "Apply as hacker"
          }
          secondary={
            showTeams &&
            teammates.length > 0 && (
              <div className="flex -space-x-1.5">
                {teammates.slice(0, 5).map((t) => (
                  <span key={t.user_id} className="ring-2 ring-surface rounded-full">
                    <Avatar
                      id={t.user_id}
                      name={t.full_name || t.email || "?"}
                      size="size-6"
                    />
                  </span>
                ))}
              </div>
            )
          }
        />
        {showShifts && (
          <QuickStatCard
            icon={<ShiftsIcon className="size-5" />}
            label="Shifts"
            value="Claim weekend blocks"
            href="/shifts"
            cta="Open calendar"
          />
        )}
      </div>

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
                    <div className="flex items-center gap-3 text-sm text-ink-soft">
                      <RingProgress
                        value={progress!.done}
                        max={progress!.total}
                        size={32}
                      />
                      <span>
                        <span className="font-medium text-ink">
                          Reviews in progress
                        </span>
                        {" — "}
                        reviewers are scoring your application now.
                      </span>
                    </div>
                  )}

                  {app.status === "accepted" && (
                    <AcceptanceNextSteps
                      typeLabel={APPLICATION_TYPES[app.type].label}
                      type={app.type}
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
