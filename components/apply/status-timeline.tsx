import type { ApplicationStatusHistoryRow } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft saved",
  submitted: "Submitted",
  under_review: "Moved to review",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
};

// Node-and-line timeline, flattened: solid dots on a solid line, no glow
// or blur — see design-doc.md §7 (Applicant dashboard row).
export function StatusTimeline({
  history,
}: {
  history: ApplicationStatusHistoryRow[];
}) {
  if (history.length === 0) {
    return (
      <p className="text-2xs text-muted-foreground">
        No status changes recorded yet.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {history.map((entry, i) => (
        <li key={entry.id} className="relative flex gap-3 pl-1">
          <span className="relative flex w-3 shrink-0 flex-col items-center">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-mint" />
            {i < history.length - 1 && (
              <span className="mt-1 w-px flex-1 bg-border" />
            )}
          </span>
          <span className="pb-3 text-2xs">
            <span className="font-medium text-foreground">
              {STATUS_LABELS[entry.status] ?? entry.status}
            </span>{" "}
            <span className="text-muted-foreground">
              {new Date(entry.changed_at).toLocaleString()}
            </span>
            {entry.note && (
              <p className="text-muted-foreground">{entry.note}</p>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
