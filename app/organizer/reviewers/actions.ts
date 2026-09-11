"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Round-robins unassigned, submitted, hacker-type applications across
// active (role='reviewer') reviewers. "Unassigned" means the application
// has zero review_assignments rows yet — this assigns each qualifying app
// to exactly one reviewer per run, which is what spreads a batch evenly
// (see dev_plan.md §7). Skips a reviewer who is themself the applicant.
//
// At real scale (the plan's own "50,000 applications" note) fetching every
// existing assignment up front to build `assignedSet` wouldn't hold up —
// that'd want a NOT EXISTS / anti-join done in SQL instead of in JS.
export async function assignNextBatch(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const count = Math.max(1, Number(formData.get("count")) || 10);

  const { data: reviewers } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "reviewer")
    .order("id");

  if (!reviewers || reviewers.length === 0) {
    redirect(
      "/organizer/reviewers?error=" +
        encodeURIComponent("No reviewers to assign to.")
    );
  }

  const { data: existingAssignments } = await supabase
    .from("review_assignments")
    .select("application_id");
  const assignedIds = new Set(
    (existingAssignments ?? []).map((row) => row.application_id)
  );

  const { data: candidates } = await supabase
    .from("applications")
    .select("id, applicant_id")
    .eq("type", "hacker")
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true });

  const unassigned = (candidates ?? [])
    .filter((c) => !assignedIds.has(c.id))
    .slice(0, count);

  const rows: { application_id: string; reviewer_id: string }[] = [];
  let reviewerIndex = 0;

  for (const app of unassigned) {
    let attempts = 0;
    let reviewer = reviewers[reviewerIndex % reviewers.length];
    while (reviewer.id === app.applicant_id && attempts < reviewers.length) {
      reviewerIndex++;
      reviewer = reviewers[reviewerIndex % reviewers.length];
      attempts++;
    }
    if (attempts >= reviewers.length) {
      // every reviewer is this app's own applicant — nobody eligible, skip
      continue;
    }
    rows.push({ application_id: app.id, reviewer_id: reviewer.id });
    reviewerIndex++;
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("review_assignments").insert(rows);
    if (error) {
      redirect(
        "/organizer/reviewers?error=" + encodeURIComponent(error.message)
      );
    }
  }

  revalidatePath("/organizer/reviewers");
  revalidatePath("/organizer/applications");
  redirect(`/organizer/reviewers?assigned=${rows.length}`);
}
