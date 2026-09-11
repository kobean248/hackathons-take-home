import Link from "next/link";
import { homePathForRole } from "@/lib/home-path";
import type { AppRole } from "@/types";

/** Persistent strip so signed-in users can browse marketing without being force-redirected. */
export function PortalBanner({ role }: { role?: AppRole | null }) {
  const href = homePathForRole(role);
  const isStaff = role === "organizer" || role === "reviewer";
  const label = isStaff ? "Go to console" : "Go to dashboard";

  return (
    <div className="border-b border-navy-600 bg-navy-800 px-6 py-2 text-center text-2xs text-white/80">
      <span className="text-white/55">Signed in. </span>
      <Link href={href} className="font-medium text-sunset hover:underline">
        {label} →
      </Link>
    </div>
  );
}
