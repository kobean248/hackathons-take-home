"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6"
    >
      <h2 className="text-2xs font-medium text-muted-foreground">
        {existing ? "Your review (editing)" : "Grade this application"}
      </h2>

      {RUBRIC.map(({ key, label }) => (
        <label key={key} className="flex flex-col gap-2 text-sm">
          <span className="flex items-center justify-between">
            {label}
            <span className="font-display font-semibold text-sunset">
              {scores[key]}/10
            </span>
          </span>
          {/* Flat sunset fill up to value via accent-color — no gradient
              track, standard platform rendering. */}
          <input
            type="range"
            min={1}
            max={10}
            value={scores[key]}
            onChange={(e) =>
              setScores((s) => ({ ...s, [key]: Number(e.target.value) }))
            }
            className="h-1.5 w-full accent-sunset"
          />
        </label>
      ))}

      <label className="flex flex-col gap-1.5 text-sm">
        Comments
        <Textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </label>

      {error && <p className="text-sm text-brick">{error}</p>}
      {saved && !error && <p className="text-sm text-mint">Review saved.</p>}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : existing ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
