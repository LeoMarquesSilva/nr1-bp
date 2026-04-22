-- Logomarca por empresa (URL externa ou link público do Storage) + bucket público para upload no admin.

alter table public.tenant_registry
  add column if not exists logo_url text null;

comment on column public.tenant_registry.logo_url is 'URL HTTPS da logomarca (externa ou getPublicUrl do bucket tenant-logos).';

-- Bucket público para leitura; escrita apenas admin (políticas abaixo).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-logos',
  'tenant-logos',
  true,
  2097152,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "tenant_logos_select_anon" on storage.objects;
create policy "tenant_logos_select_anon"
  on storage.objects for select
  to anon
  using (bucket_id = 'tenant-logos');

drop policy if exists "tenant_logos_select_authenticated" on storage.objects;
create policy "tenant_logos_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'tenant-logos');

drop policy if exists "tenant_logos_insert_admin" on storage.objects;
create policy "tenant_logos_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'tenant-logos'
    and public.is_admin() = true
  );

drop policy if exists "tenant_logos_update_admin" on storage.objects;
create policy "tenant_logos_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'tenant-logos' and public.is_admin() = true)
  with check (bucket_id = 'tenant-logos' and public.is_admin() = true);

drop policy if exists "tenant_logos_delete_admin" on storage.objects;
create policy "tenant_logos_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'tenant-logos' and public.is_admin() = true);

-- RPC: branding para páginas públicas (hub denúncia, etc.)
create or replace function public.get_tenant_public_branding(p_tenant_id text)
returns table(display_name text, logo_url text)
language sql
security definer
set search_path = public
stable
as $$
  select t.display_name, t.logo_url
  from public.tenant_registry t
  where t.tenant_id = lower(trim(coalesce(p_tenant_id, '')))
  limit 1;
$$;

grant execute on function public.get_tenant_public_branding(text) to anon, authenticated;

-- Busca pública: inclui logo (DROP: retorno muda de 2 para 3 colunas; CREATE OR REPLACE não basta)
drop function if exists public.search_organizations(text);

create or replace function public.search_organizations(p_query text)
returns table(tenant_id text, display_name text, logo_url text)
language sql
security definer
set search_path = public
as $$
  with q as (
    select left(trim(coalesce(p_query, '')), 80) as value
  )
  select t.tenant_id, t.display_name, t.logo_url
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

-- upsert com logo
drop function if exists public.upsert_tenant_registry(text, text, boolean, text, jsonb, text, jsonb, boolean);
create or replace function public.upsert_tenant_registry(
  p_tenant_id text,
  p_display_name text default null,
  p_active boolean default true,
  p_cnpj text default null,
  p_cnpjs jsonb default '[]'::jsonb,
  p_nicho text default null,
  p_setores jsonb default '[]'::jsonb,
  p_whistleblower_enabled boolean default true,
  p_logo_url text default null
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
    whistleblower_enabled,
    logo_url
  )
  values (
    lower(trim(p_tenant_id)),
    nullif(trim(p_display_name), ''),
    coalesce(p_active, true),
    nullif(trim(p_cnpj), ''),
    coalesce(p_cnpjs, '[]'::jsonb),
    nullif(trim(p_nicho), ''),
    coalesce(p_setores, '[]'::jsonb),
    coalesce(p_whistleblower_enabled, true),
    nullif(trim(p_logo_url), '')
  )
  on conflict (tenant_id) do update
  set
    display_name = excluded.display_name,
    active = excluded.active,
    cnpj = excluded.cnpj,
    cnpjs = excluded.cnpjs,
    nicho = excluded.nicho,
    setores = excluded.setores,
    whistleblower_enabled = excluded.whistleblower_enabled,
    logo_url = excluded.logo_url;
end;
$$;

grant execute on function public.upsert_tenant_registry(text, text, boolean, text, jsonb, text, jsonb, boolean, text) to authenticated;
