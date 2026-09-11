"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessShifts,
  fetchEventRoles,
  shiftRolesFor,
} from "@/lib/event-roles";

async function requireShiftAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const roles = await fetchEventRoles(supabase, user.id);
  if (!canAccessShifts(roles)) {
    throw new Error(
      "Shifts unlock after you're accepted as a mentor, volunteer, or judge."
    );
  }

  return { supabase, user, roles: shiftRolesFor(roles) };
}

export async function claimShift(slotId: string) {
  const { supabase, user, roles } = await requireShiftAccess();

  const { data: slot } = await supabase
    .from("shift_slots")
    .select("id, role, capacity")
    .eq("id", slotId)
    .maybeSingle();

  if (!slot) throw new Error("Shift not found.");
  if (!roles.includes(slot.role)) {
    throw new Error(`That shift is for ${slot.role}s — you don't have that role.`);
  }

  const { count } = await supabase
    .from("shift_signups")
    .select("id", { count: "exact", head: true })
    .eq("slot_id", slotId);

  if ((count ?? 0) >= slot.capacity) {
    throw new Error("This shift is full.");
  }

  const { error } = await supabase.from("shift_signups").insert({
    slot_id: slotId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("You're already signed up for this shift.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/shifts");
}

export async function leaveShift(slotId: string) {
  const { supabase, user } = await requireShiftAccess();

  const { error } = await supabase
    .from("shift_signups")
    .delete()
    .eq("slot_id", slotId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/shifts");
}
