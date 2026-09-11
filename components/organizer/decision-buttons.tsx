"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { decideApplication } from "@/app/organizer/applications/actions";
import type { ApplicationStatus } from "@/types";

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
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function decide(status: ApplicationStatus) {
    setError(null);
    startTransition(async () => {
      try {
        await decideApplication(applicationId, status);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
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
      {error && <p className="text-sm text-brick">{error}</p>}
    </div>
  );
}
