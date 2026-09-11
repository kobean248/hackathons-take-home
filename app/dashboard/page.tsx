import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES } from "@/lib/applicationTypes";
import { StatusBadge } from "@/components/apply/status-badge";
import { StatusTimeline } from "@/components/apply/status-timeline";
import type { ApplicationRow, ApplicationStatusHistoryRow } from "@/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  // proxy.ts already redirects unauthenticated requests to /login, but
  // Server Components should never trust that alone — always re-check here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("id, type, status, submitted_at, decided_at")
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: true })
    .returns<ApplicationRow[]>();

  const apps = applications ?? [];
  const appIds = apps.map((a) => a.id);

  const { data: historyRows } =
    appIds.length > 0
      ? await supabase
          .from("application_status_history")
          .select("id, application_id, status, changed_at, note")
          .in("application_id", appIds)
          .order("changed_at", { ascending: true })
          .returns<ApplicationStatusHistoryRow[]>()
      : { data: [] as ApplicationStatusHistoryRow[] };

  const historyByApp = new Map<string, ApplicationStatusHistoryRow[]>();
  for (const row of historyRows ?? []) {
    const list = historyByApp.get(row.application_id) ?? [];
    list.push(row);
    historyByApp.set(row.application_id, list);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <form>
          <button
            formAction={logout}
            className="rounded-full border border-black/[.08] px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Log out
          </button>
        </form>
      </div>

      {error && (
        <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {error}
        </p>
      )}

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Signed in as {user.email}
      </p>

      {apps.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-black/[.08] p-6 dark:border-white/[.145]">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You haven&apos;t started an application yet.
          </p>
          <Link
            href="/apply"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Start an application
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col gap-3 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {APPLICATION_TYPES[app.type].label}
                </span>
                <StatusBadge status={app.status} />
              </div>
              <StatusTimeline history={historyByApp.get(app.id) ?? []} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
