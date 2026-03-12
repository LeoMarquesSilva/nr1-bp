-- Migration 016: Allow anonymous (and authenticated) INSERT on submissions so the
-- diagnostic form can be submitted without login (e.g. incognito / shared link).

drop policy if exists "submissions_insert_auth" on public.submissions;

create policy "submissions_insert_anon"
  on public.submissions for insert
  to anon
  with check (true);

create policy "submissions_insert_auth"
  on public.submissions for insert
  to authenticated
  with check (true);
