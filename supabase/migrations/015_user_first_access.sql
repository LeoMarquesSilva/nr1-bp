-- Adicionar a coluna requires_password_change na tabela public.users
alter table public.users
add column if not exists requires_password_change boolean not null default true;

-- Comentar sobre a utilidade da coluna
comment on column public.users.requires_password_change is 'Indica se o usuário precisa trocar a senha no próximo login.';