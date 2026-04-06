-- Trilha de auditoria para ações críticas no painel administrativo.

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_auth_id uuid not null references auth.users(id) on delete cascade,
  tenant_id text null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

drop policy if exists admin_audit_insert_auth on public.admin_audit_log;
create policy admin_audit_insert_auth
  on public.admin_audit_log
  for insert
  to authenticated
  with check (auth.uid() = actor_auth_id);

drop policy if exists admin_audit_select_admin on public.admin_audit_log;
create policy admin_audit_select_admin
  on public.admin_audit_log
  for select
  to authenticated
  using (public.is_admin());

create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_tenant_idx on public.admin_audit_log (tenant_id);

