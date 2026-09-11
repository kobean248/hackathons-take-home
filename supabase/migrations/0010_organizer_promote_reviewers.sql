-- Allow organizers to promote/demote reviewers from the Reviewers panel.
-- Self-edits still cannot change role/email (protect_profile_columns from 0006).

create policy "Organizers can update profiles"
on public.profiles for update
to authenticated
using ( public.current_user_role() = 'organizer' )
with check ( public.current_user_role() = 'organizer' );
