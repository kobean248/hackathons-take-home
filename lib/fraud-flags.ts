export type FraudFlagKind = "duplicate_name" | "identical_answer";

export type FraudFlag = {
  applicationId: string;
  kinds: FraudFlagKind[];
};

const FLAG_LABEL: Record<FraudFlagKind, string> = {
  duplicate_name: "Matching full name on another application",
  identical_answer: "Identical free-text answer across applicants",
};

export function fraudFlagTooltip(kinds: FraudFlagKind[]): string {
  return kinds.map((k) => FLAG_LABEL[k]).join(" · ");
}

/** Merge view rows (one kind per row) into a map keyed by application id. */
export function mergeFraudFlagRows(
  rows: { application_id: string; flag_kind: string }[]
): Map<string, FraudFlagKind[]> {
  const map = new Map<string, FraudFlagKind[]>();
  for (const row of rows) {
    const kind = row.flag_kind as FraudFlagKind;
    if (kind !== "duplicate_name" && kind !== "identical_answer") continue;
    const existing = map.get(row.application_id) ?? [];
    if (!existing.includes(kind)) existing.push(kind);
    map.set(row.application_id, existing);
  }
  return map;
}

/**
 * Client-side fallback when the SQL view isn't available yet: exact duplicate
 * full names and identical long free-text answers across different applicants.
 */
export function computeFraudFlags(apps: {
  id: string;
  applicant_id: string;
  form_data: Record<string, unknown> | null;
  applicant: { full_name: string | null } | null;
}[]): Map<string, FraudFlagKind[]> {
  const map = new Map<string, FraudFlagKind[]>();

  function add(id: string, kind: FraudFlagKind) {
    const existing = map.get(id) ?? [];
    if (!existing.includes(kind)) existing.push(kind);
    map.set(id, existing);
  }

  const TEXT_FIELDS = [
    "why_cal_hacks",
    "why_volunteer",
    "project_idea",
    "availability",
    "expertise",
  ] as const;

  // Duplicate names
  const byName = new Map<string, { appId: string; applicantId: string }[]>();
  for (const app of apps) {
    const name = (app.applicant?.full_name ?? "").trim().toLowerCase();
    if (!name) continue;
    const list = byName.get(name) ?? [];
    list.push({ appId: app.id, applicantId: app.applicant_id });
    byName.set(name, list);
  }
  for (const list of byName.values()) {
    const applicantIds = new Set(list.map((x) => x.applicantId));
    if (applicantIds.size < 2) continue;
    for (const item of list) add(item.appId, "duplicate_name");
  }

  // Identical answers
  for (const field of TEXT_FIELDS) {
    const byAnswer = new Map<
      string,
      { appId: string; applicantId: string }[]
    >();
    for (const app of apps) {
      const raw = app.form_data?.[field];
      if (typeof raw !== "string") continue;
      const norm = raw.trim().toLowerCase();
      if (norm.length < 40) continue;
      const list = byAnswer.get(norm) ?? [];
      list.push({ appId: app.id, applicantId: app.applicant_id });
      byAnswer.set(norm, list);
    }
    for (const list of byAnswer.values()) {
      const applicantIds = new Set(list.map((x) => x.applicantId));
      if (applicantIds.size < 2) continue;
      for (const item of list) add(item.appId, "identical_answer");
    }
  }

  return map;
}
