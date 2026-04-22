# Operations Playbook

## Objetivo
Padronizar resposta a incidentes, backup/restore e melhoria contínua de performance/custo.

## Monitoramento e alertas
- Frontend: eventos `frontend_error` enviados para a telemetria local.
- Funis: acompanhar `landing_cta_click`, `*_submit_success`, `*_abandon`, `api_error`.
- Admin: revisar diariamente erros de envio e quedas de conversão por etapa.

## Trilha de auditoria
- Tabela: `public.admin_audit_log`.
- Eventos registrados: criação/edição/exclusão de tenant e ações de coleta.
- Consulta recomendada: últimos 7 dias por `tenant_id` e `action`.

## Backup e restauração
- **RPO alvo:** até 24h.
- **RTO alvo:** até 4h.
- Rotina mínima:
  - backup diário automático do banco;
  - retenção de 30 dias;
  - teste de restauração 1x por mês em ambiente isolado.
- Checklist de restore:
  - restaurar snapshot;
  - validar tabelas críticas (`submissions`, `whistleblower_reports`, `tenant_registry`, `admin_audit_log`);
  - validar RPCs públicas;
  - validar upload e leitura de evidências.

## Playbook de incidentes
- Erro massivo de envio: pausar campanhas, verificar RPC/políticas e storage, comunicar ETA.
- Falha de autenticação admin: revisar sessão JWT, disponibilidade Supabase Auth e funções edge.
- Degradação de API: checar taxas de erro, limites de rate e gargalos em consultas públicas.

## Segredos e superfície de ataque (checklist)

- **Repositório:** `rg` por `SERVICE_ROLE`, `eyJ` em `src/` deve ser vazio; após `npm run build`, `dist/assets/*.js` não deve conter `service_role`.
- **Vercel:** só variáveis `VITE_*` expostas ao browser; nunca prefixo `VITE_` em chave `service_role`. Alinhar URL do Supabase entre Preview e Production quando forem o mesmo projeto.
- **Supabase (projeto ativo):** Auth → URL Configuration (site e redirects); opcional MFA e proteção contra senhas vazadas; rever RLS nas tabelas críticas após mudanças de schema.
- **Contas admin:** criar só com `scripts/create-admin-users.js` e ficheiro local de seed (`admin-seed.local.json`), nunca senhas no Git.

## Performance e custo (contínuo)
- Revisar bundle trimestralmente e isolar módulos pesados.
- Priorizar carregamento sob demanda para dashboards secundários.
- Medir telas longas e componentes de gráfico em dispositivos de menor capacidade.

