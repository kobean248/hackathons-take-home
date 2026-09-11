import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the link Supabase emails for signup confirmation / magic link /
// password recovery. It exchanges the token_hash in the URL for a session.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      redirect(next);
    }

    console.error("verifyOtp failed:", error.message);
    redirect(
      `/auth/auth-code-error?reason=${encodeURIComponent(error.message)}`
    );
  }

  // Missing token_hash/type entirely — almost always means the email
  // template is still using {{ .ConfirmationURL }} instead of a custom
  // link (see README setup step 5), so this request never had them.
  redirect(
    "/auth/auth-code-error?reason=" +
      encodeURIComponent("No token_hash/type on the confirmation link.")
  );
}
