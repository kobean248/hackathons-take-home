import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { assignNextBatch } from "./actions";

type ReviewerRow = { id: string; full_name: string | null; email: string };

export default async function ReviewersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; assigned?: string }>;
}) {
  const { error, assigned } = await searchParams;
  const supabase = await createClient();

  const { data: reviewers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "reviewer")
    .order("full_name")
    .returns<ReviewerRow[]>();

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Reviewers</h1>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {assigned && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          Assigned {assigned} application(s).
        </p>
      )}

      <form
        action={assignNextBatch}
        className="flex items-end gap-3 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]"
      >
        <label className="flex flex-col gap-1 text-xs">
          Batch size
          <input
            type="number"
            name="count"
            defaultValue={10}
            min={1}
            className="w-24 rounded border border-black/[.08] px-2 py-1.5 text-sm dark:border-white/[.145] dark:bg-transparent"
          />
        </label>
        <Button type="submit">Assign next batch</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-black/[.08] dark:border-white/[.145]">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.02] dark:bg-white/[.03]">
            <tr>
              <th className="px-4 py-2 font-medium">Reviewer</th>
              <th className="px-4 py-2 font-medium">Open</th>
              <th className="px-4 py-2 font-medium">Completed</th>
            </tr>
          </thead>
          <tbody>
            {(reviewers ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  No reviewers yet — promote a profile&apos;s role to
                  &apos;reviewer&apos; via the SQL editor.
                </td>
              </tr>
            )}
            {(reviewers ?? []).map((r) => (
              <tr
                key={r.id}
                className="border-t border-black/[.08] dark:border-white/[.145]"
              >
                <td className="px-4 py-2">
                  <div className="font-medium">{r.full_name || r.email}</div>
                  <div className="text-xs text-zinc-500">{r.email}</div>
                </td>
                <td className="px-4 py-2">{openCount.get(r.id) ?? 0}</td>
                <td className="px-4 py-2">{completedCount.get(r.id) ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
