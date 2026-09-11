import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/organizer/applications", label: "Applications" },
  { href: "/organizer/reviewers", label: "Reviewers" },
  { href: "/organizer/analytics", label: "Analytics" },
];

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
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-6">
      <nav className="flex gap-4 border-b border-black/[.08] pb-3 text-sm dark:border-white/[.145]">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="font-medium text-zinc-600 hover:text-foreground dark:text-zinc-400"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
