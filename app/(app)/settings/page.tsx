import { createClient } from "@/lib/supabase/server";
import {
  ProfileForm,
  ResumeUploadForm,
} from "@/components/settings/settings-forms";
import { BearReading } from "@/components/illustrations";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: hackerApp }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, school, github_url")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("resume_path")
      .eq("applicant_id", user!.id)
      .eq("type", "hacker")
      .maybeSingle(),
  ]);

  return (
    <main className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8">
        <BearReading className="pointer-events-none absolute -right-2 top-2 w-24 opacity-90 sm:right-4 sm:w-28" />
        <div className="relative z-10 max-w-lg">
          <p className="text-2xs font-medium text-ink-soft">Settings</p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink">
            Your profile
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Name and basics used across the portal. Role changes are
            organizer-only.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-h3 font-semibold text-ink">
          Account
        </h2>
        <div className="mt-4">
          <ProfileForm
            email={user!.email ?? ""}
            fullName={profile?.full_name ?? ""}
            school={(profile as { school?: string | null } | null)?.school ?? ""}
            githubUrl={
              (profile as { github_url?: string | null } | null)?.github_url ??
              ""
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-h3 font-semibold text-ink">Resume</h2>
        <div className="mt-4">
          <ResumeUploadForm hasResume={Boolean(hackerApp?.resume_path)} />
        </div>
      </section>
    </main>
  );
}
