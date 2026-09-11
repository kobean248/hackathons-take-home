-- ========== ENUMS ==========
create type app_role as enum ('applicant', 'reviewer', 'organizer');
create type application_type as enum ('hacker', 'mentor', 'volunteer', 'judge');
create type application_status as enum (
  'draft', 'submitted', 'under_review', 'accepted', 'waitlisted', 'rejected'
);

-- ========== PROFILES ==========
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role app_role not null default 'applicant',
  created_at timestamptz not null default now()
);

-- ========== APPLICATIONS ==========
create table applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references profiles(id) on delete cascade,
  type application_type not null,
  status application_status not null default 'draft',
  form_data jsonb not null default '{}',        -- schema-driven, per type
  resume_path text,                              -- Supabase Storage path (hacker only)
  submitted_at timestamptz,
  decided_at timestamptz,
  decided_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (applicant_id, type)                    -- one application per type per user
);

-- ========== REVIEW ASSIGNMENTS (the queue) ==========
create table review_assignments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (application_id, reviewer_id)
);

-- ========== REVIEWS (the scores) ==========
create table reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  scores jsonb not null,        -- {"technical":8,"creativity":7,"impact":9}
  raw_total numeric generated always as (
    ( (scores->>'technical')::numeric +
      (scores->>'creativity')::numeric +
      (scores->>'impact')::numeric )
  ) stored,
  comments text,
  submitted_at timestamptz not null default now(),
  unique (application_id, reviewer_id)
);

-- ========== STATUS HISTORY (audit trail) ==========
create table application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  status application_status not null,
  changed_by uuid references profiles(id),
  changed_at timestamptz not null default now(),
  note text
);

-- ========== VIEW: normalized scores ==========
-- z-score per reviewer, so a harsh grader's scores are corrected against
-- their own mean/stddev before comparing across reviewers.
-- security_invoker so the view enforces the querying user's own RLS grants
-- instead of the view owner's (Postgres 15+; views bypass RLS by default
-- otherwise, see supabase.com/docs/guides/database/postgres/row-level-security).
create view normalized_reviews
  with (security_invoker = true)
as
select
  r.*,
  (r.raw_total - avg(r.raw_total) over (partition by r.reviewer_id))
    / nullif(stddev(r.raw_total) over (partition by r.reviewer_id), 0) as z_score
from reviews r;

-- ============================================================
-- ROLE-CHECK HELPER
-- ============================================================
-- Reads the *calling* user's own role. Marked security definer so that
-- policies on `profiles` itself (e.g. "organizers can read every profile")
-- can call it without recursing back into profiles' own RLS. This is safe
-- to expose despite being security definer: it hardcodes auth.uid(), so it
-- can never be used to read anyone else's role.
create or replace function public.current_user_role()
returns app_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- TRIGGER: create a profile row for every new auth user
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'applicant');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ---------- profiles ----------
alter table profiles enable row level security;

create policy "Users can view their own profile"
on profiles for select
to authenticated
using ( id = auth.uid() );

create policy "Organizers can view all profiles"
on profiles for select
to authenticated
using ( public.current_user_role() = 'organizer' );

-- No insert/update policies for regular users: rows are created only by the
-- handle_new_user trigger, and role changes (e.g. promoting an organizer)
-- are made manually via the SQL editor / service role, per the app design.

-- ---------- applications ----------
alter table applications enable row level security;

create policy "Applicants can view their own applications"
on applications for select
to authenticated
using ( applicant_id = auth.uid() );

create policy "Applicants can insert their own applications"
on applications for insert
to authenticated
with check ( applicant_id = auth.uid() );

create policy "Applicants can update their own draft/submitted applications"
on applications for update
to authenticated
using ( applicant_id = auth.uid() )
with check (
  applicant_id = auth.uid()
  -- applicants may save drafts and submit, but decisions
  -- (accepted/waitlisted/rejected) are organizer-only
  and status in ('draft', 'submitted')
);

create policy "Organizers can view all applications"
on applications for select
to authenticated
using ( public.current_user_role() = 'organizer' );

create policy "Organizers can update all applications"
on applications for update
to authenticated
using ( public.current_user_role() = 'organizer' )
with check ( public.current_user_role() = 'organizer' );

create policy "Reviewers can view applications assigned to them"
on applications for select
to authenticated
using (
  exists (
    select 1 from review_assignments ra
    where ra.application_id = applications.id
      and ra.reviewer_id = auth.uid()
  )
);

-- ---------- review_assignments ----------
alter table review_assignments enable row level security;

create policy "Reviewers can view their own assignments"
on review_assignments for select
to authenticated
using ( reviewer_id = auth.uid() );

create policy "Organizers can view all assignments"
on review_assignments for select
to authenticated
using ( public.current_user_role() = 'organizer' );

create policy "Organizers can create assignments"
on review_assignments for insert
to authenticated
with check ( public.current_user_role() = 'organizer' );

create policy "Organizers can update assignments"
on review_assignments for update
to authenticated
using ( public.current_user_role() = 'organizer' )
with check ( public.current_user_role() = 'organizer' );

-- ---------- reviews ----------
alter table reviews enable row level security;

create policy "Reviewers can view their own reviews"
on reviews for select
to authenticated
using ( reviewer_id = auth.uid() );

create policy "Reviewers can insert their own reviews for assigned apps"
on reviews for insert
to authenticated
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1 from review_assignments ra
    where ra.application_id = reviews.application_id
      and ra.reviewer_id = auth.uid()
  )
);

create policy "Reviewers can update their own reviews"
on reviews for update
to authenticated
using ( reviewer_id = auth.uid() )
with check ( reviewer_id = auth.uid() );

create policy "Organizers can view all reviews"
on reviews for select
to authenticated
using ( public.current_user_role() = 'organizer' );

-- ---------- application_status_history ----------
-- Not explicitly called out in the RLS sketch, but every exposed-schema
-- table needs RLS (see security checklist) and both applicants (dashboard
-- timeline) and organizers (detail page) need to read/write it, so it
-- follows the same applicant-owns-their-row / organizer-sees-all shape.
alter table application_status_history enable row level security;

create policy "Applicants can view their own application history"
on application_status_history for select
to authenticated
using (
  exists (
    select 1 from applications a
    where a.id = application_status_history.application_id
      and a.applicant_id = auth.uid()
  )
);

create policy "Organizers can view all application history"
on application_status_history for select
to authenticated
using ( public.current_user_role() = 'organizer' );

create policy "Applicants can log history on their own applications"
on application_status_history for insert
to authenticated
with check (
  changed_by = auth.uid()
  and exists (
    select 1 from applications a
    where a.id = application_status_history.application_id
      and a.applicant_id = auth.uid()
  )
);

create policy "Organizers can log history on any application"
on application_status_history for insert
to authenticated
with check ( public.current_user_role() = 'organizer' );
