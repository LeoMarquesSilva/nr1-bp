-- Migração: adicione tenant_id se a tabela submissions já existir sem essa coluna.
-- Rode no SQL Editor apenas uma vez, se você criou a tabela antes da multi-tenant.

alter table public.submissions add column if not exists tenant_id text;

update public.submissions set tenant_id = 'default' where tenant_id is null;

alter table public.submissions alter column tenant_id set not null;

create index if not exists submissions_tenant_submitted_idx
  on public.submissions (tenant_id, submitted_at desc);

-- Lista de empresas para o seletor do dashboard
create or replace view public.tenant_list as
  select distinct tenant_id from public.submissions order by tenant_id;

grant select on public.tenant_list to anon;
