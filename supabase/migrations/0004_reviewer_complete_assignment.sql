-- 0001 only let organizers update review_assignments. Submitting a review
-- now also marks the reviewer's own assignment completed (see
-- submitReview in app/organizer/applications/actions.ts), which needs the
-- reviewer to be able to update that one column on their own row.
create policy "Reviewers can mark their own assignment completed"
on review_assignments for update
to authenticated
using ( reviewer_id = auth.uid() )
with check ( reviewer_id = auth.uid() );
