"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TeamActionState = {
  ok?: boolean;
  error?: string;
  joinCode?: string;
};

export async function createTeamAction(
  _prev: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  const looking = formData.get("looking") === "on";

  if (name.length < 2) {
    return { error: "Team name needs at least 2 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_team", {
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
  return { ok: true, joinCode };
}

export async function joinTeamAction(
  _prev: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const code = String(formData.get("join_code") ?? "")
    .trim()
    .toUpperCase();

  if (!/^[A-Z0-9]{6}$/.test(code)) {
    return { error: "Join codes are 6 letters/numbers." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("join_team_by_code", { p_code: code });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/teams");
  return { ok: true };
}

export async function leaveTeamAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("team_members").delete().eq("user_id", user.id);

  revalidatePath("/teams");
}

export async function upsertListingAction(
  _prev: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const headline = String(formData.get("headline") ?? "").trim();
  const skills = String(formData.get("skills") ?? "").trim();

  if (headline.length < 2) {
    return { error: "Add a short headline." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("teammate_listings").upsert(
    {
      user_id: user.id,
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("teammate_listings").delete().eq("user_id", user.id);

  revalidatePath("/teams");
}
