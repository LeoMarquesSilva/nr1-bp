-- 029: Pesquisa de Diversidade e Inclusão
-- 1) Ramificação na pergunta 10: as perguntas 11 e 12 (sobre o comitê) só aparecem depois do "Sim";
--    com "Não", a pesquisa termina (campo endIf = 'nao' na q10).
-- 2) As perguntas de texto aberto (9 e 12) passam a ser obrigatórias (a 12 só para quem chega até ela).
-- Nenhum texto, opção ou resposta já enviada muda. Vale para o modelo embutido e para as pesquisas já
-- criadas a partir dele, inclusive abertas: por isso a trava de perguntas (trg_guard_survey) é
-- desligada só durante este update. Pode rodar de novo sem efeito (idempotente).

-- Modelo embutido
update public.survey_templates t
set questions = (
  select jsonb_agg(
    case
      when e.q->>'id' = 'q10' and e.q->>'type' = 'sim_nao' then e.q || '{"endIf": "nao"}'::jsonb
      when e.q->>'id' in ('q9', 'q12') and e.q->>'type' = 'aberta' then e.q || '{"required": true}'::jsonb
      else e.q
    end
    order by e.ord
  )
  from jsonb_array_elements(t.questions) with ordinality as e(q, ord)
)
where t.key = 'diversidade-inclusao';

-- Pesquisas criadas a partir do modelo (rascunho, aberta ou encerrada) que mantêm a pergunta 10 original
alter table public.surveys disable trigger trg_guard_survey;

update public.surveys s
set questions = (
  select jsonb_agg(
    case
      when e.q->>'id' = 'q10' and e.q->>'type' = 'sim_nao' then e.q || '{"endIf": "nao"}'::jsonb
      when e.q->>'id' in ('q9', 'q12') and e.q->>'type' = 'aberta' then e.q || '{"required": true}'::jsonb
      else e.q
    end
    order by e.ord
  )
  from jsonb_array_elements(s.questions) with ordinality as e(q, ord)
)
where s.template_id = (select id from public.survey_templates where key = 'diversidade-inclusao')
  and exists (
    select 1 from jsonb_array_elements(s.questions) q
    where q->>'id' = 'q10'
      and q->>'type' = 'sim_nao'
      and q->>'text' like 'Você entende que o escritório deveria ter um comitê de diversidade e inclusão%'
  );

alter table public.surveys enable trigger trg_guard_survey;
