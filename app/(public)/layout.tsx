import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/shell/public-nav";
import { PortalBanner } from "@/components/shell/portal-banner";
import { AnimatedPage } from "@/components/motion/animated-page";
import type { AppRole } from "@/types";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: AppRole | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile?.role as AppRole | null) ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-950/95 text-white">
      {user ? <PortalBanner role={role} /> : null}
      <PublicNav signedIn={Boolean(user)} />
      <div className="relative z-10 flex-1">
        <AnimatedPage stagger={false}>{children}</AnimatedPage>
      </div>
    </div>
  );
}
