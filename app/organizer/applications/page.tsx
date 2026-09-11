import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { StatusBadge } from "@/components/apply/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/types";

type Row = {
  id: string;
  type: ApplicationTypeKey;
  status: ApplicationStatus;
  submitted_at: string | null;
  applicant: { full_name: string | null; email: string } | null;
};

export default async function OrganizerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(
      "id, type, status, submitted_at, applicant:profiles!applications_applicant_id_fkey!inner(full_name, email)"
    )
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (params.type) {
    query = query.eq("type", params.type);
  }
  if (params.status) {
    query = query.eq("status", params.status);
  }
  if (params.q) {
    query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%`, {
      foreignTable: "applicant",
    });
  }

  const { data, error } = await query.returns<Row[]>();
  const applications = data ?? [];

  // Review coverage (assigned vs completed) only matters for hacker apps.
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
      : [{ data: [] as { application_id: string }[] }, { data: [] as { application_id: string }[] }];

  const assignedCount = new Map<string, number>();
  for (const row of assignments ?? []) {
    assignedCount.set(row.application_id, (assignedCount.get(row.application_id) ?? 0) + 1);
  }
  const completedCount = new Map<string, number>();
  for (const row of reviews ?? []) {
    completedCount.set(row.application_id, (completedCount.get(row.application_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-h2 font-semibold">Applications</h1>

      {error && (
        <p className="rounded-chip bg-brick/10 px-3 py-2 text-sm text-brick">
          {error.message}
        </p>
      )}

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4"
      >
        <label className="flex flex-col gap-1 text-2xs text-muted-foreground">
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
        <label className="flex flex-col gap-1 text-2xs text-muted-foreground">
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
        <label className="flex flex-1 flex-col gap-1 text-2xs text-muted-foreground">
          Search name or email
          <Input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="e.g. ada@berkeley.edu"
          />
        </label>
        <Button type="submit">Filter</Button>
        {(params.type || params.status || params.q) && (
          <Link
            href="/organizer/applications"
            className="text-sm text-sunset underline"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.02]">
            <tr>
              <th className="px-4 py-2.5 text-2xs font-medium text-muted-foreground">
                Applicant
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-muted-foreground">
                Submitted
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-muted-foreground">
                Reviews
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No applications match these filters.
                </td>
              </tr>
            )}
            {applications.map((app) => (
              <tr
                key={app.id}
                className="border-t border-border hover:bg-black/[.02]"
              >
                <td className="px-4 py-2.5">
                  <Link
                    href={`/organizer/applications/${app.id}`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {app.applicant?.full_name || app.applicant?.email || "—"}
                  </Link>
                  <div className="text-2xs text-muted-foreground">
                    {app.applicant?.email}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  {APPLICATION_TYPES[app.type].label}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {app.submitted_at
                    ? new Date(app.submitted_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {app.type === "hacker"
                    ? `${completedCount.get(app.id) ?? 0} / ${assignedCount.get(app.id) ?? 0}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
