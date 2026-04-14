-- Desacopla o canal de denúncias do status de coleta do diagnóstico.
-- active = diagnóstico; whistleblower_enabled = canal de denúncias.

alter table public.tenant_registry
  add column if not exists whistleblower_enabled boolean not null default true;

comment on column public.tenant_registry.whistleblower_enabled is 'true = empresa aparece no canal de denúncias; false = canal desativado para o tenant.';

drop function if exists public.upsert_tenant_registry(text, text, boolean, text, jsonb, text, jsonb);
create or replace function public.upsert_tenant_registry(
  p_tenant_id text,
  p_display_name text default null,
  p_active boolean default true,
  p_cnpj text default null,
  p_cnpjs jsonb default '[]'::jsonb,
  p_nicho text default null,
  p_setores jsonb default '[]'::jsonb,
  p_whistleblower_enabled boolean default true
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso negado: apenas administradores podem alterar o registro de empresas.';
  end if;

  insert into public.tenant_registry (
    tenant_id,
    display_name,
    active,
    cnpj,
    cnpjs,
    nicho,
    setores,
    whistleblower_enabled
  )
  values (
    lower(trim(p_tenant_id)),
    nullif(trim(p_display_name), ''),
    coalesce(p_active, true),
    nullif(trim(p_cnpj), ''),
    coalesce(p_cnpjs, '[]'::jsonb),
    nullif(trim(p_nicho), ''),
    coalesce(p_setores, '[]'::jsonb),
    coalesce(p_whistleblower_enabled, true)
  )
  on conflict (tenant_id) do update
  set
    display_name = excluded.display_name,
    active = excluded.active,
    cnpj = excluded.cnpj,
    cnpjs = excluded.cnpjs,
    nicho = excluded.nicho,
    setores = excluded.setores,
    whistleblower_enabled = excluded.whistleblower_enabled;
end;
$$;

grant execute on function public.upsert_tenant_registry(text, text, boolean, text, jsonb, text, jsonb, boolean) to authenticated;

create or replace function public.search_organizations(p_query text)
returns table(tenant_id text, display_name text)
language sql
security definer
set search_path = public
as $$
  with q as (
    select left(trim(coalesce(p_query, '')), 80) as value
  )
  select t.tenant_id, t.display_name
  from public.tenant_registry t
  cross join q
  where t.whistleblower_enabled = true
    and length(q.value) >= 2
    and (
      t.display_name ilike '%' || q.value || '%'
      or t.tenant_id ilike '%' || q.value || '%'
    )
  order by
    case when t.display_name ilike q.value || '%' then 0 else 1 end,
    t.display_name nulls last,
    t.tenant_id
  limit 10;
$$;

grant execute on function public.search_organizations(text) to anon;

create or replace function public.guard_whistleblower_enabled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.tenant_registry t
    where t.tenant_id = lower(trim(new.tenant_id))
      and t.whistleblower_enabled = false
  ) then
    raise exception 'Canal de denúncias desativado para esta organização.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_whistleblower_enabled on public.whistleblower_reports;
create trigger trg_guard_whistleblower_enabled
before insert on public.whistleblower_reports
for each row
execute function public.guard_whistleblower_enabled();
