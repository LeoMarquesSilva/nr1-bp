-- Identificação opcional na denúncia (não anonimato): nome e contato quando o denunciante autoriza.

alter table public.whistleblower_reports
  add column if not exists is_anonymous boolean not null default true;

alter table public.whistleblower_reports
  add column if not exists reporter_name text;

alter table public.whistleblower_reports
  add column if not exists reporter_contact text;

comment on column public.whistleblower_reports.is_anonymous is 'true = denúncia anônima; false = denunciante informou nome e contato.';
comment on column public.whistleblower_reports.reporter_name is 'Preenchido quando is_anonymous = false.';
comment on column public.whistleblower_reports.reporter_contact is 'E-mail ou telefone quando is_anonymous = false.';
