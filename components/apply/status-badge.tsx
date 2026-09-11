import type { ApplicationStatus } from "@/types";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  submitted: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  under_review:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  accepted:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  waitlisted:
    "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
