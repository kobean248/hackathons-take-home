import type { ApplicationStatusHistoryRow } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft saved",
  submitted: "Submitted",
  under_review: "Moved to review",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
};

export function StatusTimeline({
  history,
}: {
  history: ApplicationStatusHistoryRow[];
}) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-zinc-500">No status changes recorded yet.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-2 border-l border-black/[.08] pl-3 dark:border-white/[.145]">
      {history.map((entry) => (
        <li key={entry.id} className="text-xs">
          <span className="font-medium">
            {STATUS_LABELS[entry.status] ?? entry.status}
          </span>{" "}
          <span className="text-zinc-500">
            {new Date(entry.changed_at).toLocaleString()}
          </span>
          {entry.note && (
            <p className="text-zinc-500">{entry.note}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
