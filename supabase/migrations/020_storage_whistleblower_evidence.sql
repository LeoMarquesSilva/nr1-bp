-- Bucket privado para arquivos de prova anexados às denúncias.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'whistleblower-evidence',
  'whistleblower-evidence',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anon pode enviar provas (formulário público)
drop policy if exists "whistleblower_evidence_insert_anon" on storage.objects;
create policy "whistleblower_evidence_insert_anon"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'whistleblower-evidence');

drop policy if exists "whistleblower_evidence_insert_auth" on storage.objects;
create policy "whistleblower_evidence_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'whistleblower-evidence');

-- Leitura/download: usuários autenticados (admin no painel)
drop policy if exists "whistleblower_evidence_select_auth" on storage.objects;
create policy "whistleblower_evidence_select_auth"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'whistleblower-evidence');

-- Opcional: service role / manutenção — políticas padrão do Supabase já cobrem service_role
