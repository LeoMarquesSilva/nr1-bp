-- Busca pública de organizações (para a página "Fazer relato" → selecionar empresa).
-- Retorna apenas tenant_id e display_name para organizações ativas que coincidem com a busca.

create or replace function public.search_organizations(p_query text)
returns table(tenant_id text, display_name text)
language sql
security definer
set search_path = public
as $$
  select t.tenant_id, t.display_name
  from public.tenant_registry t
  where t.active = true
    and trim(coalesce(p_query, '')) <> ''
    and (
      t.display_name ilike '%' || trim(p_query) || '%'
      or t.tenant_id ilike '%' || trim(p_query) || '%'
    )
  order by
    case when t.display_name ilike trim(p_query) || '%' then 0 else 1 end,
    t.display_name nulls last,
    t.tenant_id
  limit 25;
$$;

grant execute on function public.search_organizations(text) to anon;
