-- Organizer ops: reviewer calibration samples, capacity targets, fraud-flag view.

-- ========== CALIBRATION SAMPLES (gold-standard grading practice) ==========
create table public.calibration_samples (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  form_data jsonb not null default '{}',
  gold_scores jsonb not null
    check (
      (gold_scores ? 'technical')
      and (gold_scores ? 'creativity')
      and (gold_scores ? 'impact')
    ),
  gold_comments text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index calibration_samples_sort_idx
  on public.calibration_samples (sort_order, created_at);

-- ========== CALIBRATION ATTEMPTS ==========
create table public.calibration_attempts (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  sample_id uuid not null references public.calibration_samples(id) on delete cascade,
  scores jsonb not null
    check (
      (scores ? 'technical')
      and (scores ? 'creativity')
      and (scores ? 'impact')
    ),
  submitted_at timestamptz not null default now(),
  unique (reviewer_id, sample_id)
);

create index calibration_attempts_reviewer_idx
  on public.calibration_attempts (reviewer_id);

-- ========== CAPACITY TARGETS ==========
create table public.capacity_targets (
  type public.application_type primary key,
  target int not null check (target >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

-- Default headcounts — organizers can edit from Analytics.
insert into public.capacity_targets (type, target) values
  ('hacker', 400),
  ('mentor', 40),
  ('volunteer', 80),
  ('judge', 20);

-- ========== SEED: 3 realistic gold-standard hacker samples ==========
insert into public.calibration_samples (id, title, form_data, gold_scores, gold_comments, sort_order)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'Sample A — strong technical builder',
    jsonb_build_object(
      'school', 'UC Berkeley',
      'graduation_year', 2027,
      'why_cal_hacks',
        'I spent last summer shipping a real-time collaborative whiteboard used by 200 classmates. Cal Hacks is where I want to stress-test that stack under a 36-hour clock with people who push harder than I do.',
      'project_idea',
        'An offline-first peer tutoring matcher that syncs when dorm wifi returns — IndexedDB + CRDTs, with a lightweight ranking model for tutor fit.'
    ),
    '{"technical": 9, "creativity": 7, "impact": 8}'::jsonb,
    'Clear shipped experience, concrete stack, ambitious but scoped idea.',
    1
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'Sample B — creative but thin execution',
    jsonb_build_object(
      'school', 'UCLA',
      'graduation_year', 2028,
      'why_cal_hacks',
        'I love jam sessions and weird demos. I want to build something people laugh at and then actually use the next week.',
      'project_idea',
        'A voice-controlled plant that tweets when it needs water. Mostly for the bit, but also to learn hardware.'
    ),
    '{"technical": 4, "creativity": 9, "impact": 5}'::jsonb,
    'Fun voice and originality; technical depth and lasting impact are lighter.',
    2
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'Sample C — impact-heavy community organizer',
    jsonb_build_object(
      'school', 'San Jose State University',
      'graduation_year', 2026,
      'why_cal_hacks',
        'I run a free coding club for high-schoolers in East San Jose. I want to meet mentors who have scaled education tools beyond a single classroom.',
      'project_idea',
        'A multilingual parent SMS bridge that translates teacher announcements and tracks RSVPs for weekend workshops — Twilio + simple admin dashboard.'
    ),
    '{"technical": 6, "creativity": 6, "impact": 9}'::jsonb,
    'Grounded community need and clear users; technical novelty is moderate.',
    3
  );

-- ========== VIEW: duplicate / fraud signals (organizer list) ==========
-- Exact duplicate full_name across applicants, or identical free-text answers
-- across different applicant_ids. security_invoker so caller RLS applies.
create or replace view public.application_fraud_flags
  with (security_invoker = true)
as
with named as (
  select
    a.id as application_id,
    a.applicant_id,
    a.type,
    lower(trim(coalesce(p.full_name, ''))) as full_name_norm
  from public.applications a
  join public.profiles p on p.id = a.applicant_id
  where coalesce(trim(p.full_name), '') <> ''
),
dup_names as (
  select n.application_id, 'duplicate_name'::text as flag_kind
  from named n
  where exists (
    select 1 from named o
    where o.full_name_norm = n.full_name_norm
      and o.applicant_id <> n.applicant_id
  )
),
answers as (
  select
    a.id as application_id,
    a.applicant_id,
    key as field,
    lower(trim(value #>> '{}')) as answer_norm
  from public.applications a
  cross join lateral jsonb_each(a.form_data) as e(key, value)
  where key in ('why_cal_hacks', 'why_volunteer', 'project_idea', 'availability', 'expertise')
    and jsonb_typeof(value) = 'string'
    and length(trim(value #>> '{}')) >= 40
),
dup_answers as (
  select distinct a.application_id, 'identical_answer'::text as flag_kind
  from answers a
  where exists (
    select 1 from answers o
    where o.field = a.field
      and o.answer_norm = a.answer_norm
      and o.applicant_id <> a.applicant_id
  )
)
select application_id, flag_kind from dup_names
union
select application_id, flag_kind from dup_answers;

grant select on public.application_fraud_flags to authenticated;

-- ========== RLS ==========
alter table public.calibration_samples enable row level security;
alter table public.calibration_attempts enable row level security;
alter table public.capacity_targets enable row level security;

grant select on public.calibration_samples to authenticated;
grant select, insert, update on public.calibration_attempts to authenticated;
grant select, insert, update on public.capacity_targets to authenticated;

-- Samples: reviewers + organizers can read (practice material is shared).
create policy "Reviewers and organizers can view calibration samples"
on public.calibration_samples for select
to authenticated
using ( public.current_user_role() in ('reviewer', 'organizer') );

create policy "Organizers can manage calibration samples"
on public.calibration_samples for all
to authenticated
using ( public.current_user_role() = 'organizer' )
with check ( public.current_user_role() = 'organizer' );

-- Attempts: own rows for reviewers/organizers; organizers see all.
create policy "Users can view their own calibration attempts"
on public.calibration_attempts for select
to authenticated
using ( reviewer_id = (select auth.uid()) );

create policy "Organizers can view all calibration attempts"
on public.calibration_attempts for select
to authenticated
using ( public.current_user_role() = 'organizer' );

create policy "Reviewers and organizers can insert their own attempts"
on public.calibration_attempts for insert
to authenticated
with check (
  reviewer_id = (select auth.uid())
  and public.current_user_role() in ('reviewer', 'organizer')
);

create policy "Users can update their own calibration attempts"
on public.calibration_attempts for update
to authenticated
using ( reviewer_id = (select auth.uid()) )
with check ( reviewer_id = (select auth.uid()) );

-- Capacity: organizers only.
create policy "Organizers can view capacity targets"
on public.capacity_targets for select
to authenticated
using ( public.current_user_role() = 'organizer' );

create policy "Organizers can upsert capacity targets"
on public.capacity_targets for insert
to authenticated
with check ( public.current_user_role() = 'organizer' );

create policy "Organizers can update capacity targets"
on public.capacity_targets for update
to authenticated
using ( public.current_user_role() = 'organizer' )
with check ( public.current_user_role() = 'organizer' );
