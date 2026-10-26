-- Pesquisa interna de Diversidade e Inclusão (D&I): anônima, por tenant.
-- di_survey_enabled = pesquisa aberta para respostas (fechada por padrão).
-- As respostas não guardam horário, setor nem identificação: apenas a data do envio
-- (fuso de Brasília), para que o momento do envio não ajude a identificar quem respondeu.

-- 1) Abrir/fechar a pesquisa por empresa
alter table public.tenant_registry
  add column if not exists di_survey_enabled boolean not null default false;

comment on column public.tenant_registry.di_survey_enabled is 'true = pesquisa de Diversidade e Inclusão aberta para respostas; false = fechada.';

-- 2) Respostas
create table if not exists public.di_survey_responses (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  answers jsonb not null,
  submitted_on date not null default (now() at time zone 'America/Sao_Paulo')::date,
  constraint di_survey_responses_answers_object check (jsonb_typeof(answers) = 'object'),
  constraint di_survey_responses_answers_size check (pg_column_size(answers) <= 16384)
);

create index if not exists di_survey_responses_tenant_id_idx on public.di_survey_responses (tenant_id);

alter table public.di_survey_responses enable row level security;

grant insert on public.di_survey_responses to anon, authenticated;
grant select, delete on public.di_survey_responses to authenticated;

-- Envio anônimo pelo link da pesquisa (o trigger abaixo bloqueia quando a pesquisa está fechada)
drop policy if exists "di_survey_insert_anon" on public.di_survey_responses;
create policy "di_survey_insert_anon"
  on public.di_survey_responses for insert
  to anon
  with check (true);

drop policy if exists "di_survey_insert_auth" on public.di_survey_responses;
create policy "di_survey_insert_auth"
  on public.di_survey_responses for insert
  to authenticated
  with check (true);

-- Leitura e exclusão apenas para admin
drop policy if exists "di_survey_select_admin" on public.di_survey_responses;
create policy "di_survey_select_admin"
  on public.di_survey_responses for select
  to authenticated
  using (public.is_admin());

drop policy if exists "di_survey_delete_admin" on public.di_survey_responses;
create policy "di_survey_delete_admin"
  on public.di_survey_responses for delete
  to authenticated
  using (public.is_admin());

-- 3) Guarda no insert: pesquisa precisa estar aberta; data sempre definida pelo servidor
create or replace function public.guard_di_survey_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.tenant_id := lower(trim(new.tenant_id));
  new.submitted_on := (now() at time zone 'America/Sao_Paulo')::date;

  if not exists (
    select 1
    from public.tenant_registry t
    where t.tenant_id = new.tenant_id
      and t.di_survey_enabled = true
  ) then
    raise exception 'Pesquisa de diversidade e inclusão encerrada para esta organização.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_di_survey_response on public.di_survey_responses;
create trigger trg_guard_di_survey_response
before insert on public.di_survey_responses
for each row
execute function public.guard_di_survey_response();

-- 4) Status público (página da pesquisa), sem depender de select anônimo em tenant_registry
create or replace function public.get_di_survey_status(p_tenant_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select t.di_survey_enabled
      from public.tenant_registry t
      where t.tenant_id = lower(trim(coalesce(p_tenant_id, '')))
      limit 1
    ),
    false
  );
$$;

grant execute on function public.get_di_survey_status(text) to anon, authenticated;
