-- Event participation roles (hacker/mentor/volunteer/judge) granted on accept.
-- Kept separate from profiles.role (applicant/reviewer/organizer) so staff can
-- also hold event roles, and users can stack multiple accepted types.

create table public.event_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.application_type not null,
  application_id uuid references public.applications(id) on delete set null,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(id),
  primary key (user_id, role)
);

create index event_roles_user_idx on public.event_roles (user_id);
create index event_roles_role_idx on public.event_roles (role);

comment on table public.event_roles is
  'Accepted event roles — multi-value counterpart to applications.type once decided.';

-- Weekend shift slots for mentors / volunteers / judges.
create table public.shift_slots (
  id uuid primary key default gen_random_uuid(),
  role public.application_type not null
    check (role in ('mentor', 'volunteer', 'judge')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  title text not null,
  capacity int not null default 20 check (capacity > 0),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index shift_slots_role_starts_idx
  on public.shift_slots (role, starts_at);

create table public.shift_signups (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.shift_slots(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (slot_id, user_id)
);

create index shift_signups_user_idx on public.shift_signups (user_id);

-- Backfill from already-accepted applications.
insert into public.event_roles (user_id, role, application_id, granted_at)
select a.applicant_id, a.type, a.id, coalesce(a.decided_at, now())
from public.applications a
where a.status = 'accepted'
on conflict (user_id, role) do nothing;

-- Seed Cal Hacks weekend shifts (PT) around EVENT_START 2026-10-23.
insert into public.shift_slots (role, starts_at, ends_at, title, capacity)
values
  -- Friday kickoff evening
  ('volunteer', '2026-10-23 16:00:00-07', '2026-10-23 20:00:00-07', 'Friday check-in & setup', 40),
  ('mentor',    '2026-10-23 18:00:00-07', '2026-10-23 22:00:00-07', 'Friday mentor desk', 15),
  ('judge',     '2026-10-23 19:00:00-07', '2026-10-23 21:00:00-07', 'Friday judge briefing', 20),
  -- Saturday
  ('volunteer', '2026-10-24 08:00:00-07', '2026-10-24 12:00:00-07', 'Saturday morning ops', 30),
  ('volunteer', '2026-10-24 12:00:00-07', '2026-10-24 18:00:00-07', 'Saturday afternoon ops', 30),
  ('volunteer', '2026-10-24 18:00:00-07', '2026-10-24 23:00:00-07', 'Saturday night ops', 25),
  ('mentor',    '2026-10-24 10:00:00-07', '2026-10-24 14:00:00-07', 'Saturday mentor desk (AM)', 20),
  ('mentor',    '2026-10-24 14:00:00-07', '2026-10-24 20:00:00-07', 'Saturday mentor desk (PM)', 20),
  ('judge',     '2026-10-24 16:00:00-07', '2026-10-24 18:00:00-07', 'Saturday judge walkthrough', 20),
  -- Sunday expo / teardown
  ('volunteer', '2026-10-25 08:00:00-07', '2026-10-25 12:00:00-07', 'Sunday expo floor', 35),
  ('volunteer', '2026-10-25 12:00:00-07', '2026-10-25 17:00:00-07', 'Sunday teardown', 40),
  ('mentor',    '2026-10-25 09:00:00-07', '2026-10-25 13:00:00-07', 'Sunday mentor desk', 12),
  ('judge',     '2026-10-25 10:00:00-07', '2026-10-25 14:00:00-07', 'Sunday judging block', 25),
  ('judge',     '2026-10-25 14:00:00-07', '2026-10-25 16:00:00-07', 'Sunday awards assist', 15);

-- ---------- RLS ----------
alter table public.event_roles enable row level security;
alter table public.shift_slots enable row level security;
alter table public.shift_signups enable row level security;

grant select on public.event_roles to authenticated;
grant select, insert, delete on public.event_roles to authenticated;

grant select on public.shift_slots to authenticated;

grant select, insert, delete on public.shift_signups to authenticated;

create policy "Users can view their own event roles"
on public.event_roles for select
to authenticated
using ( user_id = (select auth.uid()) );

create policy "Organizers can view all event roles"
on public.event_roles for select
to authenticated
using ( public.current_user_role() = 'organizer' );

create policy "Staff can grant event roles"
on public.event_roles for insert
to authenticated
with check ( public.current_user_role() in ('organizer', 'reviewer') );

create policy "Staff can revoke event roles"
on public.event_roles for delete
to authenticated
using ( public.current_user_role() in ('organizer', 'reviewer') );

create policy "Authenticated can view shift slots"
on public.shift_slots for select
to authenticated
using ( true );

create policy "Authenticated can view shift signups"
on public.shift_signups for select
to authenticated
using ( true );

create policy "Users can sign up for shifts"
on public.shift_signups for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.event_roles er
    join public.shift_slots s on s.id = slot_id
    where er.user_id = (select auth.uid())
      and er.role = s.role
  )
);

create policy "Users can leave their own shifts"
on public.shift_signups for delete
to authenticated
using ( user_id = (select auth.uid()) );
