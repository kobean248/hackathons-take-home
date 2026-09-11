import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/shell/public-nav";
import { PortalBanner } from "@/components/shell/portal-banner";
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
    <div className="flex min-h-screen flex-col bg-navy-950 text-white">
      {user ? <PortalBanner role={role} /> : null}
      <PublicNav signedIn={Boolean(user)} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
