import type { ApplicationStatus } from "@/types";

// Flat fill at ~12% opacity of the status color + full-opacity text of
// that same color — no outline+fill combos, no icons in the badge. Status
// is never color-only: the label always carries the word too.
const STATUS_STYLES: Record<ApplicationStatus, string> = {
  draft: "bg-ink-soft/10 text-ink-soft",
  submitted: "bg-sky/12 text-sky",
  under_review: "bg-amber/12 text-amber",
  accepted: "bg-mint/12 text-mint",
  waitlisted: "bg-amber/12 text-amber",
  rejected: "bg-brick/12 text-brick",
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
      className={`inline-flex items-center rounded-chip px-2.5 py-0.5 text-2xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
