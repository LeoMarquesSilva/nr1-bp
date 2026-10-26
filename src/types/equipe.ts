import { FunctionsHttpError } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'

/** Departamentos do escritório (lista fixa; users.department aponta para departments.name). */
export interface Department {
  id: string
  name: string
  active: boolean
}

/** Pessoa da equipe com login no painel. */
export interface TeamMember {
  id: string
  authId: string
  name: string
  email: string
  department: string | null
  isActive: boolean
  /** Ainda está com a senha provisória (troca obrigatória no próximo acesso). */
  requiresPasswordChange: boolean
  avatarUrl: string | null
  createdAt: string
}

export const DEPARTMENT_NAME_MIN = 2
export const DEPARTMENT_NAME_MAX = 80

const MIGRATION_HINT = 'Confira se a migração 027 foi aplicada no Supabase.'

type DepartmentRow = { id: string; name: string; active: boolean }

type MemberRow = {
  id: string
  auth_id: string
  name: string
  email: string
  department: string | null
  is_active: boolean
  requires_password_change: boolean
  avatar_url: string | null
  created_at: string
}

const MEMBER_COLUMNS = 'id, auth_id, name, email, department, is_active, requires_password_change, avatar_url, created_at'

function toMember(r: MemberRow): TeamMember {
  return {
    id: r.id,
    authId: r.auth_id,
    name: r.name,
    email: r.email,
    department: r.department,
    isActive: r.is_active,
    requiresPasswordChange: r.requires_password_change,
    avatarUrl: r.avatar_url,
    createdAt: r.created_at,
  }
}

/** Tira espaços sobrando ("  Recursos   Humanos " → "Recursos Humanos"). */
export function normalizeDepartmentName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

/** Valida o nome antes de ir ao banco; devolve a mensagem de erro ou null. */
export function departmentNameError(name: string, existing: { id: string; name: string }[], ignoreId?: string): string | null {
  const n = normalizeDepartmentName(name)
  if (n.length < DEPARTMENT_NAME_MIN) return `Use pelo menos ${DEPARTMENT_NAME_MIN} caracteres.`
  if (n.length > DEPARTMENT_NAME_MAX) return `Use no máximo ${DEPARTMENT_NAME_MAX} caracteres.`
  const key = n.toLocaleLowerCase('pt-BR')
  if (existing.some((d) => d.id !== ignoreId && d.name.toLocaleLowerCase('pt-BR') === key)) return 'Já existe um departamento com esse nome.'
  return null
}

/** Traduz as regras do banco (nome único, nome válido, departamento em uso) para mensagens claras. */
function dbError(error: { message?: string; code?: string } | null, fallback: string): Error {
  const msg = error?.message ?? ''
  if (error?.code === '23505') return new Error('Já existe um departamento com esse nome.')
  if (error?.code === '23514') return new Error(`O nome precisa ter entre ${DEPARTMENT_NAME_MIN} e ${DEPARTMENT_NAME_MAX} caracteres.`)
  if (error?.code === '23503') return new Error('Há pessoas neste departamento. Mude o departamento delas antes de excluir, ou só desative.')
  if (error?.code === 'P0001' && msg) return new Error(msg)
  if (error?.code === '42P01' || msg.includes('does not exist') || msg.includes('schema cache')) return new Error(`${fallback} ${MIGRATION_HINT}`)
  return new Error(fallback)
}

/** Erros das edge functions vêm no corpo JSON ({ error }); o resto vira mensagem genérica. */
async function functionError(error: unknown, fallback: string): Promise<Error> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: unknown; msg?: unknown } | null
      if (typeof body?.error === 'string') return new Error(body.error)
      if (typeof body?.msg === 'string') return new Error(body.msg)
    } catch {
      /* resposta não-JSON do gateway */
    }
  }
  return new Error(fallback)
}

// ---------- Departamentos ----------

export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await getSupabase().from('departments').select('id, name, active').order('name')
  if (error) throw dbError(error, 'Não foi possível carregar os departamentos.')
  return ((data ?? []) as DepartmentRow[]).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export async function createDepartment(name: string): Promise<Department> {
  const { data, error } = await getSupabase().from('departments').insert({ name: normalizeDepartmentName(name) }).select('id, name, active').single()
  if (error) throw dbError(error, 'Não foi possível criar o departamento.')
  return data as DepartmentRow
}

/** Renomear atualiza junto o departamento de todas as pessoas vinculadas (on update cascade). */
export async function renameDepartment(id: string, name: string): Promise<void> {
  const { error } = await getSupabase().from('departments').update({ name: normalizeDepartmentName(name) }).eq('id', id)
  if (error) throw dbError(error, 'Não foi possível renomear o departamento.')
}

/** Inativo some das listas de escolha, mas quem já está nele continua. */
export async function setDepartmentActive(id: string, active: boolean): Promise<void> {
  const { error } = await getSupabase().from('departments').update({ active }).eq('id', id)
  if (error) throw dbError(error, 'Não foi possível alterar o departamento.')
}

/** Só funciona sem ninguém vinculado (on delete restrict). */
export async function deleteDepartment(id: string): Promise<void> {
  const { error } = await getSupabase().from('departments').delete().eq('id', id)
  if (error) throw dbError(error, 'Não foi possível excluir o departamento.')
}

// ---------- Pessoas ----------

export async function getTeam(): Promise<TeamMember[]> {
  const { data, error } = await getSupabase().from('users').select(MEMBER_COLUMNS).order('name')
  if (error) throw dbError(error, 'Não foi possível carregar a equipe.')
  return ((data ?? []) as MemberRow[]).map(toMember).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

/**
 * Altera uma pessoa. A obrigação de trocar a senha só pode ser ligada aqui:
 * quem desliga é o banco, quando a própria pessoa cria a senha nova.
 */
export async function updateMember(id: string, patch: { department?: string; isActive?: boolean; requirePasswordChange?: true }): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.department !== undefined) row.department = patch.department
  if (patch.isActive !== undefined) row.is_active = patch.isActive
  if (patch.requirePasswordChange) row.requires_password_change = true
  const { error } = await getSupabase().from('users').update(row).eq('id', id)
  if (error) {
    if (error.code === '23503') throw new Error('Departamento inválido. Escolha um departamento da lista.')
    throw dbError(error, 'Não foi possível salvar a alteração.')
  }
}

/** Cria o login com senha provisória; a pessoa é obrigada a trocá-la no primeiro acesso. */
export async function createMember(input: { name: string; email: string; department: string; password: string }): Promise<void> {
  const { data, error } = await getSupabase().functions.invoke('create-admin-user', {
    body: {
      name: input.name.trim().replace(/\s+/g, ' '),
      email: input.email.trim().toLowerCase(),
      department: input.department,
      password: input.password,
    },
  })
  if (error) throw await functionError(error, 'Não foi possível cadastrar a pessoa.')
  if (data?.error) throw new Error(String(data.error))
}

/** Exclui o login (o perfil vai junto por cascade). */
export async function deleteMember(authId: string): Promise<void> {
  const { data, error } = await getSupabase().functions.invoke('delete-admin-user', { body: { userId: authId } })
  if (error) throw await functionError(error, 'Não foi possível excluir a pessoa.')
  if (data?.error) throw new Error(String(data.error))
}
