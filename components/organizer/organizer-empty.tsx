import { BearSleeping } from "@/components/illustrations";

/** Organizer empty states only — never inside dense tables/grading. */
export function OrganizerEmpty({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
      <BearSleeping className="w-24" />
      <div className="max-w-sm">
        <p className="font-display text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-2xs text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
