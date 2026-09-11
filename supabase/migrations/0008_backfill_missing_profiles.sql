-- Fixes a real prod data gap: users who signed up before migration 0001's
-- handle_new_user trigger existed on this project have no profiles row at
-- all. Since applications.applicant_id (and every other user-scoped table)
-- has a foreign key to profiles(id), those accounts can't submit an
-- application, join a team, or do anything else that touches the schema —
-- every insert fails on the FK constraint. This backfills them and hardens
-- the trigger so the same gap can't reopen if it's ever called twice for
-- the same user (e.g. a retried webhook).

insert into public.profiles (id, email, role)
select u.id, u.email, 'applicant'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'applicant')
  on conflict (id) do nothing;
  return new;
end;
$$;
