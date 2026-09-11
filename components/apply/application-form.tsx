"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Path } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeadlineChip } from "@/components/deadline-chip";
import { PlaneMark } from "@/components/illustrations";
import { createClient } from "@/lib/supabase/client";
import {
  APPLICATION_TYPES,
  buildFieldSchema,
  type ApplicationTypeKey,
} from "@/lib/applicationTypes";
import {
  PRIORITY_DEADLINE,
  PRIORITY_DEADLINE_LABEL,
} from "@/lib/deadlines";

export function ApplicationForm({ type }: { type: ApplicationTypeKey }) {
  const config = APPLICATION_TYPES[type];
  const schema = buildFieldSchema(config.fields);
  type FormValues = z.infer<typeof schema>;

  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [submitPhase, setSubmitPhase] = useState<
    "idle" | "flying" | "success"
  >("idle");
  // File objects can't live in react-hook-form's (zod-validated) state or in
  // the form_data jsonb column, so selected files are tracked separately,
  // keyed by field name, and uploaded to Storage in persist().
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const fieldErrors = errors as Record<
    string,
    { message?: string } | undefined
  >;
  const watched = watch();

  // Completeness across configured fields (files counted when selected).
  const progressFields = config.fields;
  const filledCount = progressFields.reduce((n, field) => {
    if (field.type === "file") {
      return n + (files[field.name] ? 1 : 0);
    }
    const v = (watched as Record<string, unknown>)[field.name];
    if (typeof v === "number") return n + (Number.isFinite(v) ? 1 : 0);
    if (typeof v === "string") return n + (v.trim().length > 0 ? 1 : 0);
    return n;
  }, 0);
  const progressPct = Math.round((filledCount / progressFields.length) * 100);

  // Prefill from an existing draft/submitted row so "Continue draft" works.
  useEffect(() => {
    let cancelled = false;
    async function loadExisting() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("applications")
        .select("form_data")
        .eq("applicant_id", user.id)
        .eq("type", type)
        .maybeSingle();
      if (cancelled || !data?.form_data) return;
      reset(data.form_data as FormValues);
    }
    void loadExisting();
    return () => {
      cancelled = true;
    };
  }, [type, reset]);

  // After a successful submit: one restrained plane flight (or instant
  // success when prefers-reduced-motion), then leave for the dashboard.
  useEffect(() => {
    if (submitPhase !== "flying") return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const flyMs = reduced ? 0 : 220;
    const holdMs = reduced ? 0 : 400;

    const t1 = window.setTimeout(() => setSubmitPhase("success"), flyMs);
    const t2 = window.setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, flyMs + holdMs);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [submitPhase, router]);

  async function persist(
    values: FormValues,
    status: "draft" | "submitted"
  ): Promise<boolean> {
    setFormError(null);
    setSavedAt(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFormError("You must be signed in.");
      return false;
    }

    // The only file field today is "resume", which has a dedicated
    // applications.resume_path column (not part of form_data). A future
    // file field would need its own `<name>_path` column the same way.
    let resumePath: string | undefined;
    const resumeFile = files["resume"];
    if (resumeFile) {
      setUploading(true);
      const path = `${user.id}/resume.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, resumeFile, {
          upsert: true,
          contentType: "application/pdf",
        });
      setUploading(false);
      if (uploadError) {
        const missingBucket =
          /bucket not found/i.test(uploadError.message) ||
          uploadError.message.toLowerCase().includes("not found");
        setFormError(
          missingBucket
            ? "Resume storage isn't set up yet (missing `resumes` bucket). Submit without a resume for now, or ask an organizer to run supabase/migrations/0002_resumes_bucket.sql."
            : uploadError.message
        );
        return false;
      }
      resumePath = path;
    }

    const { data: application, error } = await supabase
      .from("applications")
      .upsert(
        {
          applicant_id: user.id,
          type,
          form_data: values,
          status,
          ...(resumePath ? { resume_path: resumePath } : {}),
          ...(status === "submitted"
            ? { submitted_at: new Date().toISOString() }
            : {}),
        },
        { onConflict: "applicant_id,type" }
      )
      .select("id")
      .single();

    if (error) {
      setFormError(error.message);
      return false;
    }

    if (status === "submitted" && application) {
      const { error: historyError } = await supabase
        .from("application_status_history")
        .insert({
          application_id: application.id,
          status: "submitted",
          changed_by: user.id,
        });
      if (historyError) {
        setFormError(historyError.message);
        return false;
      }
    }

    return true;
  }

  // Save draft intentionally skips required-field validation — a draft is
  // allowed to be incomplete. getValues() reads whatever's in the form as-is.
  async function onSaveDraft() {
    const ok = await persist(getValues(), "draft");
    if (ok) setSavedAt(new Date());
  }

  const onSubmitForm = handleSubmit(async (values) => {
    const ok = await persist(values, "submitted");
    if (ok) setSubmitPhase("flying");
  });

  if (submitPhase === "flying" || submitPhase === "success") {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-line bg-surface p-12 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="relative h-12 w-40 overflow-hidden">
          <PlaneMark
            className={`absolute top-1/2 size-8 -translate-y-1/2 ${
              submitPhase === "flying"
                ? "left-0 motion-safe:animate-[plane-fly_220ms_ease_forwards] motion-reduce:left-1/2 motion-reduce:-translate-x-1/2"
                : "left-[calc(100%-2rem)]"
            }`}
          />
        </div>
        <p className="font-display text-h3 font-semibold text-ink">
          {submitPhase === "success"
            ? "Application submitted"
            : "Sending…"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitForm} noValidate className="flex flex-col gap-6">
      <header className="rounded-xl border border-line bg-surface p-6">
        <DeadlineChip date={PRIORITY_DEADLINE_LABEL} label="Deadline" />
        <h1 className="mt-3 font-display text-h1 font-semibold tracking-tight text-ink">
          {config.label} application
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-soft">
          Priority applications are due {PRIORITY_DEADLINE.toLocaleDateString()}{" "}
          — you can save a draft and return anytime before then.
        </p>
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-2xs">
            <span className="font-medium text-ink-soft">
              {filledCount} of {progressFields.length} answered
            </span>
            <span className="font-display font-semibold tabular-nums text-ink">
              {progressPct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-chip bg-paper">
            <div
              className="h-2 rounded-chip bg-sunset"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      {formError && (
        <p className="rounded-chip bg-brick/10 px-3 py-2 text-sm text-brick">
          {formError}
        </p>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-h3 font-semibold text-ink">
          General questions
        </h2>

        {config.fields.map((field) => {
          const required = "required" in field && field.required === true;
          return (
          <div
            key={field.name}
            className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-6"
          >
            <label
              htmlFor={`field-${field.name}`}
              className="text-base font-medium text-ink"
            >
              {field.label}
              {required && (
                <span className="ml-1 text-brick" aria-hidden>
                  *
                </span>
              )}
              {required && (
                <span className="sr-only"> (required)</span>
              )}
            </label>

            {field.type === "textarea" ? (
              <Textarea
                id={`field-${field.name}`}
                rows={4}
                {...register(field.name as Path<FormValues>)}
              />
            ) : field.type === "file" ? (
              <>
                <Input
                  id={`field-${field.name}`}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setFiles((prev) => ({
                      ...prev,
                      [field.name]: e.target.files?.[0] ?? null,
                    }))
                  }
                />
                {files[field.name] && (
                  <span className="text-2xs text-ink-soft">
                    Selected: {files[field.name]!.name}
                  </span>
                )}
              </>
            ) : (
              <Input
                id={`field-${field.name}`}
                type={field.type === "number" ? "number" : "text"}
                {...register(field.name as Path<FormValues>, {
                  valueAsNumber: field.type === "number",
                })}
              />
            )}

            {fieldErrors[field.name]?.message && (
              <span className="text-2xs text-brick">
                {fieldErrors[field.name]?.message}
              </span>
            )}
          </div>
          );
        })}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting || uploading}
          onClick={onSaveDraft}
        >
          {uploading ? "Uploading…" : "Save draft"}
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading} size="lg">
          {uploading
            ? "Uploading…"
            : isSubmitting
              ? "Submitting…"
              : "Submit application"}
        </Button>
        {savedAt && (
          <span className="flex items-center gap-1.5 text-2xs text-mint">
            <span className="size-1.5 rounded-full bg-mint" />
            Saved {savedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    </form>
  );
}
