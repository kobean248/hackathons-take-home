"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { submitCalibrationAttempt } from "@/app/organizer/calibration/actions";
import {
  RUBRIC_KEYS,
  scoreComparisonCopy,
  type RubricScores,
} from "@/lib/organizer-ops";

const LABELS: Record<keyof RubricScores, string> = {
  technical: "Technical",
  creativity: "Creativity",
  impact: "Impact",
};

export function CalibrationPanel({
  sampleId,
  goldScores,
  goldComments,
  existing,
}: {
  sampleId: string;
  goldScores: RubricScores;
  goldComments: string | null;
  existing: RubricScores | null;
}) {
  const [scores, setScores] = useState<RubricScores>(
    existing ?? { technical: 5, creativity: 5, impact: 5 }
  );
  const [revealed, setRevealed] = useState(!!existing);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await submitCalibrationAttempt(sampleId, scores);
        setRevealed(true);
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
      className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6"
    >
      <h2 className="text-2xs font-medium text-ink-soft">
        {existing && revealed ? "Your calibration (submitted)" : "Grade this sample"}
      </h2>

      {RUBRIC_KEYS.map((key) => (
        <label key={key} className="flex flex-col gap-2 text-sm">
          <span className="flex items-center justify-between text-ink">
            {LABELS[key]}
            <span className="font-display font-semibold tabular-nums text-sunset">
              {scores[key]}/10
            </span>
          </span>
          <input
            type="range"
            min={1}
            max={10}
            value={scores[key]}
            disabled={revealed}
            onChange={(e) =>
              setScores((s) => ({ ...s, [key]: Number(e.target.value) }))
            }
            className="h-1.5 w-full accent-sunset disabled:opacity-60"
          />
        </label>
      ))}

      {error && <p className="text-sm text-brick">{error}</p>}

      {!revealed && (
        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Submitting…" : "Submit calibration"}
        </Button>
      )}

      {revealed && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-4">
          <h3 className="font-display text-sm font-semibold text-ink">
            Compared to gold
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-ink-soft">
            {RUBRIC_KEYS.map((key) => (
              <li key={key}>
                {scoreComparisonCopy(key, scores[key], goldScores[key])}
              </li>
            ))}
          </ul>
          {goldComments && (
            <p className="border-t border-line pt-3 text-2xs text-ink-soft">
              <span className="font-medium text-ink">Gold note — </span>
              {goldComments}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={() => setRevealed(false)}
          >
            Re-grade sample
          </Button>
        </div>
      )}
    </form>
  );
}
