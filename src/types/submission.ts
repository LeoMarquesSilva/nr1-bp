import type { OptionKey } from '../data/hseIt'
import { getSupabase } from '../lib/supabase'
import { getTenantId } from '../lib/tenant'

export interface Submission {
  id: string
  setor: string
  funcao: string
  answers: Record<number, OptionKey>
  submittedAt: string // ISO
}

interface SubmissionRow {
  id: string
  setor: string
  funcao: string
  answers: Record<number, OptionKey>
  submitted_at: string
}

function rowToSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    setor: row.setor,
    funcao: row.funcao ?? '',
    answers: row.answers,
    submittedAt: row.submitted_at,
  }
}

/** Lista os tenant_id que existem na base (para o seletor de empresas no dashboard). */
export async function getTenantList(): Promise<string[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('tenant_list').select('tenant_id')
  if (error) {
    console.error('Supabase getTenantList:', error)
    return []
  }
  return (data ?? []).map((r: { tenant_id: string }) => r.tenant_id)
}

export interface TenantOverviewItem {
  tenant_id: string
  submission_count: number
  last_submitted_at: string | null
}

/** Lista empresas com total de respostas e data da última (para a visão geral). */
export async function getTenantOverview(): Promise<TenantOverviewItem[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('tenant_overview').select('tenant_id, submission_count, last_submitted_at')
  if (error) {
    console.error('Supabase getTenantOverview:', error)
    return []
  }
  return (data ?? []) as TenantOverviewItem[]
}

export interface TenantRegistryItem {
  tenant_id: string
  display_name: string | null
  active: boolean
}

/** Lista as empresas do registro (com nome e status). */
export async function getTenantRegistry(): Promise<TenantRegistryItem[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tenant_registry')
    .select('tenant_id, display_name, active')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Supabase getTenantRegistry:', error)
    return []
  }
  return (data ?? []).map((r: { tenant_id: string; display_name: string | null; active: boolean }) => ({
    tenant_id: r.tenant_id,
    display_name: r.display_name ?? null,
    active: r.active ?? true,
  }))
}

/** Verifica se a coleta do tenant está ativa (para bloquear formulário). Se não estiver no registro, considera ativo. */
export async function getTenantStatus(tenantId: string): Promise<{ active: boolean }> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('tenant_registry')
    .select('active')
    .eq('tenant_id', tenantId.trim().toLowerCase())
    .maybeSingle()
  return { active: data?.active ?? true }
}

/** Atualiza registro (nome e/ou ativo). */
export async function updateTenantRegistry(
  tenantId: string,
  updates: { display_name?: string | null; active?: boolean }
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('tenant_registry')
    .update(updates)
    .eq('tenant_id', tenantId.trim().toLowerCase())
  if (error) {
    console.error('Supabase updateTenantRegistry:', error)
    throw new Error('Não foi possível atualizar.')
  }
}

/** Remove empresa da lista (não apaga envios). */
export async function deleteTenantFromRegistry(tenantId: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('tenant_registry').delete().eq('tenant_id', tenantId.trim().toLowerCase())
  if (error) {
    console.error('Supabase deleteTenantFromRegistry:', error)
    throw new Error('Não foi possível remover da lista.')
  }
}

/** Adiciona uma empresa à lista do admin (ao clicar em "Adicionar à lista"). */
export async function addTenantToRegistry(tenantId: string, displayName?: string): Promise<void> {
  const supabase = getSupabase()
  const slug = tenantId.trim().toLowerCase()
  if (!slug) return
  const row: { tenant_id: string; display_name?: string } = { tenant_id: slug }
  if (displayName != null && displayName.trim()) row.display_name = displayName.trim()
  const { error } = await supabase.from('tenant_registry').upsert(row, { onConflict: 'tenant_id' })
  if (error) {
    console.error('Supabase addTenantToRegistry:', error)
    throw new Error('Não foi possível adicionar à lista.')
  }
}

/** Envios. Se tenantId for passado (dashboard), usa esse; senão usa o tenant da URL/env. */
export async function getSubmissions(tenantId?: string): Promise<Submission[]> {
  const supabase = getSupabase()
  const id = tenantId ?? getTenantId()
  const { data, error } = await supabase
    .from('submissions')
    .select('id, setor, funcao, answers, submitted_at')
    .eq('tenant_id', id)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Supabase getSubmissions:', error)
    return []
  }
  return (data ?? []).map(rowToSubmission)
}

export async function saveSubmission(
  setor: string,
  answers: Record<number, OptionKey>
): Promise<Submission> {
  const supabase = getSupabase()
  const tenantId = getTenantId()
  const status = await getTenantStatus(tenantId)
  if (!status.active) {
    throw new Error('Esta coleta foi encerrada. Não é mais possível enviar respostas.')
  }
  const row = {
    tenant_id: tenantId,
    setor,
    funcao: '',
    answers,
  }
  const { data, error } = await supabase
    .from('submissions')
    .insert(row)
    .select('id, setor, funcao, answers, submitted_at')
    .single()

  if (error) {
    console.error('Supabase saveSubmission:', error)
    throw new Error('Não foi possível enviar o diagnóstico. Tente novamente.')
  }
  return rowToSubmission(data as SubmissionRow)
}

export async function deleteSubmission(id: string, tenantId?: string): Promise<void> {
  const supabase = getSupabase()
  const idToUse = tenantId ?? getTenantId()
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', id)
    .eq('tenant_id', idToUse)
  if (error) {
    console.error('Supabase deleteSubmission:', error)
    throw new Error('Não foi possível excluir.')
  }
}

export async function deleteSubmissions(ids: string[], tenantId?: string): Promise<void> {
  if (ids.length === 0) return
  const supabase = getSupabase()
  const idToUse = tenantId ?? getTenantId()
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('tenant_id', idToUse)
    .in('id', ids)
  if (error) {
    console.error('Supabase deleteSubmissions:', error)
    throw new Error('Não foi possível excluir.')
  }
}
