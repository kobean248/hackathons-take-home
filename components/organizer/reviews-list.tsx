type ReviewRow = {
  id: string;
  reviewer_id: string;
  scores: { technical: number; creativity: number; impact: number };
  raw_total: number;
  comments: string | null;
  reviewer: { full_name: string | null; email: string } | null;
};

export function ReviewsList({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-2xs text-muted-foreground">
        No reviews submitted yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="rounded-chip border border-border p-3 text-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {r.reviewer?.full_name || r.reviewer?.email || "Unknown reviewer"}
            </span>
            <span className="font-display font-semibold text-sunset">
              {r.raw_total}/30
            </span>
          </div>
          <p className="text-2xs text-muted-foreground">
            technical {r.scores.technical} · creativity {r.scores.creativity} ·
            impact {r.scores.impact}
          </p>
          {r.comments && <p className="mt-1 text-2xs">{r.comments}</p>}
        </li>
      ))}
    </ul>
  );
}
