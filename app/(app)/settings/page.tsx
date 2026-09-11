import { createClient } from "@/lib/supabase/server";
import {
  ProfileForm,
  ResumeUploadForm,
} from "@/components/settings/settings-forms";
import { BearReading } from "@/components/illustrations";
import { PortalHero } from "@/components/shell/portal-hero";
import { SceneProfileLocker } from "@/components/illustrations/berkeley-scenes";

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
      <PortalHero
        eyebrow="Settings"
        title="Your profile"
        description="Name and basics used across the portal. Role changes are organizer-only."
        scene={<SceneProfileLocker className="h-full w-full" />}
        seal={
          <BearReading className="pointer-events-none absolute right-4 top-3 z-[1] w-20 opacity-90 sm:right-6 sm:w-24 md:hidden" />
        }
      />

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
