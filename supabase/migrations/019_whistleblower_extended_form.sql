-- Campos adicionais do formulário de denúncia (assunto, relação, categoria, gênero, data, câmera, provas).

alter table public.whistleblower_reports
  add column if not exists subject text;

alter table public.whistleblower_reports
  add column if not exists accused_relationship text;

alter table public.whistleblower_reports
  add column if not exists complaint_category text;

alter table public.whistleblower_reports
  add column if not exists complainant_gender text;

alter table public.whistleblower_reports
  add column if not exists incident_date date;

alter table public.whistleblower_reports
  add column if not exists location_has_camera text;

alter table public.whistleblower_reports
  add column if not exists evidence_paths jsonb default '[]'::jsonb;

comment on column public.whistleblower_reports.subject is 'Assunto resumido da denúncia (obrigatório no formulário).';
comment on column public.whistleblower_reports.accused_relationship is 'Relação do denunciado com o denunciante.';
comment on column public.whistleblower_reports.complaint_category is 'Categoria/tipo da denúncia.';
comment on column public.whistleblower_reports.complainant_gender is 'Gênero informado pelo denunciante.';
comment on column public.whistleblower_reports.incident_date is 'Data da ocorrência relatada.';
comment on column public.whistleblower_reports.location_has_camera is 'sim | nao — local possui câmera.';
comment on column public.whistleblower_reports.evidence_paths is 'JSON array: [{path, original_name}] no Storage.';
