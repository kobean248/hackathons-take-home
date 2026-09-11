"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/auth/google-button";
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
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We sent a confirmation link — click it to finish creating your
          account.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-xl font-semibold">Sign up</h1>

      {errors.root && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {errors.root.message}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            autoComplete="email"
            className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-transparent"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {errors.email.message}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            autoComplete="new-password"
            className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-transparent"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {errors.password.message}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Confirm password
          <input
            type="password"
            autoComplete="new-password"
            className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-transparent"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing up…" : "Sign up"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
        or
        <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
      </div>

      <GoogleButton next="/dashboard" />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
