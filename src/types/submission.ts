import type { OptionKey } from '../data/hseIt'
import { getSupabase } from '../lib/supabase'
import { getTenantId } from '../lib/tenant'
import type { Database } from './database'

export interface Submission {
  id: string
  setor: string
  funcao: string
  answers: Record<number, OptionKey>
  submittedAt: string // ISO
}

type SubmissionRow = Database['public']['Tables']['submissions']['Row']
type SubmissionSelectedRow = Omit<SubmissionRow, 'tenant_id'>

function rowToSubmission(row: SubmissionSelectedRow): Submission {
  return {
    id: row.id,
    setor: row.setor,
    funcao: row.funcao ?? '',
    answers: row.answers as Record<number, OptionKey>,
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
  return (data ?? []).map((r) => r.tenant_id)
}

export interface TenantOverviewItem {
  tenant_id: string
  submission_count: number
  last_submitted_at: string | null
}

export interface TenantGroupCnpj {
  cnpj: string
  razao_social: string
}

/** Lista empresas com total de respostas e data da última (para a visão geral). */
export async function getTenantOverview(): Promise<TenantOverviewItem[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('tenant_overview').select('tenant_id, submission_count, last_submitted_at')
  if (error) {
    console.error('Supabase getTenantOverview:', error)
    return []
  }
  return (data ?? []).map((row) => ({
    tenant_id: row.tenant_id,
    submission_count: row.submission_count,
    last_submitted_at: row.last_submitted_at,
  }))
}

export interface TenantRegistryItem {
  tenant_id: string
  display_name: string | null
  active: boolean
  whistleblower_enabled: boolean
  /** URL pública da logomarca (externa ou Storage). */
  logo_url?: string | null
  cnpj?: string | null
  cnpjs?: Array<string | TenantGroupCnpj>
  nicho?: string | null
  setores?: string[]
}

/** Busca pública de organizações por nome ou slug (para página "Fazer relato" → selecionar empresa). */
export type OrganizationSearchHit = {
  tenant_id: string
  display_name: string | null
  logo_url: string | null
}

export async function searchOrganizations(query: string): Promise<OrganizationSearchHit[]> {
  const supabase = getSupabase()
  const normalized = query.trim().slice(0, 80)
  if (normalized.length < 2) return []
  const { data, error } = await supabase.rpc('search_organizations', { p_query: normalized })
  if (error) {
    console.error('Supabase search_organizations:', error)
    return []
  }
  return (data ?? []).map((r: { tenant_id: string; display_name: string | null; logo_url?: string | null }) => ({
    tenant_id: r.tenant_id,
    display_name: r.display_name ?? null,
    logo_url: r.logo_url?.trim() || null,
  }))
}

function mapTenantRegistryRow(r: {
  tenant_id: string
  display_name: string | null
  active: boolean
  whistleblower_enabled?: boolean
  logo_url?: string | null
  cnpj?: string | null
  cnpjs?: unknown
  nicho?: string | null
  setores?: unknown
}): TenantRegistryItem {
  return {
    tenant_id: r.tenant_id,
    display_name: r.display_name ?? null,
    active: r.active ?? true,
    whistleblower_enabled: r.whistleblower_enabled ?? true,
    logo_url: r.logo_url?.trim() || null,
    cnpj: r.cnpj ?? null,
    cnpjs: Array.isArray(r.cnpjs)
      ? (r.cnpjs as unknown[]).filter((entry) => {
          if (typeof entry === 'string') return true
          if (!entry || typeof entry !== 'object') return false
          const obj = entry as Record<string, unknown>
          return typeof obj.cnpj === 'string'
        }) as Array<string | TenantGroupCnpj>
      : [],
    nicho: r.nicho ?? null,
    setores: Array.isArray(r.setores) ? (r.setores as string[]) : [],
  }
}

/** Lista as empresas do registro (com nome, status e dados estendidos). */
export async function getTenantRegistry(): Promise<TenantRegistryItem[]> {
  const supabase = getSupabase()
  const selectWithLogo =
    'tenant_id, display_name, active, whistleblower_enabled, logo_url, cnpj, cnpjs, nicho, setores'
  const selectBase =
    'tenant_id, display_name, active, whistleblower_enabled, cnpj, cnpjs, nicho, setores'

  const first = await supabase
    .from('tenant_registry')
    .select(selectWithLogo)
    .order('created_at', { ascending: false })

  const toItems = (raw: unknown): TenantRegistryItem[] =>
    (Array.isArray(raw) ? raw : []).map((r) =>
      mapTenantRegistryRow(r as Parameters<typeof mapTenantRegistryRow>[0])
    )

  if (!first.error) {
    return toItems(first.data)
  }

  const hint = `${first.error.message ?? ''} ${(first.error as { details?: string }).details ?? ''}`.toLowerCase()
  const missingLogoColumn =
    hint.includes('logo_url') ||
    (hint.includes('column') && hint.includes('does not exist')) ||
    first.error.code === '42703'

  if (missingLogoColumn) {
    const fallback = await supabase
      .from('tenant_registry')
      .select(selectBase)
      .order('created_at', { ascending: false })
    if (!fallback.error && fallback.data?.length) {
      console.warn(
        'getTenantRegistry: coluna logo_url indisponível no banco; aplicar migração 024_tenant_logo.sql para logomarcas.'
      )
    }
    if (fallback.error) {
      console.error('Supabase getTenantRegistry:', fallback.error)
      return []
    }
    return toItems(fallback.data)
  }

  console.error('Supabase getTenantRegistry:', first.error)
  return []
}

/** Verifica se o canal de denúncias está habilitado para o tenant. */
export async function getTenantWhistleblowerStatus(tenantId: string): Promise<{ enabled: boolean }> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('tenant_registry')
    .select('whistleblower_enabled')
    .eq('tenant_id', tenantId.trim().toLowerCase())
    .maybeSingle()
  return { enabled: data?.whistleblower_enabled ?? true }
}

/** Retorna o display_name do tenant (para exibir no hub do canal de relatos). */
export async function getTenantDisplayName(tenantId: string): Promise<string | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('tenant_registry')
    .select('display_name')
    .eq('tenant_id', tenantId.trim().toLowerCase())
    .maybeSingle()
  return data?.display_name?.trim() ?? null
}

/** Nome e logo para exibição pública (hub, etc.), via RPC security definer. */
export async function getTenantPublicBranding(
  tenantId: string
): Promise<{ display_name: string | null; logo_url: string | null }> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('get_tenant_public_branding', {
    p_tenant_id: tenantId.trim().toLowerCase(),
  })
  if (error) {
    console.error('Supabase get_tenant_public_branding:', error)
    return { display_name: null, logo_url: null }
  }
  const rows = data as { display_name: string | null; logo_url: string | null }[] | null
  const r = rows?.[0]
  if (!r) return { display_name: null, logo_url: null }
  return {
    display_name: r.display_name?.trim() ?? null,
    logo_url: r.logo_url?.trim() || null,
  }
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
  updates: { display_name?: string | null; active?: boolean; whistleblower_enabled?: boolean }
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

/** Remove empresa da lista (não apaga envios), via RPC que verifica is_admin(). */
export async function deleteTenantFromRegistry(tenantId: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.rpc('delete_tenant_registry', {
    p_tenant_id: tenantId.trim().toLowerCase(),
  })
  if (error) {
    console.error('Supabase deleteTenantFromRegistry:', error)
    throw new Error(error.message === 'Acesso negado: apenas administradores podem remover empresas do registro.' ? error.message : 'Não foi possível remover da lista.')
  }
}

/** Adiciona uma empresa à lista do admin (ao clicar em "Adicionar à lista"). */
export async function addTenantToRegistry(tenantId: string, displayName?: string): Promise<void> {
  const slug = tenantId.trim().toLowerCase()
  if (!slug) return
  await upsertTenantRegistry({
    tenant_id: slug,
    display_name: displayName?.trim() || null,
  })
}

/** Retorna as opções de setor do tenant (para o formulário de diagnóstico). Se vazio, usar lista padrão. */
export async function getTenantSetores(tenantId: string): Promise<string[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('tenant_registry')
    .select('setores')
    .eq('tenant_id', tenantId.trim().toLowerCase())
    .maybeSingle()
  const setores = data?.setores
  return Array.isArray(setores) ? (setores as string[]) : []
}

/** Cria ou atualiza empresa no registro (admin), via RPC que verifica is_admin(). */
export async function upsertTenantRegistry(payload: {
  tenant_id: string
  display_name?: string | null
  active?: boolean
  whistleblower_enabled?: boolean
  logo_url?: string | null
  cnpj?: string | null
  cnpjs?: Array<string | TenantGroupCnpj>
  nicho?: string | null
  setores?: string[]
}): Promise<void> {
  const supabase = getSupabase()
  const slug = payload.tenant_id.trim().toLowerCase()
  if (!slug) throw new Error('tenant_id é obrigatório.')
  const { error } = await supabase.rpc('upsert_tenant_registry', {
    p_tenant_id: slug,
    p_display_name: payload.display_name?.trim() || null,
    p_active: payload.active ?? true,
    p_cnpj: payload.cnpj?.trim() || null,
    p_cnpjs: Array.isArray(payload.cnpjs) ? payload.cnpjs : [],
    p_nicho: payload.nicho?.trim() || null,
    p_setores: Array.isArray(payload.setores) ? payload.setores : [],
    p_whistleblower_enabled: payload.whistleblower_enabled ?? true,
    p_logo_url: payload.logo_url?.trim() || null,
  })
  if (error) {
    console.error('Supabase upsertTenantRegistry:', error)
    throw new Error(error.message === 'Acesso negado: apenas administradores podem alterar o registro de empresas.' ? error.message : 'Não foi possível salvar a empresa.')
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
  return ((data ?? []) as SubmissionSelectedRow[]).map(rowToSubmission)
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
  const { error } = await supabase.from('submissions').insert(row)

  if (error) {
    console.error('Supabase saveSubmission:', error)
    throw new Error('Não foi possível enviar o diagnóstico. Tente novamente.')
  }
  // Não usamos .select().single() porque, para anon, o RLS bloqueia SELECT em submissions.
  // O fluxo só precisa indicar sucesso; a UI não usa o retorno.
  return {
    id: '',
    setor,
    funcao: '',
    answers,
    submittedAt: new Date().toISOString(),
  }
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
