// Rounded-pill, line-bordered chip for deadlines — flat replacement for
// the marketing site's soft cloud call-outs. Light-surface variant for
// paper backgrounds; see design-doc.md §4 (Clouds → chips) and §6.

type DeadlineChipProps = {
  date: Date | string;
  /** Optional prefix, e.g. "Deadline" or "Priority due". */
  label?: string;
};

export function DeadlineChip({ date, label = "Deadline" }: DeadlineChipProps) {
  const formatted =
    typeof date === "string"
      ? date
      : date.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
        });

  return (
    <span className="inline-flex items-center rounded-full border border-line px-3 py-1 text-2xs font-medium text-ink-soft">
      {label}: {formatted}
    </span>
  );
}
