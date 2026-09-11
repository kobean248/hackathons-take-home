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

// Not restricted to mentor/volunteer in the prompt's literal sense — hacker
// applications need a way to actually get decided too (the plan's own
// analytics prompt talks about organizers deciding off the normalized
// score), and no other prompt adds a hacker-specific decision path, so this
// one action covers all three types.
export async function decideApplication(
  applicationId: string,
  status: ApplicationStatus
) {
  if (!DECISION_STATUSES.includes(status)) {
    throw new Error("Invalid decision status");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

export async function submitReview(
  applicationId: string,
  scores: { technical: number; creativity: number; impact: number },
  comments: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Upsert on (application_id, reviewer_id): first submission inserts,
  // resubmitting from the same reviewer edits in place.
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

  // Marks the reviewer's own assignment complete so /organizer/reviewers'
  // open/completed counts mean something. A no-op if this reviewer wasn't
  // formally assigned (e.g. an organizer grading directly) — the update
  // just matches zero rows.
  await supabase
    .from("review_assignments")
    .update({ completed_at: new Date().toISOString() })
    .eq("application_id", applicationId)
    .eq("reviewer_id", user.id)
    .is("completed_at", null);

  revalidatePath(`/organizer/applications/${applicationId}`);
  revalidatePath("/organizer/reviewers");
}
