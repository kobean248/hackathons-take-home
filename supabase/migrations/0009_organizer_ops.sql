-- Organizer ops: reviewer recusal, high-variance (tiebreaker) view,
-- and activity helpers. Recused reviews are excluded from normalized
-- averages so COI scores don't pollute ranking.

-- ---------- Recusal on the assignment row ----------
alter table review_assignments
  add column if not exists recused_at timestamptz,
  add column if not exists recusal_note text;

comment on column review_assignments.recused_at is
  'When set, the reviewer has declared a conflict of interest and is pulled from this app''s queue; their review (if any) is excluded from normalized averages.';

-- Reviewers already have an UPDATE policy on their own assignment rows
-- (0004). No extra policy needed for recusal.

-- ---------- Normalized scores exclude recused reviewers ----------
drop view if exists normalized_reviews;

create view normalized_reviews
  with (security_invoker = true)
as
with eligible as (
  select r.*
  from reviews r
  where not exists (
    select 1
    from review_assignments ra
    where ra.application_id = r.application_id
      and ra.reviewer_id = r.reviewer_id
      and ra.recused_at is not null
  )
)
select
  e.*,
  (e.raw_total - avg(e.raw_total) over (partition by e.reviewer_id))
    / nullif(stddev(e.raw_total) over (partition by e.reviewer_id), 0)
    as z_score
from eligible e;

grant select on normalized_reviews to authenticated;

-- ---------- High-variance / tiebreaker flag ----------
-- Applications where eligible reviewers' z-scores disagree sharply
-- (max − min > 1.5) and at least two reviews exist.
create or replace view application_score_disagreement
  with (security_invoker = true)
as
select
  application_id,
  count(*)::int as review_count,
  round((max(z_score) - min(z_score))::numeric, 3) as z_spread,
  round(avg(z_score)::numeric, 3) as z_avg,
  round(stddev(z_score)::numeric, 3) as z_stddev
from normalized_reviews
where z_score is not null
group by application_id
having count(*) >= 2
   and (max(z_score) - min(z_score)) > 1.5;

grant select on application_score_disagreement to authenticated;

-- ---------- Unified activity feed (status + reviews + recusals) ----------
create or replace view application_activity
  with (security_invoker = true)
as
select
  h.id::text as event_id,
  h.application_id,
  'status_change'::text as kind,
  h.changed_at as occurred_at,
  h.changed_by as actor_id,
  h.status::text as detail,
  h.note
from application_status_history h
union all
select
  r.id::text,
  r.application_id,
  'review'::text,
  r.submitted_at,
  r.reviewer_id,
  ('raw_total=' || r.raw_total::text),
  r.comments
from reviews r
where not exists (
  select 1 from review_assignments ra
  where ra.application_id = r.application_id
    and ra.reviewer_id = r.reviewer_id
    and ra.recused_at is not null
)
union all
select
  ra.id::text,
  ra.application_id,
  'recusal'::text,
  ra.recused_at,
  ra.reviewer_id,
  'conflict_of_interest',
  ra.recusal_note
from review_assignments ra
where ra.recused_at is not null;

grant select on application_activity to authenticated;
