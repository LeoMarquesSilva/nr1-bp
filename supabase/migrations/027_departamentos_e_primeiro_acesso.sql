-- 027: Departamentos em lista fixa (sem campo livre) e troca de senha obrigatória garantida pelo banco.
--
-- Departamentos: users.department passa a referenciar departments(name). Renomear um departamento
-- atualiza as pessoas (on update cascade); excluir só é possível sem ninguém vinculado (restrict).
--
-- Primeiro acesso: enquanto users.requires_password_change = true, a pessoa não é considerada admin
-- (is_admin() falso), então não enxerga dados. A flag só cai quando a senha é de fato trocada no
-- Supabase Auth (gatilho em auth.users); ninguém consegue desligá-la manualmente.

-- 1) Departamentos -----------------------------------------------------------------------------

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint departments_name_format check (name = trim(name) and length(name) between 2 and 80)
);

create unique index if not exists departments_name_lower_idx on public.departments (lower(name));

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_departments on public.departments;
create trigger trg_touch_departments
before update on public.departments
for each row execute function public.touch_updated_at();

alter table public.departments enable row level security;
grant select, insert, update, delete on public.departments to authenticated;

drop policy if exists "departments_select_admin" on public.departments;
create policy "departments_select_admin" on public.departments for select to authenticated using (public.is_admin());
drop policy if exists "departments_insert_admin" on public.departments;
create policy "departments_insert_admin" on public.departments for insert to authenticated with check (public.is_admin());
drop policy if exists "departments_update_admin" on public.departments;
create policy "departments_update_admin" on public.departments for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "departments_delete_admin" on public.departments;
create policy "departments_delete_admin" on public.departments for delete to authenticated using (public.is_admin());

-- Departamentos padrão: as áreas do escritório (mesmas do ORQESTRAI)
insert into public.departments (name)
select v.name
from (values
  ('Cível'),
  ('Geral'),
  ('Institucional'),
  ('Marketing'),
  ('Operações Legais'),
  ('Recuperação de Crédito'),
  ('Recursos Humanos'),
  ('Reestruturação'),
  ('Societário e Contratos'),
  ('Sócio'),
  ('Trabalhista')
) as v(name)
where not exists (select 1 from public.departments d where lower(d.name) = lower(v.name));

-- Valores já usados por alguém e que não estão na lista viram departamentos (nada se perde)
insert into public.departments (name)
select distinct trim(u.department)
from public.users u
where u.department is not null
  and length(trim(u.department)) >= 2
  and not exists (select 1 from public.departments d where lower(d.name) = lower(trim(u.department)));

-- Ajusta grafia para a do cadastro e limpa vazios
update public.users u
set department = d.name
from public.departments d
where u.department is not null
  and lower(trim(u.department)) = lower(d.name)
  and u.department <> d.name;

update public.users set department = null where department is not null and length(trim(department)) < 2;

alter table public.users drop constraint if exists users_department_fkey;
alter table public.users
  add constraint users_department_fkey foreign key (department)
  references public.departments (name) on update cascade on delete restrict;

-- 2) Primeiro acesso: troca de senha obrigatória ------------------------------------------------

-- Admin só vale depois de trocar a senha provisória
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
      and requires_password_change = false
  );
$$;

-- Quando a senha muda no Supabase Auth, libera o acesso
create or replace function public.handle_auth_password_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('confiara.password_changed', 'on', true);
  update public.users
  set requires_password_change = false
  where auth_id = new.id and requires_password_change = true;
  -- A liberação vale só para o update acima, não para o resto da transação
  perform set_config('confiara.password_changed', '', true);
  return new;
end;
$$;

drop trigger if exists trg_confiara_password_changed on auth.users;
create trigger trg_confiara_password_changed
after update of encrypted_password on auth.users
for each row
when (old.encrypted_password is distinct from new.encrypted_password)
execute function public.handle_auth_password_change();

-- Ninguém desliga a obrigação "na mão": só a troca real de senha (gatilho acima)
create or replace function public.guard_users_password_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.requires_password_change = true
     and new.requires_password_change = false
     and coalesce(current_setting('confiara.password_changed', true), '') <> 'on' then
    raise exception 'A senha provisória só deixa de valer quando a própria pessoa cria uma nova senha.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_users_password_flag on public.users;
create trigger trg_guard_users_password_flag
before update on public.users
for each row execute function public.guard_users_password_flag();
