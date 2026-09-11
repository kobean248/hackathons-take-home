import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalibrationPanel } from "@/components/organizer/calibration-panel";
import type { RubricScores } from "@/lib/organizer-ops";

type SampleDetail = {
  id: string;
  title: string;
  form_data: Record<string, unknown>;
  gold_scores: RubricScores;
  gold_comments: string | null;
};

const FIELD_LABELS: Record<string, string> = {
  school: "School",
  graduation_year: "Graduation year",
  why_cal_hacks: "Why Cal Hacks?",
  project_idea: "Project idea",
};

export default async function CalibrationSamplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sample } = await supabase
    .from("calibration_samples")
    .select("id, title, form_data, gold_scores, gold_comments")
    .eq("id", id)
    .returns<SampleDetail[]>()
    .maybeSingle();

  if (!sample) notFound();

  const { data: attempt } = await supabase
    .from("calibration_attempts")
    .select("scores")
    .eq("sample_id", id)
    .eq("reviewer_id", user.id)
    .returns<{ scores: RubricScores }[]>()
    .maybeSingle();

  const formData = sample.form_data ?? {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/organizer/calibration"
          className="text-2xs text-sky underline-offset-2 hover:underline"
        >
          ← All samples
        </Link>
        <h1 className="mt-2 font-display text-h2 font-semibold text-ink">
          {sample.title}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Grade as you would a real hacker application. Gold scores appear only
          after you submit.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-6">
        <h2 className="mb-4 text-2xs font-medium text-ink-soft">Responses</h2>
        <dl className="flex flex-col gap-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <dt className="text-2xs text-ink-soft">
                {FIELD_LABELS[key] ?? key}
              </dt>
              <dd className="whitespace-pre-wrap text-sm text-ink">
                {String(value ?? "—")}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <CalibrationPanel
        sampleId={sample.id}
        goldScores={sample.gold_scores}
        goldComments={sample.gold_comments}
        existing={attempt?.scores ?? null}
      />
    </div>
  );
}
