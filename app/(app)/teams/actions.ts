"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessTeams, fetchEventRoles } from "@/lib/event-roles";

export type TeamActionState = {
  ok?: boolean;
  error?: string;
  joinCode?: string;
};

async function requireHacker() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." as const, supabase, user: null };
  const roles = await fetchEventRoles(supabase, user.id);
  if (!canAccessTeams(roles)) {
    return {
      error: "Teams unlock after you're accepted as a hacker." as const,
      supabase,
      user,
    };
  }
  return { error: null, supabase, user };
}

export async function createTeamAction(
  _prev: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const gate = await requireHacker();
  if (gate.error || !gate.user) return { error: gate.error ?? "Not signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  const looking = formData.get("looking") === "on";

  if (name.length < 2) {
    return { error: "Team name needs at least 2 characters." };
  }

  const { data, error } = await gate.supabase.rpc("create_team", {
    p_name: name,
    p_pitch: pitch,
    p_looking: looking,
  });

  if (error) {
    return { error: error.message };
  }

  const joinCode =
    data && typeof data === "object" && "join_code" in data
      ? String((data as { join_code: string }).join_code)
      : undefined;

  revalidatePath("/teams");
  revalidatePath("/dashboard");
  return { ok: true, joinCode };
}

export async function joinTeamAction(
  _prev: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const gate = await requireHacker();
  if (gate.error || !gate.user) return { error: gate.error ?? "Not signed in." };

  const code = String(formData.get("join_code") ?? "")
    .trim()
    .toUpperCase();

  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return { error: "Join codes are 6 letters/numbers." };
  }

  const { error } = await gate.supabase.rpc("join_team_by_code", {
    p_code: code,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/teams");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function leaveTeamAction(): Promise<void> {
  const gate = await requireHacker();
  if (gate.error || !gate.user) return;

  await gate.supabase
    .from("team_members")
    .delete()
    .eq("user_id", gate.user.id);

  revalidatePath("/teams");
  revalidatePath("/dashboard");
}

export async function upsertListingAction(
  _prev: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const gate = await requireHacker();
  if (gate.error || !gate.user) return { error: gate.error ?? "Not signed in." };

  const headline = String(formData.get("headline") ?? "").trim();
  const skills = String(formData.get("skills") ?? "").trim();

  if (headline.length < 2) {
    return { error: "Add a short headline." };
  }

  const { error } = await gate.supabase.from("teammate_listings").upsert(
    {
      user_id: gate.user.id,
      headline,
      skills,
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/teams");
  return { ok: true };
}

export async function removeListingAction(): Promise<void> {
  const gate = await requireHacker();
  if (gate.error || !gate.user) return;

  await gate.supabase
    .from("teammate_listings")
    .delete()
    .eq("user_id", gate.user.id);

  revalidatePath("/teams");
}

