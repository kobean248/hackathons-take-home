"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = {
  ok?: boolean;
  error?: string;
};

export async function updateProfileAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim();
  const githubUrl = String(formData.get("github_url") ?? "").trim();

  if (!fullName) {
    return { error: "Name is required." };
  }

  if (githubUrl && !/^https?:\/\//i.test(githubUrl)) {
    return { error: "GitHub URL should start with https://" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      school: school || null,
      github_url: githubUrl || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function uploadResumeAction(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a PDF resume." };
  }
  if (file.type !== "application/pdf") {
    return { error: "Resume must be a PDF." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const path = `${user.id}/resume.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(path, file, { upsert: true, contentType: "application/pdf" });

  if (uploadError) {
    return { error: uploadError.message };
  }

  // Find any existing hacker application row first — we need to know
  // whether to update it or create one, and (if it exists) whether its
  // status even allows an update. Applicants can only touch draft/submitted
  // rows (see 0001's RLS), so an update against a decided/under_review row
  // would match zero rows and *look* successful without actually linking
  // the resume anywhere — that's the bug this replaces.
  const { data: existing } = await supabase
    .from("applications")
    .select("id, status")
    .eq("applicant_id", user.id)
    .eq("type", "hacker")
    .maybeSingle();

  if (!existing) {
    // No hacker application yet — start one as a draft so the resume has
    // somewhere to live and is actually visible to organizers, instead of
    // sitting orphaned in Storage with no application row pointing at it.
    const { error } = await supabase.from("applications").insert({
      applicant_id: user.id,
      type: "hacker",
      status: "draft",
      form_data: {},
      resume_path: path,
    });
    if (error) return { error: error.message };
  } else if (existing.status === "draft" || existing.status === "submitted") {
    const { error } = await supabase
      .from("applications")
      .update({ resume_path: path })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    // Application has moved past submitted (under review or decided) —
    // applicants can no longer edit it, so say so plainly instead of
    // reporting success while nothing actually changed.
    return {
      error:
        "Your hacker application has already moved past the stage where you can update your resume. The file was uploaded, but contact an organizer to attach it.",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/apply");
  revalidatePath("/dashboard");
  return { ok: true };
}
