import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isCalibrationComplete, type RubricScores } from "@/lib/organizer-ops";
import { OrganizerEmpty } from "@/components/organizer/organizer-empty";
import { PortalHero } from "@/components/shell/portal-hero";
import { SceneFaqSearch } from "@/components/illustrations/berkeley-scenes";
import { RingProgress } from "@/components/viz/ring-progress";

type SampleRow = {
  id: string;
  title: string;
  sort_order: number;
};

type AttemptRow = {
  sample_id: string;
  scores: RubricScores;
};

export default async function CalibrationPage() {
  const supabase = await createClient();

  const { data: samples } = await supabase
    .from("calibration_samples")
    .select("id, title, sort_order")
    .order("sort_order", { ascending: true })
    .returns<SampleRow[]>();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: attempts } = user
    ? await supabase
        .from("calibration_attempts")
        .select("sample_id, scores")
        .eq("reviewer_id", user.id)
        .returns<AttemptRow[]>()
    : { data: [] as AttemptRow[] };

  const doneIds = new Set((attempts ?? []).map((a) => a.sample_id));
  const sampleCount = samples?.length ?? 0;
  const complete = isCalibrationComplete(sampleCount, doneIds.size);

  return (
    <div className="flex flex-col gap-6">
      <PortalHero
        eyebrow="Organizer"
        title="Calibration"
        description="Grade three gold-standard samples before reviewing real applications. After you submit, you'll see how your scores compare to the organizer gold standard."
        scene={<SceneFaqSearch className="h-full w-full" />}
      >
        {sampleCount > 0 && (
          <div className="mt-5">
            <RingProgress
              value={doneIds.size}
              max={sampleCount}
              size={36}
              label={`${doneIds.size} of ${sampleCount} samples graded`}
            />
          </div>
        )}
      </PortalHero>

      {complete && (
        <p className="rounded-xl border border-mint/30 bg-mint/10 px-4 py-3 text-sm text-mint">
          Calibration complete — you&apos;re cleared for the live queue.
        </p>
      )}

      {!samples || samples.length === 0 ? (
        <OrganizerEmpty
          title="No calibration samples yet"
          body="Ask an organizer to run the latest database migration so the three gold samples are seeded."
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {samples.map((sample, i) => {
            const done = doneIds.has(sample.id);
            return (
              <li key={sample.id}>
                <Link
                  href={`/organizer/calibration/${sample.id}`}
                  className="card-lift flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-4"
                >
                  <div>
                    <p className="text-2xs text-ink-soft">Sample {i + 1}</p>
                    <p className="font-medium text-ink">{sample.title}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-chip px-2 py-0.5 text-2xs font-medium ${
                      done
                        ? "bg-mint/15 text-mint"
                        : "bg-amber/15 text-amber"
                    }`}
                  >
                    {done ? "Submitted" : "Not started"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
