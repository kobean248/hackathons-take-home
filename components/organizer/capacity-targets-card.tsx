"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { updateCapacityTargets } from "@/app/organizer/analytics/actions";
import { capacityProgressLabel } from "@/lib/organizer-ops";
import { RingProgress } from "@/components/viz/ring-progress";
import { useToast } from "@/components/shell/toast-provider";

type TargetState = {
  type: ApplicationTypeKey;
  target: number;
  accepted: number;
};

export function CapacityTargetsCard({ targets }: { targets: TargetState[] }) {
  const [isPending, startTransition] = useTransition();
  const { push } = useToast();

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6">
      <div>
        <h2 className="font-display text-sm font-semibold text-ink">
          Acceptance capacity
        </h2>
        <p className="mt-1 max-w-prose text-2xs text-ink-soft">
          Set headcount targets per application type. Accept actions warn when
          you would exceed the target.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {targets.map((row) => {
          const label = APPLICATION_TYPES[row.type]?.label ?? row.type;
          const over = row.target > 0 && row.accepted > row.target;
          return (
            <div
              key={row.type}
              className="flex items-center gap-3 rounded-chip border border-line bg-paper/60 px-3 py-2.5"
            >
              <RingProgress
                value={row.accepted}
                max={Math.max(row.target, 1)}
                size={36}
                fillClassName={
                  over
                    ? "stroke-[var(--color-brick)]"
                    : "stroke-[var(--color-mint)]"
                }
                label={capacityProgressLabel(label, row.accepted, row.target)}
              />
            </div>
          );
        })}
      </div>

      <form
        action={(fd) => {
          startTransition(async () => {
            try {
              await updateCapacityTargets(fd);
              push("success", "Capacity targets saved.");
            } catch (err) {
              push(
                "error",
                err instanceof Error ? err.message : "Could not save targets."
              );
            }
          });
        }}
        className="flex flex-wrap items-end gap-3 border-t border-line pt-4"
      >
        {targets.map((row) => (
          <label
            key={row.type}
            className="flex flex-col gap-1 text-2xs text-ink-soft"
          >
            {APPLICATION_TYPES[row.type]?.label ?? row.type} target
            <Input
              type="number"
              name={`target_${row.type}`}
              min={0}
              defaultValue={row.target}
              className="w-24"
            />
          </label>
        ))}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save targets"}
        </Button>
      </form>
    </section>
  );
}
