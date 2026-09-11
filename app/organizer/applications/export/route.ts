import { createClient } from "@/lib/supabase/server";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "@/lib/applicationTypes";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/types";

export const dynamic = "force-dynamic";

type ExportRow = {
  id: string;
  type: ApplicationTypeKey;
  status: ApplicationStatus;
  submitted_at: string | null;
  decided_at: string | null;
  form_data: Record<string, unknown> | null;
  applicant: { full_name: string | null; email: string; school: string | null } | null;
};

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** CSV of applications matching the same filters as the list page. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const q = url.searchParams.get("q")?.trim() || undefined;
  const flaggedOnly = url.searchParams.get("flagged") === "true";
  const tiebreakerOnly = url.searchParams.get("tiebreaker") === "true";
  const mineOnly = url.searchParams.get("assigned_to_me") === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "organizer" && profile?.role !== "reviewer") {
    return new Response("Forbidden", { status: 403 });
  }

  let assignedIds: string[] | null = null;
  if (mineOnly) {
    const { data: assigns } = await supabase
      .from("review_assignments")
      .select("application_id")
      .eq("reviewer_id", user.id)
      .is("recused_at", null);
    assignedIds = (assigns ?? []).map((a) => a.application_id);
    if (assignedIds.length === 0) {
      return csvResponse("id,type,status\n");
    }
  }

  let tiebreakerIds: string[] | null = null;
  if (tiebreakerOnly) {
    const { data: disagrees } = await supabase
      .from("application_score_disagreement")
      .select("application_id");
    tiebreakerIds = (disagrees ?? []).map((d) => d.application_id);
    if (tiebreakerIds.length === 0) {
      return csvResponse("id,type,status\n");
    }
  }

  let query = supabase
    .from("applications")
    .select(
      "id, type, status, submitted_at, decided_at, form_data, applicant:profiles!applications_applicant_id_fkey(full_name, email, school)"
    )
    .order("submitted_at", { ascending: false });

  if (type && type in APPLICATION_TYPES) {
    query = query.eq("type", type);
  }
  if (status && (APPLICATION_STATUSES as readonly string[]).includes(status)) {
    query = query.eq("status", status);
  }
  if (assignedIds) {
    query = query.in("id", assignedIds);
  }
  if (tiebreakerIds) {
    query = query.in("id", tiebreakerIds);
  }
  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%`,
      { foreignTable: "applicant" }
    );
  }

  const { data, error } = await query.returns<ExportRow[]>();
  if (error) {
    return new Response(error.message, { status: 500 });
  }

  let rows = data ?? [];

  if (flaggedOnly && profile?.role === "organizer") {
    const { data: flags } = await supabase
      .from("application_fraud_flags")
      .select("application_id");
    const flagged = new Set((flags ?? []).map((f) => f.application_id));
    rows = rows.filter((r) => flagged.has(r.id));
  }

  const header = [
    "id",
    "type",
    "status",
    "full_name",
    "email",
    "school",
    "submitted_at",
    "decided_at",
  ];

  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.type,
        row.status,
        row.applicant?.full_name ?? "",
        row.applicant?.email ?? "",
        row.applicant?.school ?? "",
        row.submitted_at ?? "",
        row.decided_at ?? "",
      ]
        .map((c) => csvEscape(String(c)))
        .join(",")
    );
  }

  return csvResponse(lines.join("\n") + "\n");
}

function csvResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applications-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
