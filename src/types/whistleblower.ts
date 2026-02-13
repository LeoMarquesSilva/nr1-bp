import { getSupabase } from '../lib/supabase'
import { getTenantId } from '../lib/tenant'

export interface WhistleblowerReport {
  id: string
  tenant_id: string
  category: string | null
  body: string
  created_at: string
  read_at: string | null
}

export async function saveWhistleblowerReport(data: {
  category?: string
  body: string
}): Promise<void> {
  const supabase = getSupabase()
  const tenantId = getTenantId()
  const { error } = await supabase.from('whistleblower_reports').insert({
    tenant_id: tenantId,
    category: data.category?.trim() || null,
    body: data.body.trim(),
  })
  if (error) {
    console.error('Supabase saveWhistleblowerReport:', error)
    throw new Error('Não foi possível enviar. Tente novamente.')
  }
}

export async function getWhistleblowerReports(tenantId?: string): Promise<WhistleblowerReport[]> {
  const supabase = getSupabase()
  let q = supabase
    .from('whistleblower_reports')
    .select('id, tenant_id, category, body, created_at, read_at')
    .order('created_at', { ascending: false })
  if (tenantId) q = q.eq('tenant_id', tenantId)
  const { data, error } = await q
  if (error) {
    console.error('Supabase getWhistleblowerReports:', error)
    return []
  }
  return (data ?? []) as WhistleblowerReport[]
}

export async function markWhistleblowerReportRead(id: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('whistleblower_reports')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) console.error('Supabase markWhistleblowerReportRead:', error)
}
