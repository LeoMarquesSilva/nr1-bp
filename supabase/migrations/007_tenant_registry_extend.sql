-- Estender tenant_registry com dados para formulário por empresa: cnpj, nicho, setores (opções do dropdown).

alter table public.tenant_registry
  add column if not exists cnpj text,
  add column if not exists nicho text,
  add column if not exists setores jsonb not null default '[]'::jsonb;

comment on column public.tenant_registry.setores is 'Array de strings: opções de setor para o formulário de diagnóstico desta empresa. Se vazio, usa lista padrão.';
