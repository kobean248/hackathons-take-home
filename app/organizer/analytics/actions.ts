"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";

export async function updateCapacityTargets(formData: FormData) {
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

  if (profile?.role !== "organizer") {
    throw new Error("Only organizers can edit capacity targets.");
  }

  const types = Object.keys(APPLICATION_TYPES) as ApplicationTypeKey[];
  const now = new Date().toISOString();

  for (const type of types) {
    const raw = formData.get(`target_${type}`);
    if (raw === null || raw === "") continue;
    const target = Number(raw);
    if (!Number.isFinite(target) || target < 0) {
      throw new Error(`Invalid target for ${type}`);
    }

    const { error } = await supabase.from("capacity_targets").upsert(
      {
        type,
        target: Math.round(target),
        updated_at: now,
        updated_by: user.id,
      },
      { onConflict: "type" }
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/organizer/analytics");
  revalidatePath("/organizer/applications");
}
