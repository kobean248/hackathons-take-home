import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shell/app-shell";

// Applicant portal shell — AppNav only. Organizer keeps its own layout.
export default async function AppLayout({
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

  return <AppShell>{children}</AppShell>;
}
