-- Tabela de perfis de administradores (vinculada ao Supabase Auth).
-- auth_id = id do usuário em auth.users.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  department text,
  role text not null default 'admin',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(auth_id)
);

create index if not exists users_auth_id_idx on public.users(auth_id);
create index if not exists users_email_idx on public.users(email);

alter table public.users enable row level security;

-- Usuário autenticado pode ler e atualizar apenas o próprio registro.
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = auth_id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

-- Inserção em public.users é feita via service_role (script ou Dashboard), não pelo anon.
comment on table public.users is 'Perfis de administradores vinculados ao Supabase Auth.';
