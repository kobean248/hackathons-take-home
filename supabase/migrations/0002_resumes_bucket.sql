-- Private bucket for hacker resumes. Not public — every read goes through
-- either the owner's own RLS grant or a short-lived signed URL requested by
-- an organizer (also RLS-gated below), never a public URL.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Files are stored at "<applicant_id>/resume.pdf" — foldername(name)[1] is
-- the applicant_id segment, so these policies scope every operation to the
-- caller's own folder.
create policy "Applicants can upload their own resume"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Applicants can replace their own resume"
on storage.objects for update
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Applicants can view their own resume"
on storage.objects for select
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Organizers can view all resumes"
on storage.objects for select
to authenticated
using (
  bucket_id = 'resumes'
  and public.current_user_role() = 'organizer'
);
