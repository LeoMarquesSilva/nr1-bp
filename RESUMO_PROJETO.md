# Resumo do Projeto — NR1 Form

## O que é

**NR1 Form** é uma aplicação web multi-tenant que combina:

1. **Diagnóstico psicossocial HSE-IT** — questionário de 35 perguntas em 7 dimensões para avaliar riscos psicossociais no trabalho.
2. **Canal de relatos/denúncias anônimas** — formulário de denúncia (whistleblower) com protocolo e consulta por código.

O foco é **conformidade**: NR-1, Lei 14.457/22 e ISO 37002, em uma única plataforma.

---

## Fluxos principais

### 1. Landing page
- Duas entradas: **Fazer relato ou denúncia** e **Diagnóstico psicossocial**.
- Links para Sobre e Privacidade.

### 2. Diagnóstico HSE-IT
- **Identificação**: setor (e função).
- **Formulário**: 35 perguntas em 7 dimensões (Demandas, Controle, Apoio da chefia, Apoio dos colegas, Relacionamentos, Cargo/papel, Comunicação/mudanças).
- Escala: Nunca → Raramente → Às vezes → Frequentemente → Sempre.
- Dimensões “Demandas” e “Relacionamentos” têm pontuação invertida.
- Respostas salvas no Supabase por `tenant_id`; página de agradecimento ao final.

### 3. Canal de denúncias (relatos)
- **Buscar empresa**: na landing, “Fazer relato” leva à busca de organização por nome/slug; ao escolher, redireciona para o hub da empresa (`?org=slug&channel=denuncia`).
- **Hub da empresa**: opções “Enviar relato” e “Acompanhar por código”.
- **Formulário de denúncia**: categoria (opcional) e texto; gera protocolo no formato `WB-XXXXXXXX`.
- **Consultar denúncia**: consulta por código de protocolo.
- Tudo anônimo; dados isolados por `tenant_id`.

### 4. Admin (dashboard)
- **Login**: proteção por senha (admin).
- **Diagnóstico**: escolher tenant (empresa), ver lista de envios, gráficos por dimensão (Recharts), resultados agregados, excluir envio.
- **Denúncias**: listar relatos por tenant, marcar como lido, alterar status (recebida, em análise, concluída, arquivada).
- **Registro de empresas**: adicionar tenant por slug, nome de exibição, ativar/desativar (bloqueia diagnóstico e canal quando inativo), gerar e copiar link do canal de denúncias.

---

## Stack técnica

| Item | Tecnologia |
|------|------------|
| Frontend | React 19, TypeScript, Vite 7 |
| Estilo | Tailwind CSS 4 |
| Animações | Motion |
| Gráficos | Recharts |
| Backend/DB | Supabase (PostgreSQL, RLS, funções) |

---

## Multi-tenant

- Cada empresa é um **tenant** identificado por `tenant_id` (ex.: slug na URL).
- **Link para o cliente**: `https://app/?org=empresa-alpha` — diagnóstico e canal de denúncias ficam no contexto dessa empresa.
- Canal de denúncias: `?org=slug&channel=denuncia`, `&form=1` para enviar relato, `&consultar=1` para consultar por código.
- Tenant padrão pode ser definido via `VITE_TENANT_ID` no `.env`; nome do app e logo via `VITE_APP_NAME`, `VITE_APP_LOGO_URL`, `VITE_PRODUCT_NAME`.

---

## Dados (Supabase)

- **submissions**: respostas do diagnóstico (tenant_id, setor, funcao, answers JSON, submitted_at).
- **whistleblower_reports**: denúncias (tenant_id, protocol_id, category, body, status, read_at, etc.).
- **tenant_registry**: cadastro de organizações (tenant_id, display_name, active); empresas inativas não permitem novo diagnóstico nem uso do canal.
- Views/funções: `tenant_list`, `tenant_overview`, `search_organizations` (busca pública de empresas).

---

## Estrutura de pastas (resumida)

```
src/
├── App.tsx              # Roteamento e orquestração das views
├── components/          # LandingPage, FormDiagnostico, WhistleblowerForm, AdminDashboard, etc.
├── data/hseIt.ts        # Perguntas, dimensões e pontuação HSE-IT
├── types/               # submission.ts, whistleblower.ts
├── lib/                 # supabase.ts, tenant.ts, adminAuth.ts
└── main.tsx
supabase/
├── schema.sql
└── migrations/          # tenant_id, registry, whistleblower, search_organizations
```

---

## Em uma frase

**NR1 Form** é uma plataforma de **diagnóstico psicossocial (HSE-IT)** e **canal de denúncias anônimas** multi-tenant, com painel admin para resultados e gestão de relatos, em conformidade com NR-1, Lei 14.457/22 e ISO 37002.
