"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RubricScores } from "@/lib/organizer-ops";

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 5;
  return Math.min(10, Math.max(1, Math.round(n)));
}

export async function submitCalibrationAttempt(
  sampleId: string,
  scores: RubricScores
) {
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

  if (profile?.role !== "reviewer" && profile?.role !== "organizer") {
    throw new Error("Only reviewers can submit calibration grades.");
  }

  const cleaned: RubricScores = {
    technical: clampScore(scores.technical),
    creativity: clampScore(scores.creativity),
    impact: clampScore(scores.impact),
  };

  const { error } = await supabase.from("calibration_attempts").upsert(
    {
      reviewer_id: user.id,
      sample_id: sampleId,
      scores: cleaned,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "reviewer_id,sample_id" }
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/organizer/calibration");
  revalidatePath(`/organizer/calibration/${sampleId}`);
  revalidatePath("/organizer/applications");
}
