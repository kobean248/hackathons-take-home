-- Team formation: teams + membership + optional "looking for teammates" listings.
-- Also unlocks profile self-update for /settings (name / school / github only).

-- ========== TEAMS ==========
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  pitch text not null default '' check (char_length(pitch) <= 500),
  join_code text not null unique check (join_code ~ '^[A-Z0-9]{6}$'),
  looking_for_teammates boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index teams_created_by_idx on public.teams (created_by);
create index teams_looking_idx on public.teams (looking_for_teammates)
  where looking_for_teammates = true;

-- ========== TEAM MEMBERS ==========
create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index team_members_user_id_idx on public.team_members (user_id);

-- One team per user for MVP (simplifies join UX).
create unique index team_members_one_team_per_user
  on public.team_members (user_id);

-- ========== TEAMMATE LISTINGS (solo hackers browsing the board) ==========
create table public.teammate_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  headline text not null check (char_length(headline) between 2 and 120),
  skills text not null default '' check (char_length(skills) <= 240),
  created_at timestamptz not null default now()
);

create index teammate_listings_created_at_idx
  on public.teammate_listings (created_at desc);

-- ========== PROFILE FIELDS + SELF-UPDATE ==========
alter table public.profiles
  add column if not exists school text,
  add column if not exists github_url text;

-- Prevent applicants from escalating their own role/email via UPDATE.
-- Only constrains self-edits; service role / SQL promotions still work.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and auth.uid() = old.id then
    if new.id is distinct from old.id then
      raise exception 'cannot change profile id';
    end if;
    if new.role is distinct from old.role then
      raise exception 'cannot change role';
    end if;
    if new.email is distinct from old.email then
      raise exception 'cannot change email';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ( (select auth.uid()) = id )
with check ( (select auth.uid()) = id );

-- ========== RLS: TEAMS ==========
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.teammate_listings enable row level security;

grant select, insert, update, delete on public.teams to authenticated;
grant select, insert, delete on public.team_members to authenticated;
grant select, insert, update, delete on public.teammate_listings to authenticated;

-- Authenticated hackers can browse teams looking for members + own team.
create policy "Authenticated can view teams"
on public.teams for select
to authenticated
using ( true );

create policy "Users can create teams"
on public.teams for insert
to authenticated
with check ( (select auth.uid()) = created_by );

create policy "Owners can update their team"
on public.teams for update
to authenticated
using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id
      and tm.user_id = (select auth.uid())
      and tm.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id
      and tm.user_id = (select auth.uid())
      and tm.role = 'owner'
  )
);

create policy "Owners can delete their team"
on public.teams for delete
to authenticated
using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id
      and tm.user_id = (select auth.uid())
      and tm.role = 'owner'
  )
);

-- ========== RLS: TEAM MEMBERS ==========
create policy "Authenticated can view memberships"
on public.team_members for select
to authenticated
using ( true );

-- Join via code: insert yourself as member (app verifies join_code first).
create policy "Users can join a team as themselves"
on public.team_members for insert
to authenticated
with check ( (select auth.uid()) = user_id );

create policy "Users can leave their team"
on public.team_members for delete
to authenticated
using ( (select auth.uid()) = user_id );

-- ========== RLS: TEAMMATE LISTINGS ==========
create policy "Authenticated can view listings"
on public.teammate_listings for select
to authenticated
using ( true );

create policy "Users can create their listing"
on public.teammate_listings for insert
to authenticated
with check ( (select auth.uid()) = user_id );

create policy "Users can update their listing"
on public.teammate_listings for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

create policy "Users can delete their listing"
on public.teammate_listings for delete
to authenticated
using ( (select auth.uid()) = user_id );

-- Helper: create team + owner membership in one transaction.
create or replace function public.create_team(
  p_name text,
  p_pitch text default '',
  p_looking boolean default true
)
returns public.teams
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_code text;
  v_team public.teams;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if exists (select 1 from team_members where user_id = v_uid) then
    raise exception 'already on a team';
  end if;

  -- 6-char uppercase join code; retry a few times on collision.
  for i in 1..8 loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    begin
      insert into teams (name, pitch, join_code, looking_for_teammates, created_by)
      values (p_name, coalesce(p_pitch, ''), v_code, coalesce(p_looking, true), v_uid)
      returning * into v_team;
      exit;
    exception when unique_violation then
      if i = 8 then raise; end if;
    end;
  end loop;

  insert into team_members (team_id, user_id, role)
  values (v_team.id, v_uid, 'owner');

  -- Clear solo listing if any.
  delete from teammate_listings where user_id = v_uid;

  return v_team;
end;
$$;

revoke all on function public.create_team(text, text, boolean) from public;
grant execute on function public.create_team(text, text, boolean) to authenticated;

create or replace function public.join_team_by_code(p_code text)
returns public.teams
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_team public.teams;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if exists (select 1 from team_members where user_id = v_uid) then
    raise exception 'already on a team';
  end if;

  select * into v_team
  from teams
  where join_code = upper(trim(p_code));

  if v_team.id is null then
    raise exception 'invalid join code';
  end if;

  insert into team_members (team_id, user_id, role)
  values (v_team.id, v_uid, 'member');

  delete from teammate_listings where user_id = v_uid;

  return v_team;
end;
$$;

revoke all on function public.join_team_by_code(text) from public;
grant execute on function public.join_team_by_code(text) to authenticated;
