import Link from "next/link";
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

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <Link
        href="/dashboard"
        className="self-start text-sm text-zinc-500 hover:text-foreground"
      >
        ← Back to dashboard
      </Link>
      {children}
    </div>
  );
}
