"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types";

const DECISION_STATUSES: ApplicationStatus[] = [
  "accepted",
  "waitlisted",
  "rejected",
];

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "organizer" && profile?.role !== "reviewer") {
    throw new Error("Not authorized.");
  }

  return { supabase, user, role: profile.role as "organizer" | "reviewer" };
}

export async function decideApplication(
  applicationId: string,
  status: ApplicationStatus
) {
  if (!DECISION_STATUSES.includes(status)) {
    throw new Error("Invalid decision status");
  }

  const { supabase, user } = await requireStaff();

  const { error } = await supabase
    .from("applications")
    .update({
      status,
      decided_at: new Date().toISOString(),
      decided_by: user.id,
    })
    .eq("id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  const { error: historyError } = await supabase
    .from("application_status_history")
    .insert({
      application_id: applicationId,
      status,
      changed_by: user.id,
    });

  if (historyError) {
    throw new Error(historyError.message);
  }

  revalidatePath(`/organizer/applications/${applicationId}`);
  revalidatePath("/organizer/applications");
  revalidatePath("/organizer/analytics");
}

/** Bulk accept / waitlist / reject — organizers only. */
export async function decideApplicationsBulk(
  applicationIds: string[],
  status: ApplicationStatus
): Promise<{ updated: number }> {
  if (!DECISION_STATUSES.includes(status)) {
    throw new Error("Invalid decision status");
  }
  const ids = [...new Set(applicationIds.filter(Boolean))];
  if (ids.length === 0) {
    throw new Error("No applications selected.");
  }

  const { supabase, user, role } = await requireStaff();
  if (role !== "organizer") {
    throw new Error("Only organizers can bulk-decide.");
  }

  const now = new Date().toISOString();
  const { error, count } = await supabase
    .from("applications")
    .update(
      {
        status,
        decided_at: now,
        decided_by: user.id,
      },
      { count: "exact" }
    )
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  const { error: historyError } = await supabase
    .from("application_status_history")
    .insert(
      ids.map((application_id) => ({
        application_id,
        status,
        changed_by: user.id,
        note: "bulk_decision",
      }))
    );

  if (historyError) {
    throw new Error(historyError.message);
  }

  revalidatePath("/organizer/applications");
  revalidatePath("/organizer/analytics");
  return { updated: count ?? ids.length };
}

export async function submitReview(
  applicationId: string,
  scores: { technical: number; creativity: number; impact: number },
  comments: string
) {
  const { supabase, user } = await requireStaff();

  const { data: assignment } = await supabase
    .from("review_assignments")
    .select("recused_at")
    .eq("application_id", applicationId)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  if (assignment?.recused_at) {
    throw new Error("You recused from this application — scoring is disabled.");
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      application_id: applicationId,
      reviewer_id: user.id,
      scores,
      comments,
    },
    { onConflict: "application_id,reviewer_id" }
  );

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("review_assignments")
    .update({ completed_at: new Date().toISOString() })
    .eq("application_id", applicationId)
    .eq("reviewer_id", user.id)
    .is("completed_at", null)
    .is("recused_at", null);

  revalidatePath(`/organizer/applications/${applicationId}`);
  revalidatePath("/organizer/reviewers");
  revalidatePath("/organizer/applications");
}

/** "I know this person" — pull from queue and exclude score from averages. */
export async function recuseFromApplication(
  applicationId: string,
  note?: string
) {
  const { supabase, user } = await requireStaff();

  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("review_assignments")
    .select("id, recused_at")
    .eq("application_id", applicationId)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  if (existing?.recused_at) {
    return;
  }

  if (existing) {
    const { error } = await supabase
      .from("review_assignments")
      .update({
        recused_at: now,
        recusal_note: note?.trim() || "I know this person",
        completed_at: now,
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("review_assignments").insert({
      application_id: applicationId,
      reviewer_id: user.id,
      recused_at: now,
      recusal_note: note?.trim() || "I know this person",
      completed_at: now,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath(`/organizer/applications/${applicationId}`);
  revalidatePath("/organizer/applications");
  revalidatePath("/organizer/reviewers");
  revalidatePath("/organizer/analytics");
}
