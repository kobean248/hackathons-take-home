"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Path } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  APPLICATION_TYPES,
  buildFieldSchema,
  type ApplicationTypeKey,
} from "@/lib/applicationTypes";

export function ApplicationForm({ type }: { type: ApplicationTypeKey }) {
  const config = APPLICATION_TYPES[type];
  const schema = buildFieldSchema(config.fields);
  type FormValues = z.infer<typeof schema>;

  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // File objects can't live in react-hook-form's (zod-validated) state or in
  // the form_data jsonb column, so selected files are tracked separately,
  // keyed by field name, and uploaded to Storage in persist().
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const fieldErrors = errors as Record<string, { message?: string } | undefined>;

  async function persist(values: FormValues, status: "draft" | "submitted") {
    setFormError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFormError("You must be signed in.");
      return;
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
        setFormError(uploadError.message);
        return;
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
      return;
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
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  // Save draft intentionally skips required-field validation — a draft is
  // allowed to be incomplete. getValues() reads whatever's in the form as-is.
  async function onSaveDraft() {
    await persist(getValues(), "draft");
  }

  const onSubmitForm = handleSubmit((values) => persist(values, "submitted"));

  return (
    <form onSubmit={onSubmitForm} noValidate className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{config.label} Application</h2>

      {formError && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {formError}
        </p>
      )}

      {config.fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1 text-sm">
          {field.label}

          {field.type === "textarea" ? (
            <textarea
              rows={4}
              className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-transparent"
              {...register(field.name as Path<FormValues>)}
            />
          ) : field.type === "file" ? (
            <>
              <input
                type="file"
                accept="application/pdf"
                className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-transparent"
                onChange={(e) =>
                  setFiles((prev) => ({
                    ...prev,
                    [field.name]: e.target.files?.[0] ?? null,
                  }))
                }
              />
              {files[field.name] && (
                <span className="text-xs text-zinc-500">
                  Selected: {files[field.name]!.name}
                </span>
              )}
            </>
          ) : (
            <input
              type={field.type === "number" ? "number" : "text"}
              className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-transparent"
              {...register(field.name as Path<FormValues>, {
                valueAsNumber: field.type === "number",
              })}
            />
          )}

          {fieldErrors[field.name]?.message && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {fieldErrors[field.name]?.message}
            </span>
          )}
        </label>
      ))}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting || uploading}
          onClick={onSaveDraft}
        >
          {uploading ? "Uploading…" : "Save draft"}
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {uploading ? "Uploading…" : isSubmitting ? "Submitting…" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
