import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// proxy.ts only gates /dashboard and /organizer/*, so /apply/* checks auth
// here once instead of every page under it repeating the same check.
export default async function ApplyLayout({
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

  return <div className="mx-auto min-h-screen max-w-lg p-6">{children}</div>;
}
