-- Execute no Supabase: SQL Editor → New query → Cole e rode.
-- Multi-tenant: cada empresa (cliente) tem um tenant_id; os dados não se misturam.

-- Tabela de envios do diagnóstico HSE-IT (com isolamento por tenant)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  setor text not null,
  funcao text not null default '',
  answers jsonb not null,
  submitted_at timestamptz not null default now()
);

-- Se a tabela já existir sem tenant_id, adicione a coluna e preencha com 'default':
-- alter table public.submissions add column if not exists tenant_id text;
-- update public.submissions set tenant_id = 'default' where tenant_id is null;
-- alter table public.submissions alter column tenant_id set not null;

-- Índices para listar por tenant e data
create index if not exists submissions_tenant_submitted_idx
  on public.submissions (tenant_id, submitted_at desc);

create index if not exists submissions_submitted_at_idx
  on public.submissions (submitted_at desc);

-- RLS: insert/select/delete por anon (a app filtra por tenant_id no código)
alter table public.submissions enable row level security;

drop policy if exists "Permitir insert anônimo (envio do formulário)" on public.submissions;
create policy "Permitir insert anônimo (envio do formulário)"
  on public.submissions for insert
  to anon
  with check (true);

drop policy if exists "Permitir select para leitura (admin na app)" on public.submissions;
create policy "Permitir select para leitura (admin na app)"
  on public.submissions for select
  to anon
  using (true);

drop policy if exists "Permitir delete para admin na app" on public.submissions;
create policy "Permitir delete para admin na app"
  on public.submissions for delete
  to anon
  using (true);

-- Lista de empresas (tenant_id distintos) para o seletor do dashboard
create or replace view public.tenant_list as
  select distinct tenant_id from public.submissions order by tenant_id;

grant select on public.tenant_list to anon;
