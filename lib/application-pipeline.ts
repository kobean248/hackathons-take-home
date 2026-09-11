import type { ApplicationStatus } from "@/types";
import type { TimelineStep } from "@/components/timeline";

// Canonical applicant-facing pipeline. Decision collapses accept /
// waitlist / reject into one terminal step so the stepper stays short.
const PIPELINE: { id: string; label: string; statuses: ApplicationStatus[] }[] =
  [
    { id: "draft", label: "Draft", statuses: ["draft"] },
    { id: "submitted", label: "Submitted", statuses: ["submitted"] },
    {
      id: "under_review",
      label: "Under review",
      statuses: ["under_review"],
    },
    {
      id: "decision",
      label: "Decision",
      statuses: ["accepted", "waitlisted", "rejected"],
    },
  ];

const STATUS_RANK: Record<ApplicationStatus, number> = {
  draft: 0,
  submitted: 1,
  under_review: 2,
  accepted: 3,
  waitlisted: 3,
  rejected: 3,
};

export function pipelineStepsForStatus(
  status: ApplicationStatus
): TimelineStep[] {
  const rank = STATUS_RANK[status];
  return PIPELINE.map((step, i) => ({
    id: step.id,
    label:
      step.id === "decision" && rank >= 3
        ? status === "accepted"
          ? "Accepted"
          : status === "waitlisted"
            ? "Waitlisted"
            : "Rejected"
        : step.label,
    completed: i <= rank,
  }));
}
