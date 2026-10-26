-- 026: Motor de pesquisas internas (modelos, pesquisas por empresa e respostas anônimas).
-- Substitui a estrutura específica da pesquisa de Diversidade e Inclusão (025), que estava vazia:
-- a D&I passa a ser um modelo embutido, e cada empresa cria pesquisas a partir dele.
-- Regras: perguntas e mínimo de respostas travam quando a pesquisa abre; respostas guardam só a data.

-- 1) Remove a estrutura da 025 (protegido: só remove se não houver respostas)
do $$
begin
  if to_regclass('public.di_survey_responses') is not null
     and exists (select 1 from public.di_survey_responses) then
    raise exception 'di_survey_responses tem respostas; migre os dados antes de remover.';
  end if;
end
$$;

drop table if exists public.di_survey_responses;
drop function if exists public.guard_di_survey_response();
drop function if exists public.get_di_survey_status(text);
alter table public.tenant_registry drop column if exists di_survey_enabled;

-- 2) Modelos de pesquisa
create table if not exists public.survey_templates (
  id uuid primary key default gen_random_uuid(),
  key text unique,
  name text not null check (length(trim(name)) between 1 and 120),
  description text,
  intro text,
  questions jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array'),
  builtin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Pesquisas por empresa
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  title text not null check (length(trim(title)) between 1 and 120),
  intro text,
  questions jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array'),
  status text not null default 'rascunho' check (status in ('rascunho', 'aberta', 'encerrada')),
  min_responses int not null default 5 check (min_responses between 3 and 50),
  template_id uuid references public.survey_templates(id) on delete set null,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  opened_at timestamptz,
  closed_at timestamptz
);

create index if not exists surveys_tenant_id_idx on public.surveys (tenant_id);

-- 4) Respostas (anônimas: sem horário nem identificação)
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  answers jsonb not null,
  submitted_on date not null default (now() at time zone 'America/Sao_Paulo')::date,
  constraint survey_responses_answers_object check (jsonb_typeof(answers) = 'object'),
  constraint survey_responses_answers_size check (pg_column_size(answers) <= 32768)
);

create index if not exists survey_responses_survey_id_idx on public.survey_responses (survey_id);

-- 5) Acesso: só admin gerencia modelos e pesquisas; anônimo só envia resposta
alter table public.survey_templates enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_responses enable row level security;

grant select, insert, update, delete on public.survey_templates to authenticated;
grant select, insert, update, delete on public.surveys to authenticated;
grant insert on public.survey_responses to anon, authenticated;
grant select, delete on public.survey_responses to authenticated;

drop policy if exists "survey_templates_select_admin" on public.survey_templates;
create policy "survey_templates_select_admin" on public.survey_templates for select to authenticated using (public.is_admin());
drop policy if exists "survey_templates_insert_admin" on public.survey_templates;
create policy "survey_templates_insert_admin" on public.survey_templates for insert to authenticated with check (public.is_admin() and not builtin);
drop policy if exists "survey_templates_update_admin" on public.survey_templates;
create policy "survey_templates_update_admin" on public.survey_templates for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "survey_templates_delete_admin" on public.survey_templates;
create policy "survey_templates_delete_admin" on public.survey_templates for delete to authenticated using (public.is_admin() and not builtin);

drop policy if exists "surveys_select_admin" on public.surveys;
create policy "surveys_select_admin" on public.surveys for select to authenticated using (public.is_admin());
drop policy if exists "surveys_insert_admin" on public.surveys;
create policy "surveys_insert_admin" on public.surveys for insert to authenticated with check (public.is_admin());
drop policy if exists "surveys_update_admin" on public.surveys;
create policy "surveys_update_admin" on public.surveys for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "surveys_delete_admin" on public.surveys;
create policy "surveys_delete_admin" on public.surveys for delete to authenticated using (public.is_admin());

drop policy if exists "survey_responses_insert_anon" on public.survey_responses;
create policy "survey_responses_insert_anon" on public.survey_responses for insert to anon with check (true);
drop policy if exists "survey_responses_insert_auth" on public.survey_responses;
create policy "survey_responses_insert_auth" on public.survey_responses for insert to authenticated with check (true);
drop policy if exists "survey_responses_select_admin" on public.survey_responses;
create policy "survey_responses_select_admin" on public.survey_responses for select to authenticated using (public.is_admin());
drop policy if exists "survey_responses_delete_admin" on public.survey_responses;
create policy "survey_responses_delete_admin" on public.survey_responses for delete to authenticated using (public.is_admin());

-- 6) Regras de ciclo de vida
create or replace function public.touch_survey_template()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_survey_template on public.survey_templates;
create trigger trg_touch_survey_template
before update on public.survey_templates
for each row execute function public.touch_survey_template();

create or replace function public.guard_survey()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.tenant_id := lower(trim(new.tenant_id));

  if tg_op = 'INSERT' then
    -- Toda pesquisa nasce como rascunho
    new.status := 'rascunho';
    new.opened_at := null;
    new.closed_at := null;
    return new;
  end if;

  if new.tenant_id <> old.tenant_id then
    raise exception 'Não é possível mover a pesquisa para outra empresa.';
  end if;

  if old.status <> 'rascunho'
     and (new.questions is distinct from old.questions or new.min_responses <> old.min_responses) then
    raise exception 'Perguntas e mínimo de respostas ficam travados depois que a pesquisa é aberta. Duplique a pesquisa para alterar.';
  end if;

  if new.status <> old.status then
    if new.status = 'rascunho' then
      raise exception 'Uma pesquisa que já foi aberta não volta a ser rascunho. Duplique-a para editar.';
    elsif new.status = 'aberta' then
      if jsonb_array_length(new.questions) = 0 then
        raise exception 'Adicione ao menos uma pergunta antes de abrir a pesquisa.';
      end if;
      new.opened_at := coalesce(old.opened_at, now());
      new.closed_at := null;
    elsif new.status = 'encerrada' then
      new.closed_at := now();
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_guard_survey on public.surveys;
create trigger trg_guard_survey
before insert or update on public.surveys
for each row execute function public.guard_survey();

create or replace function public.guard_survey_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.submitted_on := (now() at time zone 'America/Sao_Paulo')::date;
  if not exists (select 1 from public.surveys s where s.id = new.survey_id and s.status = 'aberta') then
    raise exception 'Esta pesquisa não está recebendo respostas.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_survey_response on public.survey_responses;
create trigger trg_guard_survey_response
before insert on public.survey_responses
for each row execute function public.guard_survey_response();

-- 7) Totais por pesquisa (RLS da tabela de respostas vale: só admin enxerga)
create or replace view public.survey_response_stats with (security_invoker = true) as
  select survey_id, count(*)::int as total, max(submitted_on) as last_on, min(submitted_on) as first_on
  from public.survey_responses
  group by survey_id;

grant select on public.survey_response_stats to authenticated;

-- 8) Página pública da pesquisa: devolve perguntas só quando aberta; rascunho não existe para o público
create or replace function public.get_public_survey(p_id uuid)
returns table(
  id uuid,
  tenant_id text,
  title text,
  intro text,
  questions jsonb,
  status text,
  min_responses int,
  org_name text,
  org_logo text,
  whistleblower_enabled boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    s.id,
    s.tenant_id,
    s.title,
    case when s.status = 'aberta' then s.intro end,
    case when s.status = 'aberta' then s.questions else '[]'::jsonb end,
    s.status,
    s.min_responses,
    t.display_name,
    t.logo_url,
    coalesce(t.whistleblower_enabled, false)
  from public.surveys s
  left join public.tenant_registry t on t.tenant_id = s.tenant_id
  where s.id = p_id
    and s.status in ('aberta', 'encerrada');
$$;

grant execute on function public.get_public_survey(uuid) to anon, authenticated;

-- 9) Modelos embutidos
insert into public.survey_templates (key, name, description, intro, questions, builtin)
values (
  'em-branco',
  'Em branco',
  'Comece do zero e monte suas próprias perguntas.',
  $intro$Esta pesquisa é anônima: não pedimos nome, e-mail, cargo nem setor, e as respostas são analisadas apenas em conjunto. Responda com sinceridade: não há respostas certas ou erradas.$intro$,
  '[]'::jsonb,
  true
)
on conflict (key) do nothing;

insert into public.survey_templates (key, name, description, intro, questions, builtin)
values (
  'diversidade-inclusao',
  $name$Diversidade e Inclusão$name$,
  $desc$Pesquisa interna com 12 perguntas para apoiar a criação do Comitê de Diversidade e Inclusão.$desc$,
  $intro$Esta pesquisa apoia a criação do Comitê de Diversidade e Inclusão. É anônima: não pedimos nome, e-mail, cargo nem setor, e as respostas são analisadas apenas em conjunto. Responda com sinceridade: não há respostas certas ou erradas.$intro$,
  $json$[{"id":"q1","type":"escala","text":"Sinto que posso ser eu mesmo(a) no escritório e que pertenço à equipe.","required":true,"allowNR":true},{"id":"q2","type":"escala","text":"Minha opinião é ouvida e considerada, independentemente do meu cargo ou perfil.","required":true,"allowNR":true},{"id":"q3","type":"frequencia","text":"Já presenciei ou vivenciei comentários, piadas ou comportamentos discriminatórios no escritório.","required":true,"allowNR":true,"canalHint":true},{"id":"q4","type":"escala","text":"Eu sei a quem recorrer e confio que haveria seriedade e sigilo se sofresse ou presenciasse discriminação ou assédio.","required":true,"allowNR":true},{"id":"q5","type":"escala","text":"Os critérios de promoção e crescimento são claros, e as oportunidades (casos relevantes, clientes, palestras, visibilidade) são distribuídas de forma justa.","required":true,"allowNR":true},{"id":"q6","type":"escala","text":"Todos os colaboradores têm as mesmas chances de chegar à liderança e à sociedade e são reconhecidos pela competência na mesma medida.","required":true,"allowNR":true},{"id":"q7","type":"escala","text":"Vejo no escritório pessoas com trajetória parecida com a minha em posições de liderança.","required":true,"allowNR":true},{"id":"q8","type":"escala","text":"O escritório oferece equilíbrio e flexibilidade suficientes para lidar com a vida pessoal e familiar, incluindo maternidade e paternidade, sem prejuízo para a carreira.","required":true,"allowNR":true},{"id":"q9","type":"aberta","text":"O que você entende por diversidade e inclusão no ambiente de trabalho?","required":false},{"id":"q10","type":"sim_nao","text":"Você entende que o escritório deveria ter um comitê de diversidade e inclusão?","required":true},{"id":"q11","type":"multipla","text":"Quais temas o comitê de diversidade e inclusão deve priorizar?","required":true,"options":[{"key":"genero","label":"Equidade de gênero e liderança feminina"},{"key":"raca","label":"Raça e etnia"},{"key":"lgbtqia","label":"LGBTQIA+"},{"key":"pcd","label":"Pessoas com deficiência"},{"key":"parentalidade","label":"Parentalidade"},{"key":"canal_denuncia","label":"Canal de denúncia"},{"key":"treinamentos","label":"Treinamentos e letramento"},{"key":"acoes_sociais","label":"Ações sociais"}],"maxSelections":3,"allowOther":true},{"id":"q12","type":"aberta","text":"Qual ação concreta você gostaria de ver o escritório adotar nos próximos 12 meses em relação à diversidade e à inclusão?","required":false}]$json$::jsonb,
  true
)
on conflict (key) do nothing;
