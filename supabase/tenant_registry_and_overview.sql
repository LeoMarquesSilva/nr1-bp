-- Cole no Supabase → SQL Editor → Run
-- Tabela de links gerados (admin) + view com contagem de respostas por empresa

-- Links/empresas que o admin adicionou à lista
create table if not exists public.tenant_registry (
  tenant_id text primary key,
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.tenant_registry enable row level security;

create policy "Permitir select para anon (dashboard)"
  on public.tenant_registry for select to anon using (true);

create policy "Permitir insert para anon (admin adiciona na lista)"
  on public.tenant_registry for insert to anon with check (true);

create policy "Permitir update para anon (admin edita/inativa)"
  on public.tenant_registry for update to anon using (true);

create policy "Permitir delete para anon (admin remove da lista)"
  on public.tenant_registry for delete to anon using (true);

-- Visão: por empresa, total de respostas e data da última
create or replace view public.tenant_overview as
  select
    tenant_id,
    count(*)::int as submission_count,
    max(submitted_at) as last_submitted_at
  from public.submissions
  group by tenant_id;

grant select on public.tenant_overview to anon;
