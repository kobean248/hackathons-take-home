import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ActivityLog,
  type ActivityEvent,
} from "@/components/organizer/activity-log";
import { OrganizerEmpty } from "@/components/organizer/organizer-empty";
import { PortalHero } from "@/components/shell/portal-hero";
import { SceneReviewInbox } from "@/components/illustrations/berkeley-scenes";
import { SelectNative } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";

const KINDS = ["status_change", "review", "recusal"] as const;
type KindFilter = (typeof KINDS)[number];

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const params = await searchParams;
  const kindFilter =
    params.kind && (KINDS as readonly string[]).includes(params.kind)
      ? (params.kind as KindFilter)
      : undefined;

  const supabase = await createClient();

  let query = supabase
    .from("application_activity")
    .select("event_id, application_id, kind, occurred_at, actor_id, detail, note")
    .order("occurred_at", { ascending: false })
    .limit(150);

  if (kindFilter) {
    query = query.eq("kind", kindFilter);
  }

  const { data: rows, error } = await query.returns<
    {
      event_id: string;
      application_id: string;
      kind: string;
      occurred_at: string;
      actor_id: string | null;
      detail: string | null;
      note: string | null;
    }[]
  >();

  const events: ActivityEvent[] = [];

  if (!error && rows && rows.length > 0) {
    const actorIds = [
      ...new Set(rows.map((r) => r.actor_id).filter(Boolean) as string[]),
    ];
    const appIds = [...new Set(rows.map((r) => r.application_id))];

    const [{ data: actors }, { data: apps }] = await Promise.all([
      actorIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", actorIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              full_name: string | null;
              email: string;
            }[],
          }),
      supabase
        .from("applications")
        .select(
          "id, type, applicant:profiles!applications_applicant_id_fkey(full_name, email)"
        )
        .in("id", appIds),
    ]);

    const nameById = new Map(
      (actors ?? []).map((a) => [a.id, a.full_name || a.email || "Unknown"])
    );
    const labelByApp = new Map(
      (apps ?? []).map((a) => {
        const applicant = Array.isArray(a.applicant)
          ? a.applicant[0]
          : a.applicant;
        const name =
          (applicant as { full_name: string | null; email: string } | null)
            ?.full_name ||
          (applicant as { email: string } | null)?.email ||
          "Applicant";
        return [a.id, `${name} · ${a.type}`] as const;
      })
    );

    for (const r of rows) {
      if (
        r.kind !== "status_change" &&
        r.kind !== "review" &&
        r.kind !== "recusal"
      ) {
        continue;
      }
      events.push({
        event_id: r.event_id,
        kind: r.kind,
        occurred_at: r.occurred_at,
        actor_name: r.actor_id
          ? (nameById.get(r.actor_id) ?? "Unknown")
          : "System",
        detail: r.detail,
        note: r.note,
        application_id: r.application_id,
        application_label: labelByApp.get(r.application_id) ?? null,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PortalHero
        title="Audit log"
        description="Who changed a status, who scored what, and who recused — across all applications."
        scene={<SceneReviewInbox className="h-full w-full" />}
      />

      <form className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-2xs text-muted-foreground">
          Event type
          <SelectNative name="kind" defaultValue={kindFilter ?? ""} className="w-44">
            <option value="">All events</option>
            <option value="status_change">Status changes</option>
            <option value="review">Reviews</option>
            <option value="recusal">Recusals</option>
          </SelectNative>
        </label>
        <Button type="submit" size="sm" variant="outline">
          Filter
        </Button>
        {kindFilter && (
          <Link
            href="/organizer/audit"
            className="text-2xs font-medium text-sunset hover:underline"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-xl border border-border bg-card p-6">
        {events.length === 0 ? (
          <OrganizerEmpty
            title="No activity yet"
            body="Status decisions, reviews, and recusals will show up here."
          />
        ) : (
          <ActivityLog events={events} />
        )}
      </div>
    </div>
  );
}
