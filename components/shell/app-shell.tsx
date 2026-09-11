import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/shell/app-nav";
import type { AppRole } from "@/types";

// Persistent shell for signed-in applicant work (dashboard + apply).
// Fetches the profile once so every child page gets the same nav + avatar.
export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";
  let fullName: string | null = null;
  let role: AppRole | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    fullName = profile?.full_name ?? null;
    role = (profile?.role as AppRole | null) ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <AppNav email={email} fullName={fullName} role={role} />
      <div className="mx-auto w-full max-w-[960px] flex-1 px-6 py-8">
        {children}
      </div>
    </div>
  );
}
