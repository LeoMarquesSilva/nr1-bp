# Contexto da área administrativa (painel pós-login)

Use este documento como **referência obrigatória** ao implementar ou alterar a parte interna do sistema (admin). Evita inconsistências e “alucinações” sobre estrutura e destinos.

---

## 1. Visão geral

- **Acesso:** Após login (Supabase Auth) com usuário em `public.users` (perfil ativo). O botão “Entrar” no header leva à tela de login; em sucesso, o usuário é redirecionado para o painel admin.
- **Shell:** O painel usa um **layout com sidebar** (modelo do `docs/PROMPT-RESUMO-SIDEBAR-LOGIN-PERFIL.md`): barra lateral fixa (desktop) + navegação inferior (mobile) + área de conteúdo.
- **Navegação interna:** Por estado (não por URL). O tipo `AdminPage` define os destinos: `'dashboard' | 'perfil'`.

---

## 2. Estrutura de arquivos

```
src/
  components/
    admin/
      index.ts           # Barrel: AdminLayout, AdminSidebar, AdminPerfil, AdminPage
      AdminLayout.tsx    # Shell: sidebar + main; estado adminPage; busca perfil (users); renderiza Dashboard ou Perfil
      AdminSidebar.tsx   # Nav lateral (desktop) + bottom nav (mobile); ícones Lucide; avatar; logout
      AdminPerfil.tsx    # Página “Meu Perfil” (leitura por enquanto; edição e senha em breve)
    AdminDashboard.tsx  # Conteúdo da página Dashboard (diagnóstico + denúncias); usado dentro do layout com hideHeaderActions
  App.tsx               # view === 'admin' → <AdminLayout onClose onLogout />
```

- **AdminLayout:** Dono do estado `adminPage` e do perfil (fetch em `users` por `auth_id`). Renderiza `AdminSidebar` + `main`; dentro do `main`, `AdminDashboard` (com `hideHeaderActions`) ou `AdminPerfil` conforme `adminPage`.
- **AdminSidebar:** Recebe `page`, `onNavigate(page)`, `onGoToSite`, `onLogout`, `profile`. Não usa rotas; apenas callbacks.

---

## 3. Destinos (páginas) do admin

| Id (AdminPage) | Label na sidebar | Componente        | Descrição |
|----------------|------------------|--------------------|-----------|
| `dashboard`    | Dashboard        | AdminDashboard     | Empresas, links, diagnósticos HSE-IT, denúncias (abas Diagnóstico / Denúncias). |
| `empresas`     | Empresas         | AdminEmpresas      | Lista de empresas no registro; criar/editar empresa (tenant_id, display_name, cnpj, nicho, opções de setor para o formulário). |
| `perfil`       | Perfil           | AdminPerfil        | Dados do usuário (nome, e-mail, avatar, departamento). Futuro: edição e alteração de senha. |

- Novos destinos: adicionar ao tipo `AdminPage` em `AdminSidebar.tsx`, à lista `ADMIN_NAV`, e ao `AdminLayout` o branch que renderiza o componente da página.

---

## 4. Sidebar (desktop e mobile)

- **Referência:** `docs/PROMPT-RESUMO-SIDEBAR-LOGIN-PERFIL.md` (seção 3.2).
- **Desktop (md+):** Barra fixa à esquerda (`fixed left-0 top-0 z-40 h-screen w-16`), fundo gradiente escuro (`from-[var(--escritorio-escuro)] to-slate-900`), borda direita sutil. Conteúdo em coluna:
  - Topo: logo / “Voltar ao site” (ícone Home) → `onGoToSite` (= `onClose` do layout).
  - Lista de itens de nav (Dashboard, Empresas, Perfil): ícone + estado ativo (fundo claro/destaque).
  - Divisor.
  - Avatar do usuário (perfil do Supabase `users`): clique leva à página Perfil; fallback = iniciais do nome.
  - Botão Sair (LogOut) → chama `onLogout` (layout faz `signOut` + `logoutAdmin()` + callback para App).
- **Mobile:** Bottom navigation (`fixed bottom-0 left-0 right-0`), mesmo conjunto de destinos + “Site” + “Sair”. Conteúdo do `main` com `pb-24 md:pb-8` para não ficar atrás da nav.

---

## 5. Fluxo de logout

1. Usuário clica em “Sair” na sidebar (ou bottom nav).
2. `AdminLayout.handleLogout`: `getSupabase().auth.signOut()` → em seguida `logoutAdmin()` (sessionStorage) e `onLogout()` (App).
3. App: `setView('landing')` e não renderiza mais o admin.

---

## 6. Perfil (avatar e dados)

- **Origem:** Tabela `public.users` (campos: `id`, `auth_id`, `name`, `email`, `avatar_url`, `department`, etc.).
- **Carregamento:** No mount do `AdminLayout`, `getSession()` e depois `from('users').eq('auth_id', session.user.id).maybeSingle()`; resultado em estado `profile` passado para a sidebar (avatar, nome) e para `AdminPerfil`.
- **RLS:** Usuário autenticado pode ler/atualizar apenas o próprio registro (`auth_id = auth.uid()`).

---

## 7. Design e tokens

- Sidebar: cores escuras (escritório-escuro / slate-900), itens ativos com `bg-white/15`, inativos com `text-slate-400` e hover `bg-white/10`.
- Conteúdo do `main`: fundo `var(--branco-gelo)`, padding e max-width conforme `DESIGN_CONTEXT.md` (identidade unificada slate/violet/emerald).

---

## 8. Segurança (role admin e RLS)

- **Login:** Exige `profile.role === 'admin'` e `profile.is_active`; caso contrário, `signOut()` e mensagem de acesso não autorizado.
- **AdminLayout guard:** No mount, busca sessão e perfil em `users`; se não houver sessão ou perfil com `role === 'admin'`, chama `logoutAdmin()`, `signOut()` e `onClose()` (volta ao site).
- **Supabase RLS:** Função `public.is_admin()`. **submissions:** insert para anon; select e delete apenas para authenticated com `is_admin()`. **tenant_registry:** select para anon; insert, update, delete apenas para authenticated com `is_admin()`. Views com `security_invoker = true`.

## 9. Empresas e setores por tenant

- **tenant_registry** estendido: `cnpj`, `nicho`, `setores` (jsonb). Migração `007_tenant_registry_extend`. **AdminEmpresas:** lista + formulário criar/editar. **Identificacao:** usa `getTenantSetores(getTenantId())`; se preenchido, usa lista do tenant; senão `SETORES`.

## 10. Checklist ao alterar o admin

- [ ] Novos destinos: atualizar `AdminPage`, `ADMIN_NAV`, `PAGE_TITLES` em AdminHeader e o switch no `AdminLayout`.
- [ ] Sidebar: manter ícones Lucide, avatar com fallback de iniciais, e “Sair” chamando o `onLogout` do layout.
- [ ] Logout: sempre `signOut()` + `logoutAdmin()` + callback do App.
- [ ] Textos em português do Brasil.
- [ ] Consistência com `DESIGN_CONTEXT.md` e com `docs/PROMPT-RESUMO-SIDEBAR-LOGIN-PERFIL.md`.
- [ ] Dados sensíveis (envios, escrita em tenant_registry) acessíveis apenas com sessão autenticada e role admin (RLS).

Ao implementar ou revisar código da área admin, **consulte este arquivo e o DESIGN_CONTEXT.md** para não inferir estrutura ou fluxos incorretos.
