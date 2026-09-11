import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { StatusBadge } from "@/components/apply/status-badge";
import { StatusTimeline } from "@/components/apply/status-timeline";
import { DecisionButtons } from "@/components/organizer/decision-buttons";
import { GradingPanel } from "@/components/organizer/grading-panel";
import { ReviewsList } from "@/components/organizer/reviews-list";
import { Avatar } from "@/components/avatar";
import { FlagIcon } from "@/components/icons";
import { fraudFlagTooltip, type FraudFlagKind } from "@/lib/fraud-flags";
import { daysSince } from "@/lib/deadlines";
import type { ApplicationStatus, ApplicationStatusHistoryRow } from "@/types";

type ApplicationDetail = {
  id: string;
  applicant_id: string;
  type: ApplicationTypeKey;
  status: ApplicationStatus;
  form_data: Record<string, unknown> | null;
  resume_path: string | null;
  submitted_at: string | null;
  created_at: string;
  applicant: {
    full_name: string | null;
    email: string;
    school: string | null;
    github_url: string | null;
  } | null;
};

type TeamInfo = { name: string; join_code: string } | null;

type Scores = { technical: number; creativity: number; impact: number };

type ReviewRow = {
  id: string;
  reviewer_id: string;
  scores: Scores;
  raw_total: number;
  comments: string | null;
  reviewer: { full_name: string | null; email: string } | null;
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: application } = await supabase
    .from("applications")
    .select(
      "id, applicant_id, type, status, form_data, resume_path, submitted_at, created_at, applicant:profiles!applications_applicant_id_fkey(full_name, email, school, github_url)"
    )
    .eq("id", id)
    .returns<ApplicationDetail[]>()
    .single();

  if (!application) {
    notFound();
  }

  // Team membership — organizers reviewing a hacker application often need
  // to know who else is on the team, not just the individual applicant.
  const { data: membership } = await supabase
    .from("team_members")
    .select("teams(name, join_code)")
    .eq("user_id", application.applicant_id)
    .returns<
      {
        teams: { name: string; join_code: string } | { name: string; join_code: string }[] | null;
      }[]
    >()
    .maybeSingle();
  const teamRaw = membership?.teams;
  const team: TeamInfo = Array.isArray(teamRaw) ? (teamRaw[0] ?? null) : (teamRaw ?? null);

  const applicantName =
    application.applicant?.full_name || application.applicant?.email || "?";

  const ageSource = application.submitted_at ?? application.created_at;
  const daysAgo = ageSource ? daysSince(ageSource) : null;

  let flagKinds: FraudFlagKind[] = [];
  if (viewerProfile?.role === "organizer") {
    const { data: flagRows } = await supabase
      .from("application_fraud_flags")
      .select("flag_kind")
      .eq("application_id", id)
      .returns<{ flag_kind: string }[]>();
    flagKinds = (flagRows ?? [])
      .map((r) => r.flag_kind)
      .filter(
        (k): k is FraudFlagKind =>
          k === "duplicate_name" || k === "identical_answer"
      );
  }

  const config = APPLICATION_TYPES[application.type];
  const formData = application.form_data ?? {};

  let resumeUrl: string | null = null;
  if (application.resume_path) {
    const { data: signed } = await supabase.storage
      .from("resumes")
      .createSignedUrl(application.resume_path, 60 * 10);
    resumeUrl = signed?.signedUrl ?? null;
  }

  const { data: history } = await supabase
    .from("application_status_history")
    .select("id, application_id, status, changed_at, note")
    .eq("application_id", id)
    .order("changed_at", { ascending: true })
    .returns<ApplicationStatusHistoryRow[]>();

  const canGrade =
    application.type === "hacker" &&
    (viewerProfile?.role === "organizer" || viewerProfile?.role === "reviewer");

  let capacity: {
    accepted: number;
    target: number;
    typeLabel: string;
  } | null = null;

  if (viewerProfile?.role === "organizer") {
    const [{ count }, { data: targetRow }] = await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("type", application.type)
        .eq("status", "accepted"),
      supabase
        .from("capacity_targets")
        .select("target")
        .eq("type", application.type)
        .maybeSingle(),
    ]);
    if (targetRow) {
      capacity = {
        accepted: count ?? 0,
        target: targetRow.target,
        typeLabel: config.label,
      };
    }
  }

  let myReview: { scores: Scores; comments: string | null } | null = null;
  let allReviews: ReviewRow[] = [];

  if (application.type === "hacker") {
    const [{ data: mine }, { data: reviews }] = await Promise.all([
      supabase
        .from("reviews")
        .select("scores, comments")
        .eq("application_id", id)
        .eq("reviewer_id", user.id)
        .returns<{ scores: Scores; comments: string | null }[]>()
        .maybeSingle(),
      supabase
        .from("reviews")
        .select(
          "id, reviewer_id, scores, raw_total, comments, reviewer:profiles!reviews_reviewer_id_fkey(full_name, email)"
        )
        .eq("application_id", id)
        .order("submitted_at", { ascending: true })
        .returns<ReviewRow[]>(),
    ]);
    myReview = mine ?? null;
    allReviews = reviews ?? [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar id={application.applicant_id} name={applicantName} size="size-11" />
          <div>
            <h1 className="font-display text-h2 font-semibold">
              {applicantName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {config.label} application
              {application.submitted_at &&
                ` · submitted ${new Date(application.submitted_at).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-2xs font-medium text-muted-foreground">
          Applicant
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-2xs text-muted-foreground">Email</dt>
            <dd className="text-sm">{application.applicant?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-2xs text-muted-foreground">School</dt>
            <dd className="text-sm">
              {application.applicant?.school || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-2xs text-muted-foreground">GitHub</dt>
            <dd className="text-sm">
              {application.applicant?.github_url ? (
                <a
                  href={application.applicant.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sunset underline"
                >
                  {application.applicant.github_url}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>

        {/* Secondary/inset tier: paper-tinted, no border, smaller radius —
            depth without a shadow, per the flat design system. */}
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-3">
          <div className="rounded-lg bg-paper px-3 py-2.5">
            <dt className="text-2xs text-muted-foreground">Team</dt>
            <dd className="mt-0.5 text-sm">
              {team ? (
                <>
                  {team.name}{" "}
                  <span className="text-2xs text-muted-foreground">
                    ({team.join_code})
                  </span>
                </>
              ) : (
                "Not on a team"
              )}
            </dd>
          </div>
          <div className="rounded-lg bg-paper px-3 py-2.5">
            <dt className="text-2xs text-muted-foreground">Applied</dt>
            <dd className="mt-0.5 text-sm">
              {daysAgo === null
                ? "Not yet submitted"
                : daysAgo === 0
                  ? "Today"
                  : `${daysAgo}d ago`}
            </dd>
          </div>
          <div className="rounded-lg bg-paper px-3 py-2.5">
            <dt className="text-2xs text-muted-foreground">Flags</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              {flagKinds.length > 0 ? (
                <>
                  <FlagIcon className="size-3.5 text-amber" />
                  <span title={fraudFlagTooltip(flagKinds)}>
                    {flagKinds.length} flagged
                  </span>
                </>
              ) : (
                <span className="text-ink-soft">None</span>
              )}
            </dd>
          </div>
        </div>
      </div>

      <DecisionButtons
        applicationId={application.id}
        currentStatus={application.status}
        capacity={capacity}
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-2xs font-medium text-muted-foreground">
          Responses
        </h2>
        <dl className="flex flex-col gap-3">
          {config.fields
            .filter((field) => field.type !== "file")
            .map((field) => (
              <div key={field.name} className="rounded-lg bg-paper px-3 py-2.5">
                <dt className="text-2xs text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm">
                  {String(formData[field.name] ?? "—")}
                </dd>
              </div>
            ))}
        </dl>

        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm font-medium text-sunset underline"
          >
            View resume
          </a>
        ) : (
          application.type === "hacker" && (
            <p className="mt-4 text-2xs text-muted-foreground">
              No resume uploaded yet.
            </p>
          )
        )}
      </div>

      {canGrade && (
        <GradingPanel applicationId={application.id} existing={myReview} />
      )}

      {application.type === "hacker" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-2xs font-medium text-muted-foreground">
            Reviews
          </h2>
          <ReviewsList reviews={allReviews} />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-2xs font-medium text-muted-foreground">
          History
        </h2>
        <StatusTimeline history={history ?? []} />
      </div>
    </div>
  );
}
