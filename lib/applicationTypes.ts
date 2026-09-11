import { z } from "zod";

export type FieldType = "text" | "number" | "textarea" | "file";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
};

export type ApplicationTypeConfig = {
  label: string;
  needsRubricGrading: boolean;
  fields: readonly FieldConfig[];
};

export const APPLICATION_TYPES = {
  hacker: {
    label: "Hacker",
    needsRubricGrading: true,
    fields: [
      { name: "school", label: "School", type: "text", required: true },
      {
        name: "graduation_year",
        label: "Graduation Year",
        type: "number",
        required: true,
      },
      {
        name: "why_cal_hacks",
        label: "Why do you want to attend Cal Hacks?",
        type: "textarea",
        required: true,
      },
      {
        name: "project_idea",
        label: "Got a project idea? Share it.",
        type: "textarea",
      },
      { name: "resume", label: "Resume", type: "file" },
    ],
  },
  mentor: {
    label: "Mentor",
    needsRubricGrading: false,
    fields: [
      {
        name: "company",
        label: "Company / Affiliation",
        type: "text",
        required: true,
      },
      {
        name: "expertise",
        label: "Areas of expertise",
        type: "text",
        required: true,
      },
      {
        name: "availability",
        label: "Availability (hours)",
        type: "textarea",
        required: true,
      },
    ],
  },
  volunteer: {
    label: "Volunteer",
    needsRubricGrading: false,
    fields: [
      {
        name: "shifts",
        label: "Preferred shifts",
        type: "text",
        required: true,
      },
      {
        name: "why_volunteer",
        label: "Why do you want to volunteer?",
        type: "textarea",
        required: true,
      },
    ],
  },
  // judge: { ... } — left as an exercise, same pattern
} as const satisfies Record<string, ApplicationTypeConfig>;

export type ApplicationTypeKey = keyof typeof APPLICATION_TYPES;

// Generates a zod object schema from a field list, so validation for any
// application type (current or future) comes from this one config instead
// of a hand-written schema per type.
//
// `file` fields are skipped here: File objects can't live in the `form_data`
// jsonb column, so resume upload is handled separately against Supabase
// Storage (wired up when the hacker form is built) rather than through this
// schema/form_data path.
export function buildFieldSchema(fields: readonly FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === "file") continue;

    if (field.type === "number") {
      // react-hook-form's valueAsNumber turns an empty input into NaN,
      // which z.number() already treats as invalid — perfect for "required".
      const base = z.number({ message: `${field.label} is required` });
      shape[field.name] = field.required
        ? base
        : z.preprocess(
            (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
            base.optional()
          );
      continue;
    }

    const base = z.string().trim();
    shape[field.name] = field.required
      ? base.min(1, `${field.label} is required`)
      : base.optional();
  }

  return z.object(shape);
}
