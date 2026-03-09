-- Migration 013: Fix RLS inserts and secure whistleblower_reports

-- For submissions: allow authenticated users (like admins) to insert (to test form while logged in)
drop policy if exists "submissions_insert_auth" on public.submissions;
create policy "submissions_insert_auth"
  on public.submissions for insert
  to authenticated
  with check (true);

-- For whistleblower_reports: allow authenticated to insert
drop policy if exists "whistleblower_insert_auth" on public.whistleblower_reports;
create policy "whistleblower_insert_auth"
  on public.whistleblower_reports for insert
  to authenticated
  with check (true);

-- Drop old insecure policies on whistleblower_reports
drop policy if exists "Permitir select para anon (admin lê)" on public.whistleblower_reports;
drop policy if exists "Permitir update para anon (admin marca como lida)" on public.whistleblower_reports;

-- Add secure policies for admins on whistleblower_reports
drop policy if exists "whistleblower_select_admin" on public.whistleblower_reports;
create policy "whistleblower_select_admin"
  on public.whistleblower_reports for select
  to authenticated
  using (public.is_admin());

drop policy if exists "whistleblower_update_admin" on public.whistleblower_reports;
create policy "whistleblower_update_admin"
  on public.whistleblower_reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "whistleblower_delete_admin" on public.whistleblower_reports;
create policy "whistleblower_delete_admin"
  on public.whistleblower_reports for delete
  to authenticated
  using (public.is_admin());
