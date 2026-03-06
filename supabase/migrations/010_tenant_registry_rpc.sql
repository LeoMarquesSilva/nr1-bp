-- Escrever em tenant_registry via RPC (SECURITY DEFINER) para evitar 403 com RLS.
-- A função verifica is_admin() e executa o write como definer; políticas permitem o definer.
-- Se der erro de role "postgres" não existir, troque "postgres" pelo owner do seu projeto (ex.: supabase_admin).

-- 1) Políticas para o role postgres (owner típico no Supabase) poder inserir/atualizar/excluir.
--    Assim a RPC, rodando como postgres, consegue fazer o upsert/delete após checar is_admin().
drop policy if exists "tenant_registry_insert_via_rpc" on public.tenant_registry;
drop policy if exists "tenant_registry_update_via_rpc" on public.tenant_registry;
drop policy if exists "tenant_registry_delete_via_rpc" on public.tenant_registry;

create policy "tenant_registry_insert_via_rpc"
  on public.tenant_registry for insert to postgres with check (true);

create policy "tenant_registry_update_via_rpc"
  on public.tenant_registry for update to postgres using (true) with check (true);

create policy "tenant_registry_delete_via_rpc"
  on public.tenant_registry for delete to postgres using (true);

-- 2) Função de upsert: só executa se is_admin() for true.
create or replace function public.upsert_tenant_registry(
  p_tenant_id text,
  p_display_name text default null,
  p_active boolean default true,
  p_cnpj text default null,
  p_cnpjs jsonb default '[]'::jsonb,
  p_nicho text default null,
  p_setores jsonb default '[]'::jsonb
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
  insert into public.tenant_registry (tenant_id, display_name, active, cnpj, cnpjs, nicho, setores)
  values (
    lower(trim(p_tenant_id)),
    nullif(trim(p_display_name), ''),
    coalesce(p_active, true),
    nullif(trim(p_cnpj), ''),
    coalesce(p_cnpjs, '[]'::jsonb),
    nullif(trim(p_nicho), ''),
    coalesce(p_setores, '[]'::jsonb)
  )
  on conflict (tenant_id) do update set
    display_name = excluded.display_name,
    active = excluded.active,
    cnpj = excluded.cnpj,
    cnpjs = excluded.cnpjs,
    nicho = excluded.nicho,
    setores = excluded.setores;
end;
$$;

-- 3) Função de delete: só executa se is_admin() for true.
create or replace function public.delete_tenant_registry(p_tenant_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso negado: apenas administradores podem remover empresas do registro.';
  end if;
  delete from public.tenant_registry where tenant_id = lower(trim(p_tenant_id));
end;
$$;

grant execute on function public.upsert_tenant_registry(text, text, boolean, text, jsonb, text, jsonb) to authenticated;
grant execute on function public.delete_tenant_registry(text) to authenticated;
