import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import {
  assignNextBatch,
  demoteReviewer,
  promoteToReviewer,
} from "./actions";

type ProfileRow = { id: string; full_name: string | null; email: string };

export default async function ReviewersPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    assigned?: string;
    promoted?: string;
    demoted?: string;
    q?: string;
  }>;
}) {
  const { error, assigned, promoted, demoted, q } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  const isOrganizer = me?.role === "organizer";

  const { data: reviewers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "reviewer")
    .order("full_name")
    .returns<ProfileRow[]>();

  const reviewerIds = (reviewers ?? []).map((r) => r.id);

  const { data: assignments } =
    reviewerIds.length > 0
      ? await supabase
          .from("review_assignments")
          .select("reviewer_id, completed_at")
          .in("reviewer_id", reviewerIds)
      : { data: [] as { reviewer_id: string; completed_at: string | null }[] };

  const openCount = new Map<string, number>();
  const completedCount = new Map<string, number>();
  for (const row of assignments ?? []) {
    const map = row.completed_at ? completedCount : openCount;
    map.set(row.reviewer_id, (map.get(row.reviewer_id) ?? 0) + 1);
  }

  const search = q?.trim() ?? "";
  let applicants: ProfileRow[] = [];
  if (isOrganizer && search.length >= 2) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "applicant")
      .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      .order("full_name")
      .limit(20)
      .returns<ProfileRow[]>();
    applicants = data ?? [];
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-h2 font-semibold">Reviewers</h1>

      {error && (
        <p className="rounded-chip bg-brick/10 px-3 py-2 text-sm text-brick">
          {error}
        </p>
      )}
      {assigned && (
        <p className="rounded-chip bg-mint/10 px-3 py-2 text-sm text-mint">
          Assigned {assigned} application(s).
        </p>
      )}
      {promoted === "already" && (
        <p className="rounded-chip bg-sky/10 px-3 py-2 text-sm text-sky">
          That user is already a reviewer.
        </p>
      )}
      {promoted && promoted !== "already" && (
        <p className="rounded-chip bg-mint/10 px-3 py-2 text-sm text-mint">
          Elevated {decodeURIComponent(promoted)} to reviewer.
        </p>
      )}
      {demoted && (
        <p className="rounded-chip bg-mint/10 px-3 py-2 text-sm text-mint">
          Demoted back to applicant.
        </p>
      )}

      {isOrganizer && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div>
            <h2 className="text-sm font-medium text-ink">
              Elevate to reviewer
            </h2>
            <p className="text-2xs text-muted-foreground">
              Search applicants by name or email, then promote them so they
              can receive queue assignments.
            </p>
          </div>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-2xs text-muted-foreground">
              Search users
              <Input
                name="q"
                defaultValue={search}
                placeholder="Name or email"
                className="w-64"
              />
            </label>
            <Button type="submit" size="sm" variant="outline">
              Search
            </Button>
          </form>

          {search.length >= 2 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/[.02]">
                  <tr>
                    <th className="px-4 py-2 text-2xs font-medium text-muted-foreground">
                      Applicant
                    </th>
                    <th className="px-4 py-2 text-2xs font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-4 text-center text-muted-foreground"
                      >
                        No applicants match “{search}”.
                      </td>
                    </tr>
                  )}
                  {applicants.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="px-4 py-2.5">
                        <div className="font-medium">
                          {a.full_name || a.email}
                        </div>
                        <div className="text-2xs text-muted-foreground">
                          {a.email}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <form action={promoteToReviewer}>
                          <input type="hidden" name="profile_id" value={a.id} />
                          <Button type="submit" size="sm">
                            Make reviewer
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <form
        action={assignNextBatch}
        className="flex items-end gap-3 rounded-xl border border-border bg-card p-4"
      >
        <label className="flex flex-col gap-1 text-2xs text-muted-foreground">
          Batch size
          <Input
            type="number"
            name="count"
            defaultValue={10}
            min={1}
            className="w-24"
          />
        </label>
        <Button type="submit">Assign next batch</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.02]">
            <tr>
              <th className="px-4 py-2.5 text-2xs font-medium text-muted-foreground">
                Reviewer
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-muted-foreground">
                Open
              </th>
              <th className="px-4 py-2.5 text-2xs font-medium text-muted-foreground">
                Completed
              </th>
              {isOrganizer && (
                <th className="px-4 py-2.5 text-2xs font-medium text-muted-foreground">
                  Role
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {(reviewers ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={isOrganizer ? 4 : 3}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No reviewers yet
                  {isOrganizer
                    ? " — search above to elevate an applicant."
                    : "."}
                </td>
              </tr>
            )}
            {(reviewers ?? []).map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{r.full_name || r.email}</div>
                  <div className="text-2xs text-muted-foreground">
                    {r.email}
                  </div>
                </td>
                <td className="px-4 py-2.5">{openCount.get(r.id) ?? 0}</td>
                <td className="px-4 py-2.5">
                  {completedCount.get(r.id) ?? 0}
                </td>
                {isOrganizer && (
                  <td className="px-4 py-2.5">
                    <form action={demoteReviewer}>
                      <input type="hidden" name="profile_id" value={r.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Demote
                      </Button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
