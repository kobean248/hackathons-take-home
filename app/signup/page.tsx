"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupValues) {
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/confirm?next=/dashboard`,
      },
    });

    if (error) {
      setError("root", { message: error.message });
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <AuthSplitLayout tagline="One quick check and you're in.">
        <h2 className="font-display text-h2 font-semibold text-foreground">
          Check your email
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          We sent a confirmation link — click it to finish creating your
          account.
        </p>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout tagline="Create an account to apply as a Hacker, Mentor, or Volunteer.">
      <h2 className="font-display text-h2 font-semibold text-foreground">
        Sign up
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
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-brick">
              {errors.password.message}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-foreground">
          Confirm password
          <Input
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-brick">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing up…" : "Sign up"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-2xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton next="/dashboard" />

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-sunset underline">
          Log in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
