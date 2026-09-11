-- Public aggregate stats for the pre-auth landing strip.
-- Returns counts only (no PII). Callable by anon + authenticated.
create or replace function public.portal_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'applications', (
      select count(*)::int from applications where status <> 'draft'
    ),
    'schools', (
      select count(distinct form_data->>'school')::int
      from applications
      where type = 'hacker'
        and coalesce(form_data->>'school', '') <> ''
    ),
    'reviews', (
      select count(*)::int from reviews
    ),
    'accepted', (
      select count(*)::int from applications where status = 'accepted'
    )
  );
$$;

revoke all on function public.portal_stats() from public;
grant execute on function public.portal_stats() to anon, authenticated;
