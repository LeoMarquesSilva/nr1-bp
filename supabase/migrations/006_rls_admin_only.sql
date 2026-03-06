-- Segurança: apenas usuários com role admin (public.users) podem ler/excluir envios e alterar tenant_registry.
-- Função auxiliar e políticas RLS.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where auth_id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

-- submissions: manter insert para anon; select e delete apenas para admin autenticado
drop policy if exists "Permitir select para leitura (admin na app)" on public.submissions;
drop policy if exists "Permitir delete para admin na app" on public.submissions;

create policy "submissions_select_admin"
  on public.submissions for select
  to authenticated
  using (public.is_admin());

create policy "submissions_delete_admin"
  on public.submissions for delete
  to authenticated
  using (public.is_admin());

-- tenant_registry: select continua para anon (busca pública, getTenantStatus, getTenantDisplayName); write apenas admin
drop policy if exists "Permitir insert para anon (admin adiciona na lista)" on public.tenant_registry;
drop policy if exists "Permitir update para anon (admin edita/inativa)" on public.tenant_registry;
drop policy if exists "Permitir delete para anon (admin remove da lista)" on public.tenant_registry;

create policy "tenant_registry_insert_admin"
  on public.tenant_registry for insert
  to authenticated
  with check (public.is_admin());

create policy "tenant_registry_update_admin"
  on public.tenant_registry for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "tenant_registry_delete_admin"
  on public.tenant_registry for delete
  to authenticated
  using (public.is_admin());

-- Views: recriar com security_invoker para RLS de submissions valer ao consultar como authenticated
drop view if exists public.tenant_overview;
drop view if exists public.tenant_list;

create view public.tenant_list with (security_invoker = true) as
  select distinct tenant_id from public.submissions order by tenant_id;

create view public.tenant_overview with (security_invoker = true) as
  select
    tenant_id,
    count(*)::int as submission_count,
    max(submitted_at) as last_submitted_at
  from public.submissions
  group by tenant_id;

grant select on public.tenant_list to anon, authenticated;
grant select on public.tenant_overview to anon, authenticated;
