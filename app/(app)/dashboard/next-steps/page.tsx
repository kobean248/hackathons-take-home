import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES } from "@/lib/applicationTypes";
import { AcceptanceNextSteps } from "@/components/dashboard/acceptance-next-steps";
import { BearCelebrating } from "@/components/illustrations";
import type { ApplicationRow } from "@/types";

export default async function NextStepsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: applications } = await supabase
    .from("applications")
    .select("id, type, status, submitted_at, decided_at")
    .eq("applicant_id", user.id)
    .eq("status", "accepted")
    .returns<ApplicationRow[]>();

  const accepted = applications ?? [];

  return (
    <main className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8">
        <BearCelebrating className="pointer-events-none absolute -right-2 top-2 w-24 opacity-90 sm:right-4 sm:w-28" />
        <div className="relative z-10 max-w-lg">
          <p className="text-2xs font-medium text-ink-soft">
            <Link href="/dashboard" className="text-sky hover:underline">
              Overview
            </Link>
            {" / "}
            Next steps
          </p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink">
            After acceptance
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Travel, Discord, what to bring, and check-in — in one place.
          </p>
        </div>
      </section>

      {accepted.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-6 text-sm text-ink-soft">
          No accepted applications yet. Once you&apos;re in, next steps show up
          here.
        </p>
      ) : (
        accepted.map((app) => (
          <AcceptanceNextSteps
            key={app.id}
            typeLabel={APPLICATION_TYPES[app.type].label}
            type={app.type}
          />
        ))
      )}
    </main>
  );
}
