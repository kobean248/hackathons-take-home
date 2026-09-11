"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { updateCapacityTargets } from "@/app/organizer/analytics/actions";
import { capacityProgressLabel } from "@/lib/organizer-ops";

type TargetState = {
  type: ApplicationTypeKey;
  target: number;
  accepted: number;
};

export function CapacityTargetsCard({ targets }: { targets: TargetState[] }) {
  const [isPending, startTransition] = useTransition();

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

      <div className="flex flex-col gap-4">
        {targets.map((row) => {
          const label = APPLICATION_TYPES[row.type]?.label ?? row.type;
          const pct =
            row.target > 0
              ? Math.min(100, (row.accepted / row.target) * 100)
              : 0;
          const over = row.target > 0 && row.accepted > row.target;
          return (
            <div key={row.type} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xs text-ink-soft">
                  {capacityProgressLabel(label, row.accepted, row.target)}
                </span>
                <span
                  className={`font-display text-sm font-semibold tabular-nums ${
                    over ? "text-brick" : "text-ink"
                  }`}
                >
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-chip bg-paper">
                <div
                  className={`h-2 rounded-chip ${over ? "bg-brick" : "bg-mint"}`}
                  style={{ width: `${Math.max(pct, row.accepted > 0 ? 2 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <form
        action={(fd) => {
          startTransition(async () => {
            await updateCapacityTargets(fd);
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
