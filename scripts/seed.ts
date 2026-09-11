/**
 * Seeds demo data: 3 organizers, 5 reviewers, ~30 applicants split across
 * hacker/mentor/volunteer with realistic form_data, a mix of statuses, and
 * some review_assignments/reviews so /organizer/analytics has real numbers.
 *
 * Run with: pnpm seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (the
 * secret key, never the publishable one — this script creates auth users
 * directly via the Admin API and bypasses RLS for bulk inserts).
 *
 * Guarded so it only runs against a project whose URL contains "localhost",
 * or when SEED_CONFIRM=yes is explicitly set — so nobody nukes a shared/prod
 * project's data by running this against the wrong .env.local by accident.
 */
import "dotenv/config";
import { faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";
import { APPLICATION_TYPES, type ApplicationTypeKey } from "../lib/applicationTypes";
import type { ApplicationStatus } from "../types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment (.env.local)."
  );
  process.exit(1);
}

const looksLocal = SUPABASE_URL.includes("localhost");
const confirmed = process.env.SEED_CONFIRM === "yes";

if (!looksLocal && !confirmed) {
  console.error(
    `Refusing to seed ${SUPABASE_URL} — it doesn't look like a local project.\n` +
      "If you really mean to seed this one, re-run with SEED_CONFIRM=yes."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Seed accounts only — never used against a real project, and this script
// refuses to run against one anyway unless explicitly confirmed.
const SEED_PASSWORD = "seed-password-123!";

const ORGANIZER_COUNT = 3;
const REVIEWER_COUNT = 5;
const APPLICANT_COUNT = 30;

const STATUS_POOL: ApplicationStatus[] = [
  "draft",
  "submitted",
  "submitted",
  "under_review",
  "under_review",
  "accepted",
  "waitlisted",
  "rejected",
];

async function createUser(email: string, fullName: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: SEED_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`Failed to create ${email}: ${error?.message}`);
  }

  // handle_new_user already inserted a profiles row (role='applicant', email
  // set) — it doesn't know about full_name, so backfill that here.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", data.user.id);
  if (profileError) throw new Error(profileError.message);

  return data.user;
}

async function setRole(userId: string, role: "organizer" | "reviewer") {
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

function fakeFormData(type: ApplicationTypeKey): Record<string, string | number> {
  const data: Record<string, string | number> = {};

  for (const field of APPLICATION_TYPES[type].fields) {
    if (field.type === "file") continue;

    if (field.type === "number") {
      data[field.name] = faker.number.int({ min: 2026, max: 2029 });
      continue;
    }
    if (field.type === "textarea") {
      data[field.name] = faker.lorem.sentences(2);
      continue;
    }
    // type === "text" — a couple of fields get something field-shaped,
    // everything else gets generic short text. Widen to `string` first: the
    // config is typed precisely enough (via `as const satisfies`) that
    // narrowing on the literal `field.name` directly makes an exhaustive
    // if/else chain's final `else` type as `never`.
    const name: string = field.name;
    if (name === "school") {
      data[name] = faker.helpers.arrayElement([
        "UC Berkeley",
        "Stanford",
        "UCLA",
        "San Jose State",
        "UC Davis",
      ]);
    } else if (name === "company") {
      data[name] = faker.company.name();
    } else if (name === "expertise") {
      data[name] = faker.person.jobTitle();
    } else if (name === "shifts") {
      data[name] = faker.helpers.arrayElement([
        "Friday setup",
        "Saturday morning",
        "Saturday night",
        "Sunday teardown",
      ]);
    } else {
      data[name] = faker.lorem.words(3);
    }
  }

  return data;
}

async function main() {
  console.log(`Seeding ${SUPABASE_URL}\n`);

  const organizers = [];
  for (let i = 0; i < ORGANIZER_COUNT; i++) {
    const name = faker.person.fullName();
    const user = await createUser(`organizer${i + 1}@example.com`, name);
    await setRole(user.id, "organizer");
    organizers.push(user);
    console.log(`organizer  ${name} <${user.email}>`);
  }

  const reviewers = [];
  for (let i = 0; i < REVIEWER_COUNT; i++) {
    const name = faker.person.fullName();
    const user = await createUser(`reviewer${i + 1}@example.com`, name);
    await setRole(user.id, "reviewer");
    reviewers.push(user);
    console.log(`reviewer   ${name} <${user.email}>`);
  }

  const types: ApplicationTypeKey[] = ["hacker", "mentor", "volunteer"];
  const applications: {
    id: string;
    type: ApplicationTypeKey;
    status: ApplicationStatus;
    applicantId: string;
  }[] = [];

  for (let i = 0; i < APPLICANT_COUNT; i++) {
    const name = faker.person.fullName();
    const user = await createUser(`applicant${i + 1}@example.com`, name);
    const type = types[i % types.length];
    const status = faker.helpers.arrayElement(STATUS_POOL);
    const isPastDraft = status !== "draft";
    const isDecided =
      status === "accepted" || status === "waitlisted" || status === "rejected";

    const { data: app, error } = await supabase
      .from("applications")
      .insert({
        applicant_id: user.id,
        type,
        status,
        form_data: fakeFormData(type),
        submitted_at: isPastDraft
          ? faker.date.recent({ days: 30 }).toISOString()
          : null,
        decided_at: isDecided
          ? faker.date.recent({ days: 15 }).toISOString()
          : null,
        decided_by: isDecided ? organizers[0].id : null,
      })
      .select("id")
      .single();

    if (error || !app) {
      throw new Error(
        `Failed to create application for ${user.email}: ${error?.message}`
      );
    }

    const history: {
      application_id: string;
      status: ApplicationStatus;
      changed_by: string;
    }[] = [{ application_id: app.id, status: "draft", changed_by: user.id }];
    if (isPastDraft) {
      history.push({ application_id: app.id, status: "submitted", changed_by: user.id });
    }
    if (status === "under_review" || isDecided) {
      history.push({
        application_id: app.id,
        status: "under_review",
        changed_by: organizers[0].id,
      });
    }
    if (isDecided) {
      history.push({ application_id: app.id, status, changed_by: organizers[0].id });
    }
    await supabase.from("application_status_history").insert(history);

    applications.push({ id: app.id, type, status, applicantId: user.id });
    console.log(`applicant  ${name} <${user.email}> — ${type}/${status}`);
  }

  // Reviewer queue: assign 1-2 reviewers to each non-draft hacker
  // application, and complete ~70% of those assignments with a real review
  // so the normalized-scoring table on /organizer/analytics has enough data
  // for a real (non-null) z-score.
  const hackerPool = applications.filter(
    (a) => a.type === "hacker" && a.status !== "draft"
  );

  let reviewerIndex = 0;
  for (const app of hackerPool) {
    const assigneeCount = faker.number.int({ min: 1, max: 2 });

    for (let n = 0; n < assigneeCount; n++) {
      const reviewer = reviewers[reviewerIndex % reviewers.length];
      reviewerIndex++;
      if (reviewer.id === app.applicantId) continue; // no self-review

      const completed = faker.datatype.boolean({ probability: 0.7 });

      const { data: assignment, error: assignmentError } = await supabase
        .from("review_assignments")
        .insert({
          application_id: app.id,
          reviewer_id: reviewer.id,
          completed_at: completed
            ? faker.date.recent({ days: 10 }).toISOString()
            : null,
        })
        .select("id")
        .single();

      if (assignmentError || !assignment) continue;

      if (completed) {
        await supabase.from("reviews").insert({
          application_id: app.id,
          reviewer_id: reviewer.id,
          scores: {
            technical: faker.number.int({ min: 1, max: 10 }),
            creativity: faker.number.int({ min: 1, max: 10 }),
            impact: faker.number.int({ min: 1, max: 10 }),
          },
          comments: faker.lorem.sentence(),
        });
      }
    }
  }

  console.log("\nDone.");
  console.log(`All seed accounts use the password: ${SEED_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
