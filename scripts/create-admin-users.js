/**
 * Cria os usuários administradores no Supabase (Auth + tabela public.users).
 * Execute uma vez após rodar a migração 005_admin_users.sql.
 *
 * Lê .env na raiz: SUPABASE_URL ou VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Lista de contas: ficheiro JSON (veja scripts/admin-seed.example.json), via
 * ADMIN_SEED_FILE ou ficheiro predefinido admin-seed.local.json na raiz do projeto.
 * Uso: node scripts/create-admin-users.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const envPath = resolve(root, '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.trim().match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const seedPath = process.env.ADMIN_SEED_FILE
  ? resolve(root, process.env.ADMIN_SEED_FILE)
  : resolve(root, 'admin-seed.local.json')

if (!url || !serviceRoleKey) {
  console.error('Defina SUPABASE_URL (ou VITE_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY (variáveis de ambiente ou .env).')
  process.exit(1)
}

if (!existsSync(seedPath)) {
  console.error(
    `Ficheiro de seed não encontrado: ${seedPath}\n` +
    '  Copie scripts/admin-seed.example.json para a raiz como admin-seed.local.json (ou defina ADMIN_SEED_FILE) e preencha com dados reais. Não commite senhas.\n' +
    '  Ex.: copy scripts\\admin-seed.example.json admin-seed.local.json',
  )
  process.exit(1)
}

let admins
try {
  admins = JSON.parse(readFileSync(seedPath, 'utf8'))
} catch (e) {
  console.error('JSON inválido em', seedPath, e.message)
  process.exit(1)
}

if (!Array.isArray(admins) || admins.length === 0) {
  console.error('O ficheiro de seed deve ser um array JSON com pelo menos um admin { name, email, password, avatar_url? }.')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })

async function main() {
  for (const admin of admins) {
    if (!admin?.name || !admin?.email || !admin?.password) {
      console.error('Cada item precisa de name, email e password. Ignorado:', admin)
      continue
    }
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
      user_metadata: { full_name: admin.name },
    })
    if (authError) {
      if (authError.message && authError.message.includes('already been registered')) {
        console.log(`Usuário já existe no Auth: ${admin.email}. Se faltar perfil em public.users, insira manualmente no SQL Editor (auth_id = id do usuário em Authentication).`)
      } else {
        console.error(`Erro ao criar usuário ${admin.email}:`, authError.message)
      }
      continue
    }
    if (!user?.user?.id) {
      console.error(`Resposta sem user.id para ${admin.email}`)
      continue
    }
    const { error: insertError } = await supabase.from('users').insert({
      auth_id: user.user.id,
      name: admin.name,
      email: admin.email,
      avatar_url: admin.avatar_url ?? null,
      role: 'admin',
      is_active: true,
    })
    if (insertError) {
      console.error(`Erro ao inserir perfil ${admin.email}:`, insertError.message)
    } else {
      console.log(`Criado: ${admin.email} (auth_id: ${user.user.id})`)
    }
  }
  console.log('Concluído.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
