import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { CapacityTargetsCard } from "@/components/organizer/capacity-targets-card";
import { OrganizerEmpty } from "@/components/organizer/organizer-empty";
import { AnimatedBarChart } from "@/components/viz/animated-bar-chart";
import { MiniSparkline } from "@/components/viz/mini-sparkline";
import { CountUp } from "@/components/count-up";
import type { ApplicationStatus } from "@/types";

const TYPES = Object.keys(APPLICATION_TYPES) as ApplicationTypeKey[];
const FUNNEL_STAGES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "accepted",
  "waitlisted",
  "rejected",
];

const STAGE_BAR_CLASS: Record<ApplicationStatus, string> = {
  draft: "bg-ink-soft",
  submitted: "bg-sky",
  under_review: "bg-amber",
  accepted: "bg-mint",
  waitlisted: "bg-amber",
  rejected: "bg-brick",
};

const STAGE_LABEL: Record<ApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
};

type HackerApp = {
  id: string;
  applicant: { full_name: string | null; email: string } | null;
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: allApps } = await supabase.from("applications").select("type, status");

  const funnel = Object.fromEntries(
    TYPES.map((type) => [type, {} as Partial<Record<ApplicationStatus, number>>])
  ) as Record<ApplicationTypeKey, Partial<Record<ApplicationStatus, number>>>;

  for (const app of allApps ?? []) {
    const byType = funnel[app.type as ApplicationTypeKey];
    if (!byType) continue;
    byType[app.status as ApplicationStatus] =
      (byType[app.status as ApplicationStatus] ?? 0) + 1;
  }

  const { data: hackerApps } = await supabase
    .from("applications")
    .select(
      "id, applicant:profiles!applications_applicant_id_fkey(full_name, email)"
    )
    .eq("type", "hacker")
    .returns<HackerApp[]>();

  const hackerIds = (hackerApps ?? []).map((a) => a.id);

  const [{ data: normReviews }, { data: assignments }] =
    hackerIds.length > 0
      ? await Promise.all([
          supabase
            .from("normalized_reviews")
            .select("application_id, raw_total, z_score")
            .in("application_id", hackerIds)
            .returns<
              { application_id: string; raw_total: number; z_score: number | null }[]
            >(),
          supabase
            .from("review_assignments")
            .select("application_id, completed_at")
            .in("application_id", hackerIds)
            .returns<{ application_id: string; completed_at: string | null }[]>(),
        ])
      : [{ data: [] }, { data: [] }];

  const rawSums = new Map<string, { sum: number; count: number }>();
  const zSums = new Map<string, { sum: number; count: number }>();
  for (const r of normReviews ?? []) {
    const raw = rawSums.get(r.application_id) ?? { sum: 0, count: 0 };
    raw.sum += Number(r.raw_total);
    raw.count += 1;
    rawSums.set(r.application_id, raw);

    if (r.z_score !== null) {
      const z = zSums.get(r.application_id) ?? { sum: 0, count: 0 };
      z.sum += Number(r.z_score);
      z.count += 1;
      zSums.set(r.application_id, z);
    }
  }

  const outstandingCount = new Map<string, number>();
  for (const a of assignments ?? []) {
    if (!a.completed_at) {
      outstandingCount.set(
        a.application_id,
        (outstandingCount.get(a.application_id) ?? 0) + 1
      );
    }
  }

  const scoreRows = (hackerApps ?? [])
    .map((app) => {
      const raw = rawSums.get(app.id);
      const z = zSums.get(app.id);
      return {
        id: app.id,
        name: app.applicant?.full_name || app.applicant?.email || "—",
        rawAvg: raw ? raw.sum / raw.count : null,
        zAvg: z ? z.sum / z.count : null,
        outstanding: outstandingCount.get(app.id) ?? 0,
      };
    })
    .sort((a, b) => (b.zAvg ?? -Infinity) - (a.zAvg ?? -Infinity));

  const hasFunnelData = (allApps ?? []).some((a) =>
    FUNNEL_STAGES.includes(a.status as ApplicationStatus)
  );

  const acceptedByType = Object.fromEntries(
    TYPES.map((type) => [type, 0])
  ) as Record<ApplicationTypeKey, number>;
  for (const app of allApps ?? []) {
    if (app.status === "accepted") {
      const t = app.type as ApplicationTypeKey;
      if (t in acceptedByType) acceptedByType[t] += 1;
    }
  }

  const { data: capacityRows } = await supabase
    .from("capacity_targets")
    .select("type, target")
    .returns<{ type: ApplicationTypeKey; target: number }[]>();

  const capacityTargets = TYPES.map((type) => {
    const row = capacityRows?.find((r) => r.type === type);
    return {
      type,
      target: row?.target ?? 0,
      accepted: acceptedByType[type] ?? 0,
    };
  });

  // Score distribution buckets (raw avg 0–30 → 6 bins)
  const bins = [0, 0, 0, 0, 0, 0];
  const binLabels = ["0–5", "5–10", "10–15", "15–20", "20–25", "25–30"];
  for (const row of scoreRows) {
    if (row.rawAvg === null) continue;
    const idx = Math.min(5, Math.floor(row.rawAvg / 5));
    bins[idx]! += 1;
  }
  const hasScoreDist = bins.some((n) => n > 0);

  const totalApps = (allApps ?? []).length;
  const submittedish = (allApps ?? []).filter((a) =>
    FUNNEL_STAGES.includes(a.status as ApplicationStatus)
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-h2 font-semibold text-ink">
          Analytics
        </h1>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-2xs text-ink-soft">Total apps</p>
            <p className="font-display text-h3 font-semibold tabular-nums text-ink">
              <CountUp value={totalApps} />
            </p>
          </div>
          <div>
            <p className="text-2xs text-ink-soft">In funnel</p>
            <p className="font-display text-h3 font-semibold tabular-nums text-ink">
              <CountUp value={submittedish} />
            </p>
          </div>
          {hasScoreDist && (
            <MiniSparkline
              values={bins}
              className="w-24"
              barClassName="bg-sunset/80"
            />
          )}
        </div>
      </div>

      <CapacityTargetsCard targets={capacityTargets} />

      <section className="flex flex-col gap-8 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-sm font-semibold text-ink">
          Funnel by type
        </h2>
        {!hasFunnelData ? (
          <OrganizerEmpty
            title="No funnel data yet"
            body="Once applications are submitted, stage counts will fill these bars."
          />
        ) : (
          TYPES.map((type) => {
            const byType = funnel[type];
            return (
              <div key={type} className="flex flex-col gap-3">
                <h3 className="text-2xs font-medium text-ink-soft">
                  {APPLICATION_TYPES[type].label}
                </h3>
                <AnimatedBarChart
                  rows={FUNNEL_STAGES.map((stage) => ({
                    key: stage,
                    label: STAGE_LABEL[stage],
                    value: byType[stage] ?? 0,
                    barClassName: STAGE_BAR_CLASS[stage],
                  }))}
                />
              </div>
            );
          })
        )}
      </section>

      {hasScoreDist && (
        <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6">
          <div>
            <h2 className="font-display text-sm font-semibold text-ink">
              Score distribution
            </h2>
            <p className="mt-1 max-w-prose text-2xs text-ink-soft">
              Raw average buckets across hacker applications with at least one
              review.
            </p>
          </div>
          <AnimatedBarChart
            rows={binLabels.map((label, i) => ({
              key: label,
              label,
              value: bins[i]!,
              barClassName: "bg-sunset",
            }))}
          />
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-sm font-semibold text-ink">
          Hacker scores — raw vs. normalized
        </h2>
        <p className="max-w-prose text-2xs text-ink-soft">
          Normalized avg corrects each reviewer&apos;s scores against their
          own mean/stddev (z-score), so a harsh reviewer&apos;s 6/10 and a
          lenient reviewer&apos;s 6/10 aren&apos;t treated as equal.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper">
              <tr>
                <th className="px-3 py-2.5 text-2xs font-medium text-ink-soft">
                  Applicant
                </th>
                <th className="px-3 py-2.5 text-2xs font-medium text-ink-soft">
                  Raw avg
                </th>
                <th className="px-3 py-2.5 text-2xs font-medium text-ink-soft">
                  Normalized avg
                </th>
                <th className="px-3 py-2.5 text-2xs font-medium text-ink-soft">
                  Reviews outstanding
                </th>
              </tr>
            </thead>
            <tbody>
              {scoreRows.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <OrganizerEmpty
                      title="No hacker reviews yet"
                      body="Scores appear here after reviewers submit rubric grades."
                    />
                  </td>
                </tr>
              )}
              {scoreRows.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/organizer/applications/${row.id}`}
                      className="font-medium text-ink underline-offset-2 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 font-display tabular-nums text-ink">
                    {row.rawAvg !== null ? row.rawAvg.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-2.5 font-display font-semibold tabular-nums text-sunset">
                    {row.zAvg !== null ? row.zAvg.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2.5 font-display tabular-nums text-ink">
                    {row.outstanding}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
