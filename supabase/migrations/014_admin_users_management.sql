-- Permitir que administradores leiam todos os usuários
drop policy if exists "users_select_admin" on public.users;
create policy "users_select_admin"
  on public.users for select
  to authenticated
  using (public.is_admin());

-- Substituir a política de update para garantir que um admin possa atualizar todos,
-- mas não possa desativar a si mesmo acidentalmente.
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_update_admin" on public.users;

create policy "users_update_admin_and_own"
  on public.users for update
  to authenticated
  using (auth.uid() = auth_id or public.is_admin())
  with check (
    (auth.uid() = auth_id and is_active = true) or
    (public.is_admin() and auth.uid() != auth_id)
  );
