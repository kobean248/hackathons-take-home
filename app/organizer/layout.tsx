import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrganizerNav } from "@/components/organizer/organizer-nav";

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

  return (
    <div className="flex min-h-screen flex-col bg-paper md:flex-row">
      <Suspense
        fallback={
          <div className="h-14 shrink-0 bg-navy-950 md:h-auto md:w-56" />
        }
      >
        <OrganizerNav
          email={user.email ?? ""}
          fullName={profile?.full_name ?? null}
        />
      </Suspense>
      <div className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</div>
    </div>
  );
}
