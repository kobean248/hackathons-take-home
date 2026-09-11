"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { recuseFromApplication } from "@/app/organizer/applications/actions";
import { useToast } from "@/components/shell/toast-provider";

/** Conflict-of-interest control — pulls the app from this reviewer's queue. */
export function RecusalButton({
  applicationId,
  alreadyRecused,
}: {
  applicationId: string;
  alreadyRecused: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(alreadyRecused);
  const { push } = useToast();

  if (done) {
    return (
      <p className="rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
        You recused from this application (conflict of interest). It&apos;s
        off your queue and your score is excluded from averages.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">Conflict of interest?</p>
        <p className="text-2xs text-ink-soft">
          Flag &quot;I know this person&quot; to leave the queue and exclude
          your score from ranking averages.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              await recuseFromApplication(applicationId);
              setDone(true);
              push("success", "Recused — removed from your queue.");
            } catch (err) {
              push(
                "error",
                err instanceof Error ? err.message : "Could not recuse."
              );
            }
          });
        }}
      >
        {isPending ? "Saving…" : "I know this person"}
      </Button>
    </div>
  );
}
