"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateProfileAction,
  uploadResumeAction,
  type SettingsState,
} from "@/app/(app)/settings/actions";

const initial: SettingsState = {};

export function ProfileForm({
  fullName,
  school,
  githubUrl,
  email,
}: {
  fullName: string;
  school: string;
  githubUrl: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <div>
        <label htmlFor="email" className="text-2xs font-medium text-ink-soft">
          Email
        </label>
        <Input id="email" value={email} disabled className="mt-1" />
      </div>
      <div>
        <label
          htmlFor="full_name"
          className="text-2xs font-medium text-ink-soft"
        >
          Full name
        </label>
        <Input
          id="full_name"
          name="full_name"
          required
          defaultValue={fullName}
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="school" className="text-2xs font-medium text-ink-soft">
          School
        </label>
        <Input
          id="school"
          name="school"
          defaultValue={school}
          placeholder="UC Berkeley"
          className="mt-1"
        />
      </div>
      <div>
        <label
          htmlFor="github_url"
          className="text-2xs font-medium text-ink-soft"
        >
          GitHub URL
        </label>
        <Input
          id="github_url"
          name="github_url"
          type="url"
          defaultValue={githubUrl}
          placeholder="https://github.com/you"
          className="mt-1"
        />
      </div>
      {state.error && (
        <p className="rounded-chip bg-brick/10 px-3 py-2 text-sm text-brick">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-chip bg-mint/10 px-3 py-2 text-sm text-mint">
          Profile saved.
        </p>
      )}
      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function ResumeUploadForm({ hasResume }: { hasResume: boolean }) {
  const [state, action, pending] = useActionState(uploadResumeAction, initial);

  return (
    <form action={action} className="flex max-w-md flex-col gap-3">
      <p className="text-sm text-ink-soft">
        {hasResume
          ? "A resume is already on file. Upload again to replace it."
          : "Upload a PDF resume (used for hacker applications)."}
      </p>
      <Input
        id="resume"
        name="resume"
        type="file"
        accept="application/pdf"
        required
      />
      {state.error && (
        <p className="text-sm text-brick">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-mint">Resume uploaded.</p>
      )}
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "Uploading…" : "Upload resume"}
      </Button>
    </form>
  );
}
