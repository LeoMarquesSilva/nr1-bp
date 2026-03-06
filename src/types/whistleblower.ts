import { getSupabase } from '../lib/supabase'
import { getTenantId } from '../lib/tenant'

export type WhistleblowerStatus = 'recebida' | 'em_analise' | 'concluida' | 'arquivada'

export interface WhistleblowerReport {
  id: string
  tenant_id: string
  protocol_id: string | null
  category: string | null
  body: string
  created_at: string
  read_at: string | null
  status: WhistleblowerStatus
}

/** Gera um protocol_id único no formato WB-XXXXXXXX (8 caracteres alfanuméricos). */
function generateProtocolId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = 'WB-'
  for (let i = 0; i < 8; i++) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }
  return s
}

export async function saveWhistleblowerReport(data: {
  category?: string
  body: string
}): Promise<{ protocolId: string }> {
  const supabase = getSupabase()
  const tenantId = getTenantId()
  const protocolId = generateProtocolId()
  const { error } = await supabase.from('whistleblower_reports').insert({
    tenant_id: tenantId,
    protocol_id: protocolId,
    category: data.category?.trim() || null,
    body: data.body.trim(),
    status: 'recebida',
  })
  if (error) {
    console.error('Supabase saveWhistleblowerReport:', error)
    throw new Error('Não foi possível enviar. Tente novamente.')
  }
  return { protocolId }
}

export async function getWhistleblowerReports(tenantId?: string): Promise<WhistleblowerReport[]> {
  const supabase = getSupabase()
  let q = supabase
    .from('whistleblower_reports')
    .select('id, tenant_id, protocol_id, category, body, created_at, read_at, status')
    .order('created_at', { ascending: false })
  if (tenantId) q = q.eq('tenant_id', tenantId)
  const { data, error } = await q
  if (error) {
    console.error('Supabase getWhistleblowerReports:', error)
    return []
  }
  return (data ?? []) as WhistleblowerReport[]
}

/** Consulta pública: retorna apenas status e data pelo protocol_id (anon, sem expor o relato). */
export async function getWhistleblowerStatusByProtocol(
  protocolId: string
): Promise<{ status: string; created_at: string } | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('get_whistleblower_status', {
    p_protocol_id: protocolId.trim(),
  })
  if (error) {
    console.error('Supabase get_whistleblower_status:', error)
    return null
  }
  if (!data || data.length === 0) return null
  const row = data[0] as { status: string; created_at: string }
  return { status: row.status, created_at: row.created_at }
}

export async function markWhistleblowerReportRead(id: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('whistleblower_reports')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) console.error('Supabase markWhistleblowerReportRead:', error)
}

export async function updateWhistleblowerStatus(
  id: string,
  status: WhistleblowerStatus
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('whistleblower_reports')
    .update({ status })
    .eq('id', id)
  if (error) console.error('Supabase updateWhistleblowerStatus:', error)
}
