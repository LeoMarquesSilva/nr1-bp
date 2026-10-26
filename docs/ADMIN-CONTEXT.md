# Contexto da área administrativa (painel pós-login)

Referência obrigatória ao alterar o painel. Princípios de produto em `PRODUCT.md` (raiz).

---

## 1. Visão geral

- **Quem acessa:** só a equipe do escritório (usuários em `public.users` com `role = 'admin'` e ativos). Colaboradores das empresas clientes usam apenas os links públicos, sem conta.
- **Endereço:** tudo fica sob `/painel/...`, com uma URL por tela (voltar, recarregar e compartilhar funcionam). Sem login, `/painel/...` mostra a tela de login e, depois de entrar, volta à página pedida.
- **Organização:** seletor de empresa no topo da barra lateral. Tudo de um cliente fica dentro do espaço da empresa; o que é do escritório fica em "Escritório".

## 2. Mapa de telas

| URL | Tela |
|-----|------|
| `/painel/empresas` | Carteira: tabela de empresas com status do diagnóstico, canal e pesquisas |
| `/painel/empresas/nova` | Cadastro de empresa (`?slug=` pré-preenche a partir de respostas sem cadastro) |
| `/painel/empresas/:slug` | Visão geral: módulos, pendências e primeiros passos |
| `/painel/empresas/:slug/pesquisas` | Diagnóstico NR-1 (fixo no topo) + pesquisas internas |
| `/painel/empresas/:slug/pesquisas/diagnostico-nr1[/setores\|/compartilhar\|/perguntas]` | Diagnóstico HSE-IT |
| `/painel/empresas/:slug/pesquisas/nova` | Nova pesquisa a partir de um modelo |
| `/painel/empresas/:slug/pesquisas/:id[/compartilhar\|/resultados]` | Pesquisa: perguntas (editor), link/QR, resultados |
| `/painel/empresas/:slug/denuncias[?caso=:id&compartilhar=1]` | Caixa de denúncias da empresa |
| `/painel/empresas/:slug/configuracoes` | Dados, logo, CNPJs, setores, coleta, canal e exclusão |
| `/painel/denuncias` | Todas as denúncias (filtro por empresa) |
| `/painel/modelos`, `/painel/modelos/:id` | Modelos de pesquisa |
| `/painel/equipe[/departamentos]` | Equipe: pessoas com login e lista de departamentos |
| `/painel/perfil` | Meu perfil |

Rotas e geradores de caminho: `src/components/painel/router.ts` (testado em `router.test.ts`). Para nova tela: adicionar ao tipo `PainelRoute`, a `parsePainelPath`, a `paths` e ao `switch` em `PainelLayout.tsx`.

## 3. Estrutura de arquivos

```
src/components/painel/
  PainelLayout.tsx     # guarda de sessão admin, shell (barra lateral / gaveta no celular), escolhe a página pela URL
  PrimeiroAcesso.tsx   # tela única de "Crie sua senha" enquanto a senha provisória não for trocada
  PainelContext.tsx    # empresas, totais do diagnóstico, denúncias não lidas, última empresa visitada
  Sidebar.tsx          # menu "Esta empresa" + "Escritório", perfil, ver site, sair
  CompanySwitcher.tsx  # seletor de empresa com busca e teclado
  SharePanel.tsx       # link, QR Code (PNG/copiar) e e-mail — diagnóstico, canal e pesquisas
  ui.tsx               # PageHeader (breadcrumbs), TabNav, Panel, EmptyState, StatusPill, Field, Switch, formatação
  router.ts            # rotas e navegação sem recarregar
  pages/               # uma página por tela do mapa acima
  survey/              # editor de perguntas, resultados e salvamento automático
src/components/pesquisa/
  SurveyRespondent.tsx # fluxo de quem responde (também usado na pré-visualização do painel)
  PesquisaPublica.tsx  # página pública /pesquisa/:id
src/data/pesquisas.ts  # motor de pesquisas: tipos de pergunta, validação, agregação, modelo de D&I
src/types/pesquisas.ts # acesso ao Supabase: modelos, pesquisas, respostas, página pública
src/types/equipe.ts    # pessoas da equipe e departamentos (CRUD); cadastro/exclusão via edge functions
src/lib/senha.ts       # regras da senha definitiva (testado em senha.test.ts)
```

Perfil reaproveita `src/components/admin/AdminPerfil.tsx`.

## 3.1 Equipe, departamentos e primeiro acesso

- **Departamentos** (`departments`, migração 027): lista fixa, nunca campo livre. `users.department` referencia `departments.name`: renomear atualiza as pessoas (cascade); excluir só sem ninguém vinculado (restrict); desativar tira das escolhas sem mexer em quem já está nele.
- **Cadastro de pessoa:** nome, e-mail, departamento (da lista) e senha provisória, pela edge function `create-admin-user`. A pessoa nasce com `requires_password_change = true`.
- **Primeiro acesso:** enquanto a flag estiver ligada, o painel mostra só a tela "Crie sua senha" e, no banco, `is_admin()` é falso (não enxerga dados nem chama as edge functions). A flag só cai quando a senha muda de fato no Supabase Auth (gatilho em `auth.users`); um gatilho em `users` impede desligá-la manualmente. Quem administra pode religá-la ("Exigir nova senha").
- A senha nova segue `src/lib/senha.ts`: 8+ caracteres, letras e números, nada óbvio (123456, "senha123"…) e sem nome/e-mail da pessoa.

## 4. Pesquisas internas

- **Modelos** (`survey_templates`): "Em branco" e "Diversidade e Inclusão" vêm do sistema (editáveis, não excluíveis); a equipe cria outros ou salva uma pesquisa como modelo.
- **Ciclo:** rascunho → aberta → encerrada (pode reabrir). Toda pesquisa nasce rascunho. Ao abrir, **perguntas e mínimo de respostas travam** (regra no banco); para mudar, duplicar.
- **Tipos de pergunta:** escala 1–5, frequência, sim/não, múltipla escolha (limite e "Outros"), aberta. Escala e frequência podem oferecer "Prefiro não responder".
- **Ramificação:** uma pergunta de sim/não pode liberar as seguintes só com uma das respostas (`endIf` guarda a que encerra). Sem resposta ou com a que encerra, as seguintes não aparecem, não são exigidas e não são salvas; nos resultados, elas contam só quem chegou até elas. Na D&I, as perguntas 11 e 12 só aparecem com "Sim" na 10 (migração 029).
- **Texto de abertura:** linha em branco separa parágrafos e `*trecho*` fica em negrito. A abertura mostra só o tempo estimado, sem o número de perguntas (com ramificação ele varia).
- **Anonimato:** respostas sem horário (só data, definida pelo servidor), sem setor ou identificação; resultados só a partir do mínimo (padrão 5); textos em ordem aleatória.
- **Link público:** `/pesquisa/:id`. O RPC `get_public_survey` só devolve perguntas quando a pesquisa está aberta; rascunho não existe para o público.
- **Diagnóstico NR-1 (HSE-IT):** instrumento validado, fora do motor (dados em `submissions`, cálculo em `src/data/hseIt.ts`). Aparece na lista de pesquisas como "metodologia travada". Resultados por setor ficam ocultos abaixo de 3 respostas.

## 5. Segurança (RLS)

- `is_admin()` (admin ativo **e** sem senha provisória pendente) controla leitura e escrita de `submissions`, `whistleblower_reports`, `tenant_registry` (escrita), `surveys`, `survey_templates`, `survey_responses` (leitura/exclusão), `departments` e a leitura de toda a equipe em `users`.
- Anônimo: só insere respostas/denúncias; não lê nada. Gatilhos no banco bloqueiam resposta em pesquisa não aberta.
- Ações administrativas relevantes vão para `admin_audit_log` via `logAdminAuditAction`.

## 6. Checklist ao alterar o painel

- [ ] Textos em português do Brasil; ações importantes com rótulo em texto.
- [ ] Nova tela com URL própria e breadcrumb.
- [ ] Estados: carregando (skeleton), vazio (que ensina o próximo passo), erro (mensagem útil).
- [ ] Nada que permita deduzir quem respondeu.
- [ ] `npm run typecheck` e `npm run test:run` passando.
