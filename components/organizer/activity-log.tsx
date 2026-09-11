"use client";

import Link from "next/link";

type ActivityKind = "status_change" | "review" | "recusal";

export type ActivityEvent = {
  event_id: string;
  kind: ActivityKind;
  occurred_at: string;
  actor_name: string;
  detail: string | null;
  note: string | null;
  /** When set (global audit page), link to the application. */
  application_id?: string;
  application_label?: string | null;
};

const KIND_LABEL: Record<ActivityKind, string> = {
  status_change: "Status",
  review: "Review",
  recusal: "Recusal",
};

const KIND_CLASS: Record<ActivityKind, string> = {
  status_change: "bg-sky/15 text-sky",
  review: "bg-sunset/15 text-sunset",
  recusal: "bg-amber/15 text-amber",
};

/** Who changed a status / scored / recused — for late-stage disputes. */
export function ActivityLog({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-2xs text-ink-soft">No activity recorded yet.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-0 divide-y divide-line">
      {events.map((ev) => (
        <li
          key={`${ev.kind}-${ev.event_id}`}
          className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-chip px-1.5 py-0.5 text-[0.65rem] font-semibold ${KIND_CLASS[ev.kind]}`}
              >
                {KIND_LABEL[ev.kind]}
              </span>
              <span className="text-sm font-medium text-ink">
                {ev.actor_name}
              </span>
              {ev.application_id && (
                <Link
                  href={`/organizer/applications/${ev.application_id}`}
                  className="truncate text-2xs font-medium text-sunset hover:underline"
                >
                  {ev.application_label || "Application"}
                </Link>
              )}
            </div>
            <p className="text-2xs text-ink-soft">
              {ev.kind === "status_change" && (
                <>
                  Changed status to{" "}
                  <span className="font-medium text-ink">{ev.detail}</span>
                </>
              )}
              {ev.kind === "review" && (
                <>
                  Submitted scores (
                  {ev.detail?.replace("raw_total=", "")}/30)
                </>
              )}
              {ev.kind === "recusal" && (
                <>
                  Declared conflict of interest
                  {ev.note ? ` — ${ev.note}` : ""}
                </>
              )}
              {ev.kind === "status_change" && ev.note === "bulk_decision" && (
                <> · bulk action</>
              )}
            </p>
          </div>
          <time
            className="shrink-0 text-2xs tabular-nums text-ink-soft"
            dateTime={ev.occurred_at}
          >
            {new Date(ev.occurred_at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
        </li>
      ))}
    </ol>
  );
}
