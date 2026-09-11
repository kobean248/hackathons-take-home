import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import type { ApplicationStatus } from "@/types";

const TYPES = Object.keys(APPLICATION_TYPES) as ApplicationTypeKey[];
const FUNNEL_STAGES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "accepted",
  "waitlisted",
  "rejected",
];

type HackerApp = {
  id: string;
  applicant: { full_name: string | null; email: string } | null;
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // ---------- funnel: submitted -> under_review -> decision, per type ----------
  const { data: allApps } = await supabase.from("applications").select("type, status");

  const funnel = Object.fromEntries(
    TYPES.map((type) => [type, {} as Partial<Record<ApplicationStatus, number>>])
  ) as Record<ApplicationTypeKey, Partial<Record<ApplicationStatus, number>>>;

  for (const app of allApps ?? []) {
    const byType = funnel[app.type as ApplicationTypeKey];
    if (!byType) continue; // e.g. a "judge" application, not in TYPES yet
    byType[app.status as ApplicationStatus] =
      (byType[app.status as ApplicationStatus] ?? 0) + 1;
  }

  // ---------- hacker scores: raw vs normalized, + reviews outstanding ----------
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
      outstandingCount.set(a.application_id, (outstandingCount.get(a.application_id) ?? 0) + 1);
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

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Analytics</h1>

      <section className="flex flex-col gap-6 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
        <h2 className="text-sm font-semibold text-zinc-500">
          Funnel by type
        </h2>
        {TYPES.map((type) => {
          const byType = funnel[type];
          const max = Math.max(1, ...FUNNEL_STAGES.map((s) => byType[s] ?? 0));
          return (
            <div key={type} className="flex flex-col gap-1.5">
              <h3 className="text-sm font-medium">
                {APPLICATION_TYPES[type].label}
              </h3>
              {FUNNEL_STAGES.map((stage) => {
                const count = byType[stage] ?? 0;
                return (
                  <div key={stage} className="flex items-center gap-2 text-xs">
                    <span className="w-24 shrink-0 text-zinc-500">
                      {stage}
                    </span>
                    <div className="h-3 flex-1 rounded bg-black/[.04] dark:bg-white/[.06]">
                      <div
                        className="h-3 rounded bg-blue-600"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
        <h2 className="text-sm font-semibold text-zinc-500">
          Hacker scores — raw vs. normalized
        </h2>
        <p className="text-xs text-zinc-500">
          Normalized avg corrects each reviewer&apos;s scores against their
          own mean/stddev (z-score), so a harsh reviewer&apos;s 6/10 and a
          lenient reviewer&apos;s 6/10 aren&apos;t treated as equal. Shows
          &ldquo;—&rdquo; until a reviewer has submitted enough reviews for a
          stddev to exist.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[.02] dark:bg-white/[.03]">
              <tr>
                <th className="px-3 py-2 font-medium">Applicant</th>
                <th className="px-3 py-2 font-medium">Raw avg</th>
                <th className="px-3 py-2 font-medium">Normalized avg</th>
                <th className="px-3 py-2 font-medium">Reviews outstanding</th>
              </tr>
            </thead>
            <tbody>
              {scoreRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-zinc-500">
                    No hacker reviews yet.
                  </td>
                </tr>
              )}
              {scoreRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-black/[.08] dark:border-white/[.145]"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/organizer/applications/${row.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {row.rawAvg !== null ? row.rawAvg.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {row.zAvg !== null ? row.zAvg.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2">{row.outstanding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
