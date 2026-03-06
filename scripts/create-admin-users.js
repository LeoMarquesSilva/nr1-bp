/**
 * Cria os usuários administradores no Supabase (Auth + tabela public.users).
 * Execute uma vez após rodar a migração 005_admin_users.sql.
 *
 * Lê .env na raiz: SUPABASE_URL ou VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Uso: node scripts/create-admin-users.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.trim().match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (variáveis de ambiente).')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })

const admins = [
  {
    name: 'Leonardo Marques Silva',
    email: 'leonardo.marques@bismarchipires.com.br',
    password: '123456',
    avatar_url: 'https://www.bismarchipires.com.br/blog/wp-content/uploads/2026/03/Captura-de-tela-2026-03-02-174232.png',
  },
  {
    name: 'Renato Vallim',
    email: 'renato@bismarchipires.com.br',
    password: '123466',
    avatar_url: 'https://www.bismarchipires.com.br/img/team/trabalhista/renato-rossetti.jpg',
  },
]

async function main() {
  for (const admin of admins) {
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
      avatar_url: admin.avatar_url,
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
