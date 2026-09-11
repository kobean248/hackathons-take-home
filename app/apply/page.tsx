import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { StatusBadge } from "@/components/apply/status-badge";
import type { ApplicationStatus } from "@/types";

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
    .eq("applicant_id", user.id)
    .returns<{ type: ApplicationTypeKey; status: ApplicationStatus }[]>();

  const statusByType = new Map(
    (applications ?? []).map((a) => [a.type, a.status])
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-h2 font-semibold">Apply</h1>
      <div className="flex flex-col gap-4">
        {TYPES.map((type) => {
          const config = APPLICATION_TYPES[type];
          const status = statusByType.get(type);

          return (
            <Link
              key={type}
              href={`/apply/${type}`}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-black/[.02]"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{config.label}</span>
                {status ? (
                  <StatusBadge status={status} />
                ) : (
                  <span className="text-2xs text-muted-foreground">
                    Not started
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
