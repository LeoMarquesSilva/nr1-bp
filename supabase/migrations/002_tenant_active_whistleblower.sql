-- Cole no Supabase → SQL Editor → Run (após já ter rodado tenant_registry e tenant_overview)
-- Adiciona: encerrar coleta (active), remover da lista (delete), canal de denúncias

-- 1) Coluna active em tenant_registry (true = aceita respostas, false = coleta encerrada)
alter table public.tenant_registry add column if not exists active boolean not null default true;

-- 2) Permitir deletar (remover da lista)
drop policy if exists "Permitir delete para anon (admin remove da lista)" on public.tenant_registry;
create policy "Permitir delete para anon (admin remove da lista)"
  on public.tenant_registry for delete to anon using (true);

-- 3) Tabela de denúncias (canal whistleblowing)
create table if not exists public.whistleblower_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  category text,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists whistleblower_reports_tenant_id_idx on public.whistleblower_reports (tenant_id);
create index if not exists whistleblower_reports_created_at_idx on public.whistleblower_reports (created_at desc);

alter table public.whistleblower_reports enable row level security;

create policy "Permitir insert anônimo (envio do formulário)"
  on public.whistleblower_reports for insert to anon with check (true);

create policy "Permitir select para anon (admin lê)"
  on public.whistleblower_reports for select to anon using (true);

create policy "Permitir update para anon (admin marca como lida)"
  on public.whistleblower_reports for update to anon using (true);
