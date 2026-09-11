import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { StatusBadge } from "@/components/apply/status-badge";
import { DeadlineChip } from "@/components/deadline-chip";
import { FlagIcon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { ReviewRing } from "@/components/organizer/review-ring";
import { OrganizerEmpty } from "@/components/organizer/organizer-empty";
import {
  ApplicationsBulkToolbar,
  RowCheckbox,
} from "@/components/organizer/applications-bulk-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import {
  computeFraudFlags,
  fraudFlagTooltip,
  mergeFraudFlagRows,
  type FraudFlagKind,
} from "@/lib/fraud-flags";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/types";
import { PortalHero } from "@/components/shell/portal-hero";
import { SceneReviewInbox } from "@/components/illustrations/berkeley-scenes";
import { CountUp } from "@/components/count-up";

type Row = {
  id: string;
  applicant_id: string;
  type: ApplicationTypeKey;
  status: ApplicationStatus;
  submitted_at: string | null;
  form_data: Record<string, unknown> | null;
  applicant: { full_name: string | null; email: string } | null;
};

const STATUS_BORDER_CLASS: Record<ApplicationStatus, string> = {
  draft: "border-l-ink-soft/40",
  submitted: "border-l-sky",
  under_review: "border-l-amber",
  accepted: "border-l-mint",
  waitlisted: "border-l-amber",
  rejected: "border-l-brick",
};

export default async function OrganizerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    status?: string;
    q?: string;
    assigned_to_me?: string;
    flagged?: string;
    tiebreaker?: string;
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
  const tiebreakerOnly = params.tiebreaker === "true";

  let assignedAppIds: string[] | null = null;
  if (mineOnly && user) {
    const { data: myAssignments } = await supabase
      .from("review_assignments")
      .select("application_id")
      .eq("reviewer_id", user.id)
      .is("recused_at", null);
    assignedAppIds = (myAssignments ?? []).map((a) => a.application_id);
  }

  let tiebreakerIds: string[] | null = null;
  let spreadByApp = new Map<string, number>();
  if (tiebreakerOnly || isOrganizer) {
    const { data: disagrees } = await supabase
      .from("application_score_disagreement")
      .select("application_id, z_spread")
      .returns<{ application_id: string; z_spread: number }[]>();
    for (const row of disagrees ?? []) {
      spreadByApp.set(row.application_id, Number(row.z_spread));
    }
    if (tiebreakerOnly) {
      tiebreakerIds = [...spreadByApp.keys()];
    }
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
  if (tiebreakerOnly) {
    if (!tiebreakerIds || tiebreakerIds.length === 0) {
      query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      query = query.in("id", tiebreakerIds);
    }
  }

  const { data, error } = await query.returns<Row[]>();
  let applications = data ?? [];

  let flagMap = new Map<string, FraudFlagKind[]>();
  if (isOrganizer) {
    const { data: flagRows, error: flagError } = await supabase
      .from("application_fraud_flags")
      .select("application_id, flag_kind")
      .returns<{ application_id: string; flag_kind: string }[]>();

    if (!flagError && flagRows) {
      flagMap = mergeFraudFlagRows(flagRows);
    } else {
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
            .select("application_id, recused_at")
            .in("application_id", hackerIds)
            .is("recused_at", null),
          supabase
            .from("normalized_reviews")
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

  // Capacity map for bulk-accept warnings
  const capacityByType: Partial<
    Record<ApplicationTypeKey, { accepted: number; target: number }>
  > = {};
  if (isOrganizer) {
    const types = Object.keys(APPLICATION_TYPES) as ApplicationTypeKey[];
    const [{ data: targets }, counts] = await Promise.all([
      supabase.from("capacity_targets").select("type, target"),
      Promise.all(
        types.map(async (t) => {
          const { count } = await supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .eq("type", t)
            .eq("status", "accepted");
          return [t, count ?? 0] as const;
        })
      ),
    ]);
    const acceptedMap = Object.fromEntries(counts) as Record<
      ApplicationTypeKey,
      number
    >;
    for (const row of targets ?? []) {
      const t = row.type as ApplicationTypeKey;
      capacityByType[t] = {
        accepted: acceptedMap[t] ?? 0,
        target: row.target,
      };
    }
  }

  const filtersActive =
    params.type ||
    params.status ||
    params.q ||
    params.assigned_to_me ||
    params.flagged ||
    params.tiebreaker;

  function clearHref() {
    if (mineOnly) return "/organizer/applications?assigned_to_me=true";
    if (tiebreakerOnly) return "/organizer/applications?tiebreaker=true";
    return "/organizer/applications";
  }

  const exportParams = new URLSearchParams();
  if (params.type) exportParams.set("type", params.type);
  if (params.status) exportParams.set("status", params.status);
  if (params.q) exportParams.set("q", params.q);
  if (mineOnly) exportParams.set("assigned_to_me", "true");
  if (flaggedOnly) exportParams.set("flagged", "true");
  if (tiebreakerOnly) exportParams.set("tiebreaker", "true");
  const exportHref = `/organizer/applications/export?${exportParams.toString()}`;

  const heroTitle = tiebreakerOnly
    ? "Needs a tiebreaker"
    : mineOnly
      ? "My queue"
      : "Applications";
  const heroDescription = tiebreakerOnly
    ? "Reviewers disagree sharply (z-score spread > 1.5). Grab a third read before deciding."
    : mineOnly
      ? "Assigned hacker applications waiting on your rubric scores."
      : "Filter, flag, bulk-decide, and export across every track.";

  return (
    <div className="flex flex-col gap-6">
      <PortalHero
        eyebrow="Organizer"
        title={heroTitle}
        description={heroDescription}
        scene={<SceneReviewInbox className="h-full w-full" />}
      >
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <p className="font-hero text-h3 font-bold tabular-nums text-ink">
            <CountUp value={applications.length} />
            <span className="ml-2 text-sm font-medium text-ink-soft">
              shown
            </span>
          </p>
          {isReviewer && !tiebreakerOnly && (
            <Link
              href={
                mineOnly
                  ? "/organizer/applications"
                  : "/organizer/applications?assigned_to_me=true"
              }
              className="text-sm font-medium text-sky underline-offset-2 hover:underline"
            >
              {mineOnly ? "View all applications" : "View my queue"}
            </Link>
          )}
          {isOrganizer && (
            <Link
              href={
                tiebreakerOnly
                  ? "/organizer/applications"
                  : "/organizer/applications?tiebreaker=true"
              }
              className="text-sm font-medium text-amber underline-offset-2 hover:underline"
            >
              {tiebreakerOnly ? "Leave tiebreaker view" : "Needs a tiebreaker"}
            </Link>
          )}
        </div>
      </PortalHero>

      {error && (
        <p className="rounded-chip bg-brick/10 px-3 py-2 text-sm text-brick">
          {error.message}
        </p>
      )}

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
      >
        {mineOnly && (
          <input type="hidden" name="assigned_to_me" value="true" />
        )}
        {tiebreakerOnly && (
          <input type="hidden" name="tiebreaker" value="true" />
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

      <ApplicationsBulkToolbar
        rows={applications.map((a) => ({
          id: a.id,
          type: a.type,
          status: a.status,
        }))}
        capacityByType={capacityByType}
        exportHref={exportHref}
        enableBulk={isOrganizer}
      >
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper">
              <tr>
                {isOrganizer && (
                  <th className="w-10 px-3 py-2.5" aria-label="Select" />
                )}
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
                {tiebreakerOnly && (
                  <th className="px-4 py-2.5 text-2xs font-medium text-ink-soft">
                    Z spread
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 && (
                <tr>
                  <td colSpan={isOrganizer ? (tiebreakerOnly ? 7 : 6) : 5}>
                    <OrganizerEmpty
                      title={
                        tiebreakerOnly
                          ? "No high-variance applications"
                          : flaggedOnly
                            ? "No flagged applications"
                            : mineOnly
                              ? "Nothing in your queue yet"
                              : "No applications match these filters"
                      }
                      body={
                        tiebreakerOnly
                          ? "Apps appear here when two+ eligible reviews disagree by more than 1.5 z."
                          : flaggedOnly
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
                const spread = spreadByApp.get(app.id);
                return (
                  <tr
                    key={app.id}
                    className={`border-t border-line border-l-4 hover:bg-paper ${STATUS_BORDER_CLASS[app.status]}`}
                  >
                    {isOrganizer && (
                      <td className="px-3 py-2.5">
                        <RowCheckbox id={app.id} />
                      </td>
                    )}
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
                        {spread != null && !tiebreakerOnly && (
                          <span
                            title={`Reviewer z-spread ${spread}`}
                            className="inline-flex shrink-0 rounded-chip bg-amber/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-amber"
                          >
                            tie
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
                    {tiebreakerOnly && (
                      <td className="px-4 py-2.5 font-display font-semibold tabular-nums text-amber">
                        {spread != null ? spread.toFixed(2) : "—"}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ApplicationsBulkToolbar>
    </div>
  );
}
