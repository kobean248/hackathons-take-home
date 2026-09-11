import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessShifts,
  fetchEventRoles,
  shiftRolesFor,
} from "@/lib/event-roles";
import {
  ShiftCalendar,
  type ShiftSlotView,
} from "@/components/shifts/shift-calendar";
import { PortalHero } from "@/components/shell/portal-hero";
import { SceneReviewInbox } from "@/components/illustrations/berkeley-scenes";
import { APPLICATION_TYPES } from "@/lib/applicationTypes";
import { OrganizerEmpty } from "@/components/organizer/organizer-empty";

export default async function ShiftsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const roles = await fetchEventRoles(supabase, user.id);
  if (!canAccessShifts(roles)) {
    redirect(
      "/dashboard?error=" +
        encodeURIComponent(
          "Shifts unlock after you're accepted as a mentor, volunteer, or judge."
        )
    );
  }

  const eligible = shiftRolesFor(roles);

  const { data: slots } = await supabase
    .from("shift_slots")
    .select("id, role, title, starts_at, ends_at, capacity")
    .in("role", eligible)
    .order("starts_at", { ascending: true });

  const slotIds = (slots ?? []).map((s) => s.id);
  const [{ data: counts }, { data: mine }] =
    slotIds.length > 0
      ? await Promise.all([
          supabase.from("shift_signups").select("slot_id").in("slot_id", slotIds),
          supabase
            .from("shift_signups")
            .select("slot_id")
            .eq("user_id", user.id)
            .in("slot_id", slotIds),
        ])
      : [
          { data: [] as { slot_id: string }[] },
          { data: [] as { slot_id: string }[] },
        ];

  const filled = new Map<string, number>();
  for (const row of counts ?? []) {
    filled.set(row.slot_id, (filled.get(row.slot_id) ?? 0) + 1);
  }
  const mineSet = new Set((mine ?? []).map((m) => m.slot_id));

  const views: ShiftSlotView[] = (slots ?? []).map((s) => ({
    id: s.id,
    role: s.role,
    title: s.title,
    starts_at: s.starts_at,
    ends_at: s.ends_at,
    capacity: s.capacity,
    filled: filled.get(s.id) ?? 0,
    mine: mineSet.has(s.id),
  }));

  const roleLabels = eligible
    .map((r) => APPLICATION_TYPES[r]?.label ?? r)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <PortalHero
        title="Shifts"
        description={`Pick your weekend blocks as ${roleLabels}. Claim what you can cover.`}
        scene={<SceneReviewInbox className="h-full w-full" />}
      />

      {views.length === 0 ? (
        <OrganizerEmpty
          title="No shifts posted yet"
          body="Organizers will publish mentor, volunteer, and judge blocks here."
        />
      ) : (
        <ShiftCalendar slots={views} eligibleRoles={eligible} />
      )}
    </div>
  );
}
