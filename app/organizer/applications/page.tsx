import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { StatusBadge } from "@/components/apply/status-badge";
import { DeadlineChip } from "@/components/deadline-chip";
import { FlagIcon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { ReviewRing } from "@/components/organizer/review-ring";
import { OrganizerEmpty } from "@/components/organizer/organizer-empty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import {
  computeFraudFlags,
  fraudFlagTooltip,
  mergeFraudFlagRows,
  type FraudFlagKind,
} from "@/lib/fraud-flags";
import { isCalibrationComplete } from "@/lib/organizer-ops";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/types";

type Row = {
  id: string;
  applicant_id: string;
  type: ApplicationTypeKey;
  status: ApplicationStatus;
  submitted_at: string | null;
  form_data: Record<string, unknown> | null;
  applicant: { full_name: string | null; email: string } | null;
};

// Same semantic mapping as StatusBadge — a colored left-edge accent per
// row so status is scannable without reading the pill text.
const STATUS_BORDER_CLASS: Record<ApplicationStatus, string> = {
  draft: "border-l-ink-soft/40",
  submitted: "border-l-sky",
  under_review: "border-l-amber",
  accepted: "border-l-mint",
  waitlisted: "border-l-amber",
  rejected: "border-l-brick",
};

function calibrationCopy(mine: number, overall: number): string | null {
  const delta = mine - overall;
  if (!Number.isFinite(delta) || Math.abs(delta) < 0.15) {
    return "Your scores track closely with the overall reviewer average.";
  }
  const abs = Math.abs(delta).toFixed(1);
  if (delta < 0) {
    return `You tend to score ~${abs} pts below average.`;
  }
  return `You tend to score ~${abs} pts above average.`;
}

export default async function OrganizerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    status?: string;
    q?: string;
    assigned_to_me?: string;
    flagged?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const isReviewer =
    profile?.role === "reviewer" || profile?.role === "organizer";
  const isOrganizer = profile?.role === "organizer";
  const mineOnly = params.assigned_to_me === "true" && !!user;
  const flaggedOnly = params.flagged === "true";

  let needsCalibration = false;
  if (user && isReviewer && mineOnly) {
    const [{ count: sampleCount }, { count: attemptCount }] = await Promise.all([
      supabase
        .from("calibration_samples")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("calibration_attempts")
        .select("id", { count: "exact", head: true })
        .eq("reviewer_id", user.id),
    ]);
    needsCalibration = !isCalibrationComplete(
      sampleCount ?? 0,
      attemptCount ?? 0
    );
  }

  let assignedAppIds: string[] | null = null;
  if (mineOnly && user) {
    const { data: myAssignments } = await supabase
      .from("review_assignments")
      .select("application_id")
      .eq("reviewer_id", user.id);
    assignedAppIds = (myAssignments ?? []).map((a) => a.application_id);
  }

  let query = supabase
    .from("applications")
    .select(
      "id, applicant_id, type, status, submitted_at, form_data, applicant:profiles!applications_applicant_id_fkey!inner(full_name, email)"
    )
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (params.type) {
    query = query.eq("type", params.type);
  }
  if (params.status) {
    query = query.eq("status", params.status);
  }
  if (params.q) {
    query = query.or(
      `full_name.ilike.%${params.q}%,email.ilike.%${params.q}%`,
      { foreignTable: "applicant" }
    );
  }
  if (mineOnly) {
    if (!assignedAppIds || assignedAppIds.length === 0) {
      query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      query = query.in("id", assignedAppIds);
    }
  }

  const { data, error } = await query.returns<Row[]>();
  let applications = data ?? [];

  // Fraud flags — prefer SQL view; fall back to in-process computation.
  let flagMap = new Map<string, FraudFlagKind[]>();
  if (isOrganizer) {
    const { data: flagRows, error: flagError } = await supabase
      .from("application_fraud_flags")
      .select("application_id, flag_kind")
      .returns<{ application_id: string; flag_kind: string }[]>();

    if (!flagError && flagRows) {
      flagMap = mergeFraudFlagRows(flagRows);
    } else {
      // Broad fetch for cross-applicant comparison when view missing.
      const { data: allForFlags } = await supabase
        .from("applications")
        .select(
          "id, applicant_id, form_data, applicant:profiles!applications_applicant_id_fkey(full_name)"
        )
        .returns<
          {
            id: string;
            applicant_id: string;
            form_data: Record<string, unknown> | null;
            applicant: { full_name: string | null } | null;
          }[]
        >();
      flagMap = computeFraudFlags(allForFlags ?? []);
    }

    if (flaggedOnly) {
      applications = applications.filter((a) => flagMap.has(a.id));
    }
  }

  const hackerIds = applications
    .filter((a) => a.type === "hacker")
    .map((a) => a.id);

  const [{ data: assignments }, { data: reviews }] =
    hackerIds.length > 0
      ? await Promise.all([
          supabase
            .from("review_assignments")
            .select("application_id")
            .in("application_id", hackerIds),
          supabase
            .from("reviews")
            .select("application_id")
            .in("application_id", hackerIds),
        ])
      : [
          { data: [] as { application_id: string }[] },
          { data: [] as { application_id: string }[] },
        ];

  const assignedCount = new Map<string, number>();
  for (const row of assignments ?? []) {
    assignedCount.set(
      row.application_id,
      (assignedCount.get(row.application_id) ?? 0) + 1
    );
  }
  const completedCount = new Map<string, number>();
  for (const row of reviews ?? []) {
    completedCount.set(
      row.application_id,
      (completedCount.get(row.application_id) ?? 0) + 1
    );
  }

  let calibrationNote: string | null = null;
  if (user && isReviewer && mineOnly) {
    const [{ data: myScores }, { data: allScores }] = await Promise.all([
      supabase
        .from("reviews")
        .select("raw_total")
        .eq("reviewer_id", user.id),
      supabase.from("reviews").select("raw_total"),
    ]);

    const mine = (myScores ?? [])
      .map((r) => Number(r.raw_total))
      .filter((n) => Number.isFinite(n));
    const all = (allScores ?? [])
      .map((r) => Number(r.raw_total))
      .filter((n) => Number.isFinite(n));

    if (mine.length >= 2 && all.length >= 3) {
      const avg = (xs: number[]) =>
        xs.reduce((a, b) => a + b, 0) / xs.length;
      calibrationNote = calibrationCopy(avg(mine), avg(all));
    }
  }

  const filtersActive =
    params.type ||
    params.status ||
    params.q ||
    params.assigned_to_me ||
    params.flagged;

  function clearHref() {
    if (mineOnly) return "/organizer/applications?assigned_to_me=true";
    return "/organizer/applications";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-h2 font-semibold text-ink">
          {mineOnly ? "My queue" : "Applications"}
        </h1>
        {isReviewer && (
          <Link
            href={
              mineOnly
                ? "/organizer/applications"
                : "/organizer/applications?assigned_to_me=true"
            }
            className="text-sm text-sky underline-offset-2 hover:underline"
          >
            {mineOnly ? "View all applications" : "View my queue"}
          </Link>
        )}
      </div>

      {error && (
        <p className="rounded-chip bg-brick/10 px-3 py-2 text-sm text-brick">
          {error.message}
        </p>
      )}

      {needsCalibration && (
        <p className="rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
          Complete calibration first —{" "}
          <Link
            href="/organizer/calibration"
            className="font-medium underline underline-offset-2"
          >
            grade the three gold samples
          </Link>{" "}
          before reviewing your queue.
        </p>
      )}

      {calibrationNote && (
        <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
          <span className="font-medium text-ink">Calibration note — </span>
          {calibrationNote}{" "}
          <span className="text-ink-soft">
            (private; based on your raw totals vs. all reviewers.)
          </span>
        </p>
      )}

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
      >
        {mineOnly && (
          <input type="hidden" name="assigned_to_me" value="true" />
        )}
        <label className="flex flex-col gap-1 text-2xs text-ink-soft">
          Type
          <SelectNative name="type" defaultValue={params.type ?? ""}>
            <option value="">All</option>
            {Object.keys(APPLICATION_TYPES).map((type) => (
              <option key={type} value={type}>
                {APPLICATION_TYPES[type as ApplicationTypeKey].label}
              </option>
            ))}
          </SelectNative>
        </label>
        <label className="flex flex-col gap-1 text-2xs text-ink-soft">
          Status
          <SelectNative name="status" defaultValue={params.status ?? ""}>
            <option value="">All</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectNative>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-2xs text-ink-soft">
          Search name or email
          <Input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="e.g. ada@berkeley.edu"
          />
        </label>
        {isOrganizer && (
          <label className="flex items-center gap-2 pb-2 text-2xs text-ink-soft">
            <input
              type="checkbox"
              name="flagged"
              value="true"
              defaultChecked={flaggedOnly}
              className="accent-amber"
            />
            Flagged only
          </label>
        )}
        <Button type="submit">Filter</Button>
        {filtersActive && (
          <Link href={clearHref()} className="text-sm text-sunset underline">
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper">
            <tr>
              <th className="px-4 py-2.5 text-2xs font-medium text-ink-soft">
                Applicant
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-ink-soft">
                Type
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-ink-soft">
                Status
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-ink-soft">
                Submitted
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-ink-soft">
                Reviews
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <OrganizerEmpty
                    title={
                      flaggedOnly
                        ? "No flagged applications"
                        : mineOnly
                          ? "Nothing in your queue yet"
                          : "No applications match these filters"
                    }
                    body={
                      flaggedOnly
                        ? "Duplicate names or identical free-text answers will show up here."
                        : mineOnly
                          ? "Ask an organizer to assign a batch from Reviewers."
                          : "Try clearing filters, or wait for new submissions."
                    }
                  />
                </td>
              </tr>
            )}
            {applications.map((app) => {
              const flags = flagMap.get(app.id);
              const name =
                app.applicant?.full_name || app.applicant?.email || "?";
              return (
                <tr
                  key={app.id}
                  className={`border-t border-line border-l-4 hover:bg-paper ${STATUS_BORDER_CLASS[app.status]}`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {flags && flags.length > 0 && (
                        <span
                          title={fraudFlagTooltip(flags)}
                          className="inline-flex shrink-0 text-amber"
                          aria-label={fraudFlagTooltip(flags)}
                        >
                          <FlagIcon className="size-4" />
                        </span>
                      )}
                      <Avatar id={app.applicant_id} name={name} />
                      <div>
                        <Link
                          href={`/organizer/applications/${app.id}`}
                          className="font-medium text-ink underline-offset-2 hover:underline"
                        >
                          {name}
                        </Link>
                        <div className="text-2xs text-ink-soft">
                          {app.applicant?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink">
                    {APPLICATION_TYPES[app.type].label}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {app.submitted_at ? (
                      <DeadlineChip
                        date={new Date(app.submitted_at).toLocaleDateString(
                          "en-US",
                          { month: "numeric", day: "numeric" }
                        )}
                        label="Submitted"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {app.type === "hacker" ? (
                      <ReviewRing
                        done={completedCount.get(app.id) ?? 0}
                        total={assignedCount.get(app.id) ?? 0}
                      />
                    ) : (
                      <span className="text-ink-soft">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
