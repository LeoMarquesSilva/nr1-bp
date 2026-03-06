-- Permitir que admins (authenticated + is_admin()) leiam tenant_registry.
-- Sem isso, getTenantRegistry() retorna vazio quando o usuário está logado e a lista não aparece.
grant select on public.tenant_registry to authenticated;

create policy "tenant_registry_select_admin"
  on public.tenant_registry for select
  to authenticated
  using (public.is_admin());
