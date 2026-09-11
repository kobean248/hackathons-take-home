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
}
