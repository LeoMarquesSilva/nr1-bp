-- Múltiplos CNPJs por tenant (grupo de empresas).
alter table public.tenant_registry
  add column if not exists cnpjs jsonb not null default '[]'::jsonb;

comment on column public.tenant_registry.cnpjs is 'Lista de CNPJs adicionais (grupo de empresas). O campo cnpj continua sendo o CNPJ principal.';