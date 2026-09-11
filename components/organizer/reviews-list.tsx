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
    return <p className="text-xs text-zinc-500">No reviews submitted yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="rounded border border-black/[.08] p-3 text-sm dark:border-white/[.145]"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {r.reviewer?.full_name || r.reviewer?.email || "Unknown reviewer"}
            </span>
            <span className="text-zinc-500">{r.raw_total}/30</span>
          </div>
          <p className="text-xs text-zinc-500">
            technical {r.scores.technical} · creativity {r.scores.creativity} ·
            impact {r.scores.impact}
          </p>
          {r.comments && <p className="mt-1 text-xs">{r.comments}</p>}
        </li>
      ))}
    </ul>
  );
}
