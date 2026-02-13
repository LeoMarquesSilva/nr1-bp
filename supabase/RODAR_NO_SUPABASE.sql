-- ============================================================
-- Cole este bloco no Supabase: SQL Editor → New query → Run
-- Use quando a tabela submissions JÁ EXISTE mas SEM a coluna tenant_id
-- ============================================================

-- 1) Adicionar coluna tenant_id
alter table public.submissions add column if not exists tenant_id text;

-- 2) Preencher registros antigos com 'default' (ficam como uma única “empresa”)
update public.submissions set tenant_id = 'default' where tenant_id is null;

-- 3) Tornar a coluna obrigatória
alter table public.submissions alter column tenant_id set not null;

-- 4) Índice para o dashboard (filtrar por empresa + data)
create index if not exists submissions_tenant_submitted_idx
  on public.submissions (tenant_id, submitted_at desc);

-- 5) View para o seletor de empresas no dashboard
create or replace view public.tenant_list as
  select distinct tenant_id from public.submissions order by tenant_id;

grant select on public.tenant_list to anon;
