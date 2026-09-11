"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { decideApplication } from "@/app/organizer/applications/actions";
import type { ApplicationStatus } from "@/types";

const OPTIONS: { status: ApplicationStatus; label: string }[] = [
  { status: "accepted", label: "Accept" },
  { status: "waitlisted", label: "Waitlist" },
  { status: "rejected", label: "Reject" },
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
        {OPTIONS.map((opt) => (
          <Button
            key={opt.status}
            type="button"
            variant={currentStatus === opt.status ? "default" : "outline"}
            disabled={isPending}
            onClick={() => decide(opt.status)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
