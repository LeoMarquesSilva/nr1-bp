-- Migration 017: Allow anonymous (and authenticated) INSERT on whistleblower_reports so the
-- denúncia form can be submitted without login (e.g. incognito / shared link).

drop policy if exists "whistleblower_insert_auth" on public.whistleblower_reports;

create policy "whistleblower_insert_anon"
  on public.whistleblower_reports for insert
  to anon
  with check (true);

create policy "whistleblower_insert_auth"
  on public.whistleblower_reports for insert
  to authenticated
  with check (true);
