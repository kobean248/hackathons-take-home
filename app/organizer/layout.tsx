import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrganizerNav } from "@/components/organizer/organizer-nav";

// Shared by every /organizer/* page (applications list, detail, reviewers,
// analytics). proxy.ts already redirects unauthenticated/wrong-role
// requests before they get here, but — same rule as /apply/layout.tsx —
// Server Components re-check rather than trust the proxy alone.
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
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "organizer" && profile?.role !== "reviewer") {
    redirect(
      "/dashboard?error=" +
        encodeURIComponent("You don't have access to the organizer area.")
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <OrganizerNav />
      <div className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</div>
    </div>
  );
}
