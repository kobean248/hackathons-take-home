import type { ApplicationTypeKey } from "@/lib/applicationTypes";
import type { createClient } from "@/lib/supabase/server";

export type EventRole = ApplicationTypeKey;

export const SHIFT_ROLES: EventRole[] = ["mentor", "volunteer", "judge"];

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Roles granted after acceptance (hacker / mentor / volunteer / judge). */
export async function fetchEventRoles(
  supabase: Supabase,
  userId: string
): Promise<EventRole[]> {
  const { data } = await supabase
    .from("event_roles")
    .select("role")
    .eq("user_id", userId)
    .returns<{ role: EventRole }[]>();
  return (data ?? []).map((r) => r.role);
}

export function canAccessTeams(roles: EventRole[]): boolean {
  return roles.includes("hacker");
}

export function canAccessShifts(roles: EventRole[]): boolean {
  return roles.some((r) => SHIFT_ROLES.includes(r));
}

export function shiftRolesFor(roles: EventRole[]): EventRole[] {
  return roles.filter((r) => SHIFT_ROLES.includes(r));
}

/** Grant or revoke event role when an application decision lands. */
export async function syncEventRoleOnDecision(
  supabase: Supabase,
  opts: {
    applicantId: string;
    applicationId: string;
    type: EventRole;
    status: string;
    grantedBy: string;
  }
) {
  if (opts.status === "accepted") {
    const { error } = await supabase.from("event_roles").upsert(
      {
        user_id: opts.applicantId,
        role: opts.type,
        application_id: opts.applicationId,
        granted_by: opts.grantedBy,
        granted_at: new Date().toISOString(),
      },
      { onConflict: "user_id,role" }
    );
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from("event_roles")
    .delete()
    .eq("user_id", opts.applicantId)
    .eq("role", opts.type);
  if (error) throw new Error(error.message);
}
