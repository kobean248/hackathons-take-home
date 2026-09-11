"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { decideApplication } from "@/app/organizer/applications/actions";
import { useToast } from "@/components/shell/toast-provider";
import type { ApplicationStatus } from "@/types";
import { wouldExceedCapacity } from "@/lib/organizer-ops";

// Active state reflects the outcome's own status color (mint/amber/brick —
// same mapping as StatusBadge) rather than the generic sunset accent, so
// the decision reads consistently with the badge already shown above it.
const OPTIONS: {
  status: ApplicationStatus;
  label: string;
  activeClass: string;
}[] = [
  { status: "accepted", label: "Accept", activeClass: "bg-mint text-white" },
  {
    status: "waitlisted",
    label: "Waitlist",
    activeClass: "bg-amber text-white",
  },
  { status: "rejected", label: "Reject", activeClass: "bg-brick text-white" },
];

export function DecisionButtons({
  applicationId,
  currentStatus,
  capacity,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
  capacity?: {
    accepted: number;
    target: number;
    typeLabel: string;
  } | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);
  const { push } = useToast();

  function decide(status: ApplicationStatus, force = false) {
    setError(null);

    if (
      status === "accepted" &&
      capacity &&
      !force &&
      wouldExceedCapacity(
        capacity.accepted,
        capacity.target,
        currentStatus === "accepted"
      )
    ) {
      setCapacityWarning(
        `Accepting would exceed the ${capacity.typeLabel.toLowerCase()} target (${capacity.accepted}/${capacity.target}). Accept anyway?`
      );
      return;
    }

    setCapacityWarning(null);
    startTransition(async () => {
      try {
        await decideApplication(applicationId, status);
        const opt = OPTIONS.find((o) => o.status === status);
        push("success", `Application ${opt?.label.toLowerCase()}ed.`);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Something went wrong.";
        setError(message);
        push("error", message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {OPTIONS.map((opt) => {
          const active = currentStatus === opt.status;
          return (
            <Button
              key={opt.status}
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => decide(opt.status)}
              className={active ? `border-transparent ${opt.activeClass}` : ""}
            >
              {opt.label}
            </Button>
          );
        })}
      </div>
      {capacityWarning && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber">{capacityWarning}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => decide("accepted", true)}
            >
              Accept anyway
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setCapacityWarning(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-brick">{error}</p>}
    </div>
  );
}
