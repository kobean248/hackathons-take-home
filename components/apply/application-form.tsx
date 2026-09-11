"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Path } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [savedAt, setSavedAt] = useState<Date | null>(null);
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
        setFormError(uploadError.message);
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
  // Stays on the page and shows a flat mint "autosave" dot rather than
  // navigating away, per design-doc.md §7.
  async function onSaveDraft() {
    const ok = await persist(getValues(), "draft");
    if (ok) setSavedAt(new Date());
  }

  const onSubmitForm = handleSubmit(async (values) => {
    const ok = await persist(values, "submitted");
    if (ok) {
      router.push("/dashboard");
      router.refresh();
    }
  });

  return (
    <form onSubmit={onSubmitForm} noValidate className="flex flex-col gap-4">
      <h2 className="font-display text-h2 font-semibold">
        {config.label} Application
      </h2>

      {formError && (
        <p className="rounded-chip bg-brick/10 px-3 py-2 text-sm text-brick">
          {formError}
        </p>
      )}

      {config.fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1.5 text-sm">
          {field.label}

          {field.type === "textarea" ? (
            <Textarea rows={4} {...register(field.name as Path<FormValues>)} />
          ) : field.type === "file" ? (
            <>
              <Input
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
                <span className="text-2xs text-muted-foreground">
                  Selected: {files[field.name]!.name}
                </span>
              )}
            </>
          ) : (
            <Input
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
        </label>
      ))}

      <div className="flex items-center gap-3">
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
