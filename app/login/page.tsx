"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setError("root", { message: error.message });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    let next = "/dashboard";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role === "organizer" || profile?.role === "reviewer") {
        next = "/organizer/applications";
      }
    }

    router.push(next);
    router.refresh();
  }

  return (
    <AuthSplitLayout tagline="Sign in to apply, track your status, or — if you're an organizer — review applications.">
      <h2 className="font-display text-h2 font-semibold text-foreground">
        Log in
      </h2>

      {errors.root && (
        <p className="mt-4 rounded-chip bg-brick/10 px-3 py-2 text-sm text-brick">
          {errors.root.message}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5 text-sm text-foreground">
          Email
          <Input type="email" autoComplete="email" {...register("email")} />
          {errors.email && (
            <span className="text-xs text-brick">{errors.email.message}</span>
          )}
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-foreground">
          Password
          <Input
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-brick">
              {errors.password.message}
            </span>
          )}
        </label>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-2xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton next="/dashboard" />

      <p className="mt-6 text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="font-medium text-sunset underline">
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
