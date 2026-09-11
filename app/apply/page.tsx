import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";

const TYPES = Object.keys(APPLICATION_TYPES) as ApplicationTypeKey[];

export default async function ApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // app/apply/layout.tsx already redirects unauthenticated visitors, but
  // Server Components shouldn't lean on that alone (same rule as dashboard).
  if (!user) {
    redirect("/login");
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("type, status")
    .eq("applicant_id", user.id);

  const statusByType = new Map(
    (applications ?? []).map((a) => [a.type, a.status])
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Apply</h1>
      <div className="flex flex-col gap-4">
        {TYPES.map((type) => {
          const config = APPLICATION_TYPES[type];
          const status = statusByType.get(type);

          return (
            <Link
              key={type}
              href={`/apply/${type}`}
              className="rounded-xl border border-black/[.08] p-4 transition-colors hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-white/[.03]"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{config.label}</span>
                {status ? (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {status}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500">Not started</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
