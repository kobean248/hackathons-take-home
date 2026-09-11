"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// login/signup moved to client components (app/login, app/signup) so they
// can use react-hook-form + zod for inline validation, per the auth-flows
// prompt. logout has no form state to manage, so a server action is still
// the simplest way to clear the session cookie and redirect.
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
