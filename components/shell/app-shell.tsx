import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/shell/app-nav";
import { AnimatedPage } from "@/components/motion/animated-page";
import { PortalSideDecor } from "@/components/shell/portal-side-decor";
import type { AppRole } from "@/types";

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
    <div className="relative flex min-h-screen flex-col bg-paper/90">
      <AppNav email={email} fullName={fullName} role={role} />
      <div className="relative flex-1">
        <PortalSideDecor />
        <div className="relative z-10 mx-auto w-full max-w-[960px] px-6 py-8">
          <AnimatedPage>{children}</AnimatedPage>
        </div>
      </div>
    </div>
  );
}
