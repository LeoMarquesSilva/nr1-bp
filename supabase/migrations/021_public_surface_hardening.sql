-- Hardening superfícies públicas: busca, consulta de protocolo e upload de evidências.

-- 1) Busca pública mais restrita para reduzir enumeração.
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
  where t.active = true
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

-- 2) Consulta pública de protocolo apenas para formato válido WB-XXXXXXXX.
create or replace function public.get_whistleblower_status(p_protocol_id text)
returns table(status text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select w.status, w.created_at
  from public.whistleblower_reports w
  where trim(coalesce(p_protocol_id, '')) ~ '^WB-[A-Z0-9]{8}$'
    and w.protocol_id = upper(trim(p_protocol_id))
  limit 1;
$$;

grant execute on function public.get_whistleblower_status(text) to anon;

-- 3) Upload público endurecido: bucket + padrão de caminho esperado pela aplicação.
drop policy if exists "whistleblower_evidence_insert_anon" on storage.objects;
create policy "whistleblower_evidence_insert_anon"
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'whistleblower-evidence'
    and name ~ '^[a-z0-9-]+/WB-[A-Z0-9]{8}/[0-9]{13}_[A-Za-z0-9._-]{1,120}$'
  );

drop policy if exists "whistleblower_evidence_insert_auth" on storage.objects;
create policy "whistleblower_evidence_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'whistleblower-evidence'
    and name ~ '^[a-z0-9-]+/WB-[A-Z0-9]{8}/[0-9]{13}_[A-Za-z0-9._-]{1,120}$'
  );

