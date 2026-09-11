import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrganizerNav } from "@/components/organizer/organizer-nav";
import { AnimatedPage } from "@/components/motion/animated-page";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "organizer" && profile?.role !== "reviewer") {
    redirect(
      "/dashboard?error=" +
        encodeURIComponent("You don't have access to the organizer area.")
    );
  }

  const [{ count: totalCount }, { count: queueCount }] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase
      .from("review_assignments")
      .select("id", { count: "exact", head: true })
      .eq("reviewer_id", user.id)
      .is("completed_at", null),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-paper/90 md:flex-row">
      <Suspense
        fallback={
          <div className="h-14 shrink-0 bg-navy-950 md:h-auto md:w-56" />
        }
      >
        <OrganizerNav
          email={user.email ?? ""}
          fullName={profile?.full_name ?? null}
          totalCount={totalCount ?? 0}
          queueCount={queueCount ?? 0}
        />
      </Suspense>
      <div className="mx-auto w-full max-w-5xl flex-1 p-6">
        <AnimatedPage>{children}</AnimatedPage>
      </div>
    </div>
  );
}
