# Hackathons @ Berkeley — Portal

A miniature version of the Cal Hacks application platform: applicants sign
in, apply to one or more roles (Hacker / Mentor / Volunteer), and track
status; organizers see every application in one place, filter it, grade
hacker applications on a rubric, and accept/waitlist/reject.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript, Tailwind CSS + shadcn/ui |
| Backend/DB | Supabase (Postgres + Auth + RLS + Storage) |
| Forms | react-hook-form + zod |
| Auth | Supabase Auth — email/password and Google OAuth |

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com),
   or run one locally with `supabase start` (requires Docker).

3. **Environment variables** — copy the example and fill in your project's
   values from **Settings → API**:

   ```bash
   cp .env.local.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` —
     safe for the browser.
   - `SUPABASE_SERVICE_ROLE_KEY` — secret, only used by `scripts/seed.ts`.
     Never expose this to the client.

4. **Run the migrations** (in `supabase/migrations/`, applied in order —
   `0001_init.sql` through `0006_teams.sql`):

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

   or paste each file's contents into the SQL editor in order, if you'd
   rather not link the CLI.

5. **Fix the signup confirmation email template** — required, not optional,
   or every signup will land on `/auth/auth-code-error`. Supabase's default
   "Confirm signup" template links straight to Supabase's own hosted verify
   endpoint, which consumes the token itself before our
   `app/auth/confirm/route.ts` ever sees it. In the dashboard, go to
   **Authentication → Email Templates → Confirm signup** and replace the
   confirmation link's `href="{{ .ConfirmationURL }}"` with:

   ```
   {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email
   ```

   (`{{ .RedirectTo }}` is whatever `emailRedirectTo` was passed at signup —
   already `.../auth/confirm?next=/dashboard` — so this just appends the two
   params our route actually reads.)

6. **Enable Google OAuth** — in the Supabase dashboard under
   **Authentication → Providers**, turn on Google and add your OAuth client
   ID/secret. Email/password is on by default and needs no extra setup
   beyond step 5 above.

7. **Promote yourself to organizer** — sign up once through the app, then
   in the SQL editor:

   ```sql
   update profiles set role = 'organizer' where email = 'you@example.com';
   ```

   (Reviewers are promoted the same way, with `role = 'reviewer'`.)

8. **(Optional) Seed demo data** — creates 3 organizers, 5 reviewers, and 30
   fake applicants with realistic applications, so the organizer views and
   `/organizer/analytics` have real numbers to look at:

   ```bash
   pnpm seed
   ```

   Guarded to refuse running unless `NEXT_PUBLIC_SUPABASE_URL` contains
   `localhost` or you pass `SEED_CONFIRM=yes` — it creates real auth users,
   so it shouldn't be pointed at a project other people are using.

9. **Run it**

   ```bash
   pnpm dev
   ```

## Schema

Full SQL is in `supabase/migrations/0001_init.sql`. Core shape:

```sql
create type app_role as enum ('applicant', 'reviewer', 'organizer');
create type application_type as enum ('hacker', 'mentor', 'volunteer', 'judge');
create type application_status as enum (
  'draft', 'submitted', 'under_review', 'accepted', 'waitlisted', 'rejected'
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role app_role not null default 'applicant',
  created_at timestamptz not null default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references profiles(id) on delete cascade,
  type application_type not null,
  status application_status not null default 'draft',
  form_data jsonb not null default '{}',
  resume_path text,
  submitted_at timestamptz,
  decided_at timestamptz,
  decided_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (applicant_id, type)
);

create table review_assignments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (application_id, reviewer_id)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  scores jsonb not null,
  raw_total numeric generated always as (
    (scores->>'technical')::numeric + (scores->>'creativity')::numeric + (scores->>'impact')::numeric
  ) stored,
  comments text,
  submitted_at timestamptz not null default now(),
  unique (application_id, reviewer_id)
);

create table application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  status application_status not null,
  changed_by uuid references profiles(id),
  changed_at timestamptz not null default now(),
  note text
);

create view normalized_reviews with (security_invoker = true) as
select r.*,
  (r.raw_total - avg(r.raw_total) over (partition by r.reviewer_id))
    / nullif(stddev(r.raw_total) over (partition by r.reviewer_id), 0) as z_score
from reviews r;
```

**`profiles`** — one row per auth user, created automatically by a trigger
on signup (`role` defaults to `applicant`; organizers/reviewers are promoted
manually). This is the source of truth RLS policies check against.

**`applications`** — one row per (applicant, type) pair — the unique
constraint is what lets `<ApplicationForm>` always upsert instead of
worrying about duplicates. `form_data` is a schema-driven jsonb blob shaped
by `lib/applicationTypes.ts`, not a fixed set of columns, so adding a new
application type doesn't require a migration.

**`review_assignments`** — the queue: who's supposed to review what. Kept
separate from `reviews` (see below) rather than one combined table.

**`reviews`** — the actual scores. `raw_total` is a generated column so it
doesn't drift from `scores`; `unique (application_id, reviewer_id)` is what
makes grading idempotent (resubmitting edits in place).

**`application_status_history`** — append-only audit trail, powers the
timeline UI on both the applicant dashboard and the organizer detail page.

**`normalized_reviews`** (view) — see "Why normalize scores" below.

RLS is enabled on every table. The general shape: applicants can
read/write only their own rows (and only move their own application between
`draft`/`submitted` — deciding an application is organizer-only, enforced
in the `WITH CHECK` clause, not just in the UI); organizers can read/write
everything; reviewers can read/write only what's assigned to them (plus,
per `0003`, organizers can also grade directly without a formal
assignment). A `current_user_role()` `security definer` helper avoids the
classic RLS-recursion problem of `profiles`' own "organizers can read
every profile" policy needing to read `profiles` to check the role.

Storage: hacker resumes live in a private `resumes` bucket, one PDF per
applicant at `<applicant_id>/resume.pdf`, policy-gated the same way as the
tables (own folder only, organizers can read all).

## Route map

```
/                              landing (public)
/login, /signup                auth (email/password + Google)

/dashboard                     applicant: application cards + status timeline
/dashboard/next-steps          post-acceptance checklist
/apply                         type picker (Hacker / Mentor / Volunteer)
/apply/[type]                  the actual form
/teams                         create/join team + looking-for-teammates board
/settings                      profile + resume re-upload

/organizer                     -> redirects to /organizer/applications
/organizer/applications        table: all applications, filter/search
/organizer/applications/[id]   full detail: responses, resume, decision,
                                grading panel (hacker), status history
/organizer/reviewers           reviewer queue sizes + round-robin assignment
/organizer/analytics           funnel per type + normalized hacker scores
```

The landing lives under the `(public)` route group with `<PublicNav>`;
the applicant portal under `(app)` with `<AppNav>`. Organizer keeps its own
sidebar shell. `/dashboard`, `/apply`, `/teams`, `/settings`, and
`/organizer/*` are gated in `proxy.ts` (session + role); signed-in users can
still browse `/` — they get a “Go to dashboard” banner instead of a force
redirect.

## Design decisions

**Config-driven form engine.** `lib/applicationTypes.ts` is the only place
that knows what fields a Hacker/Mentor/Volunteer application has.
`buildFieldSchema()` derives a zod schema from that config, and one
`<ApplicationForm type="...">` component renders and saves any of them. The
payoff: `/apply/mentor` and `/apply/volunteer` (Prompt 8 in `dev_plan.md`)
are one line each — no new form logic, just a type string. Adding a fourth
type (`judge` is already a commented-out stub in the config and in the
`application_type` enum) means writing a field list, not a page.

**Normalized (z-score) scoring, not just an average.** With many volunteer
reviewers, some are reliably harsher or more lenient than others — a flat
average of raw scores lets that noise dominate the ranking. `reviews` and
`review_assignments` are separate tables (who's assigned vs. what they
scored) specifically so a `normalized_reviews` view can compute each
reviewer's own mean/stddev and correct their scores against it before
`/organizer/analytics` compares across reviewers. A generated `raw_total`
column keeps that math from ever drifting out of sync with `scores`.

**RLS, not just `if (role === 'organizer')` checks.** Every table has row
level security matching the actual access model (applicant-owns-their-row,
organizer-sees-all, reviewer-sees-assigned), so a bug in a page's own
auth check isn't the only thing standing between a user and someone else's
data — the database enforces it independent of which code path reaches it
(a Server Component, a Server Action, a future API route, `psql`).