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

  const { error } = await supabase
    .from("applications")
    .update({ resume_path: path })
    .eq("applicant_id", user.id)
    .eq("type", "hacker");

  if (error) {
    // Resume file is stored; linking to an application may fail if none exists yet.
    return {
      ok: true,
      error: undefined,
    };
  }

  revalidatePath("/settings");
  revalidatePath("/apply");
  return { ok: true };
}
