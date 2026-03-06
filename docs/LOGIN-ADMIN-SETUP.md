# Login de administradores (Supabase)

## 1. Migração

Rode no Supabase (SQL Editor) ou via CLI a migração que cria a tabela de perfis:

- `supabase/migrations/005_admin_users.sql` — cria a tabela `public.users` e políticas RLS.

## 2. Criar contas dos administradores

Use o script com a **service role key** (nunca no front-end):

```bash
SUPABASE_URL=https://SEU_PROJETO.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/create-admin-users.js
```

Isso cria no Auth e em `public.users`:

| Nome                 | E-mail                            | Senha  | Avatar (URL) |
|----------------------|-----------------------------------|--------|--------------|
| Leonardo Marques Silva | leonardo.marques@bismarchipires.com.br | 123456 | (ver script) |
| Renato Vallim        | renato@bismarchipires.com.br      | 123466 | (ver script) |

A **service role key** está em: Supabase → Settings → API → `service_role` (secret).

## 3. Front-end

- **Sign In** no header leva à tela de login.
- Login usa Supabase Auth (`signInWithPassword`); em seguida é lido o perfil em `public.users` (onde `auth_id = session.user.id`).
- Se o perfil existir e estiver ativo, o usuário é redirecionado ao painel admin.
- **Sair** no painel chama `signOut()` do Supabase e limpa a sessão local.

## 4. Referência

Ver também `docs/PROMPT-RESUMO-SIDEBAR-LOGIN-PERFIL.md` para o desenho geral do sistema de login e perfil.
