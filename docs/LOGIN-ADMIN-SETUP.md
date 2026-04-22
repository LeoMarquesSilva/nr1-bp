# Login de administradores (Supabase)

## 1. Migração

Rode no Supabase (SQL Editor) ou via CLI a migração que cria a tabela de perfis:

- `supabase/migrations/005_admin_users.sql` — cria a tabela `public.users` e políticas RLS.

## 2. Criar contas dos administradores

1. Copie o modelo [`scripts/admin-seed.example.json`](../scripts/admin-seed.example.json) para a raiz do repositório como `admin-seed.local.json` (ficheiro ignorado pelo Git) e preencha `name`, `email`, `password` e, se quiser, `avatar_url`.
2. Com a **service role key** (nunca no front-end), na raiz do projeto:

```bash
node scripts/create-admin-users.js
```

Pode apontar outro ficheiro com `ADMIN_SEED_FILE=caminho/relativo/ao/repô.json` (a partir da raiz do projeto)

A **service role key** está em: Supabase → Settings → API → `service_role` (secret).

## 3. Front-end

- **Sign In** no header leva à tela de login.
- Login usa Supabase Auth (`signInWithPassword`); em seguida é lido o perfil em `public.users` (onde `auth_id = session.user.id`).
- Se o perfil existir e estiver ativo, o usuário é redirecionado ao painel admin.
- **Sair** no painel chama `signOut()` do Supabase e limpa a sessão local.

## 4. Referência

Ver também `docs/PROMPT-RESUMO-SIDEBAR-LOGIN-PERFIL.md` para o desenho geral do sistema de login e perfil.
