"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/app/organizer/applications/actions";
import { useToast } from "@/components/shell/toast-provider";

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
  const { push } = useToast();

  const total = scores.technical + scores.creativity + scores.impact;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await submitReview(applicationId, scores, comments);
        setSaved(true);
        push("success", `Review saved — ${total}/30.`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        push("error", message);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xs font-medium text-muted-foreground">
          {existing ? "Your review (editing)" : "Grade this application"}
        </h2>
        <div className="flex items-center gap-2 rounded-chip bg-paper px-3 py-1.5">
          <span className="text-2xs font-medium text-ink-soft">Total</span>
          <span className="font-display text-h3 font-bold tabular-nums text-sunset">
            {total}
            <span className="text-2xs font-medium text-ink-soft">/30</span>
          </span>
        </div>
      </div>

      {RUBRIC.map(({ key, label }) => (
        <label key={key} className="flex flex-col gap-2 text-sm">
          <span className="flex items-center justify-between">
            {label}
            <span className="inline-flex min-w-9 items-center justify-center rounded-chip bg-sunset/12 px-2 py-0.5 font-display text-sm font-bold tabular-nums text-sunset">
              {scores[key]}
            </span>
          </span>
          <span className="relative flex h-5 items-center">
            <span className="pointer-events-none absolute inset-x-0 h-1.5 rounded-chip bg-line" />
            <span
              className="pointer-events-none absolute left-0 h-1.5 rounded-chip bg-sunset"
              style={{ width: `${((scores[key] - 1) / 9) * 100}%` }}
            />
            <input
              type="range"
              min={1}
              max={10}
              value={scores[key]}
              onChange={(e) =>
                setScores((s) => ({ ...s, [key]: Number(e.target.value) }))
              }
              className="rubric-slider relative w-full"
            />
          </span>
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
