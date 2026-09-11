"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/app/organizer/applications/actions";

type Scores = { technical: number; creativity: number; impact: number };

const RUBRIC: { key: keyof Scores; label: string }[] = [
  { key: "technical", label: "Technical" },
  { key: "creativity", label: "Creativity" },
  { key: "impact", label: "Impact" },
];

export function GradingPanel({
  applicationId,
  existing,
}: {
  applicationId: string;
  existing: { scores: Scores; comments: string | null } | null;
}) {
  const [scores, setScores] = useState<Scores>(
    existing?.scores ?? { technical: 5, creativity: 5, impact: 5 }
  );
  const [comments, setComments] = useState(existing?.comments ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await submitReview(applicationId, scores, comments);
        setSaved(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]"
    >
      <h2 className="text-sm font-semibold text-zinc-500">
        {existing ? "Your review (editing)" : "Grade this application"}
      </h2>

      {RUBRIC.map(({ key, label }) => (
        <label key={key} className="flex flex-col gap-1 text-sm">
          <span className="flex items-center justify-between">
            {label}
            <span className="text-zinc-500">{scores[key]}/10</span>
          </span>
          <input
            type="range"
            min={1}
            max={10}
            value={scores[key]}
            onChange={(e) =>
              setScores((s) => ({ ...s, [key]: Number(e.target.value) }))
            }
          />
        </label>
      ))}

      <label className="flex flex-col gap-1 text-sm">
        Comments
        <textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-transparent"
        />
      </label>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {saved && !error && (
        <p className="text-sm text-green-700 dark:text-green-400">
          Review saved.
        </p>
      )}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : existing ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
