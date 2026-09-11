import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { StatusBadge } from "@/components/apply/status-badge";
import { StatusTimeline } from "@/components/apply/status-timeline";
import { DecisionButtons } from "@/components/organizer/decision-buttons";
import { GradingPanel } from "@/components/organizer/grading-panel";
import { ReviewsList } from "@/components/organizer/reviews-list";
import type { ApplicationStatus, ApplicationStatusHistoryRow } from "@/types";

type ApplicationDetail = {
  id: string;
  type: ApplicationTypeKey;
  status: ApplicationStatus;
  form_data: Record<string, unknown> | null;
  resume_path: string | null;
  submitted_at: string | null;
  applicant: { full_name: string | null; email: string } | null;
};

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
      "id, type, status, form_data, resume_path, submitted_at, applicant:profiles!applications_applicant_id_fkey(full_name, email)"
    )
    .eq("id", id)
    .returns<ApplicationDetail[]>()
    .single();

  if (!application) {
    notFound();
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
        <div>
          <h1 className="text-xl font-semibold">
            {application.applicant?.full_name || application.applicant?.email}
          </h1>
          <p className="text-sm text-zinc-500">
            {config.label} application
            {application.submitted_at &&
              ` · submitted ${new Date(application.submitted_at).toLocaleDateString()}`}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <DecisionButtons
        applicationId={application.id}
        currentStatus={application.status}
      />

      <div className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">
          Responses
        </h2>
        <dl className="flex flex-col gap-3">
          {config.fields
            .filter((field) => field.type !== "file")
            .map((field) => (
              <div key={field.name}>
                <dt className="text-xs text-zinc-500">{field.label}</dt>
                <dd className="whitespace-pre-wrap text-sm">
                  {String(formData[field.name] ?? "—")}
                </dd>
              </div>
            ))}
        </dl>

        {resumeUrl && (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm font-medium underline"
          >
            View resume
          </a>
        )}
      </div>

      {canGrade && (
        <GradingPanel applicationId={application.id} existing={myReview} />
      )}

      {application.type === "hacker" && (
        <div className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500">
            Reviews
          </h2>
          <ReviewsList reviews={allReviews} />
        </div>
      )}

      <div className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">History</h2>
        <StatusTimeline history={history ?? []} />
      </div>
    </div>
  );
}
