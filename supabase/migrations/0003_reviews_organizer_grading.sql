-- The grading panel (Prompt 13) is visible to both reviewers and
-- organizers, but 0001's reviews policies only let a reviewer insert/update
-- their own review, and only for applications they have a review_assignments
-- row for. Organizers should be able to grade directly too, without needing
-- to be formally assigned first. Additive only — reviewers' existing path
-- through review_assignments is untouched; these are extra permissive
-- policies that OR with the ones already in 0001.
create policy "Organizers can insert reviews"
on reviews for insert
to authenticated
with check ( public.current_user_role() = 'organizer' );

create policy "Organizers can update any review"
on reviews for update
to authenticated
using ( public.current_user_role() = 'organizer' )
with check ( public.current_user_role() = 'organizer' );
