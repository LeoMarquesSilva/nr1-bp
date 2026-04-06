import { getSupabase } from '../lib/supabase'
import { getTenantId } from '../lib/tenant'
import { MAX_EVIDENCE_BYTES, MAX_EVIDENCE_FILES } from '../data/denunciaForm'
import type { Database } from './database'

export type WhistleblowerStatus = 'recebida' | 'em_analise' | 'concluida' | 'arquivada'

export type EvidencePathEntry = { path: string; original_name: string }

export interface WhistleblowerReport {
  id: string
  tenant_id: string
  protocol_id: string | null
  category: string | null
  body: string
  created_at: string
  read_at: string | null
  status: WhistleblowerStatus
  is_anonymous?: boolean
  reporter_name?: string | null
  reporter_contact?: string | null
  subject?: string | null
  accused_relationship?: string | null
  complaint_category?: string | null
  complainant_gender?: string | null
  incident_date?: string | null
  location_has_camera?: string | null
  evidence_paths?: EvidencePathEntry[] | null
}

type WhistleblowerRow = Database['public']['Tables']['whistleblower_reports']['Row']

/** Gera um protocol_id único no formato WB-XXXXXXXX (8 caracteres alfanuméricos). */
export function generateProtocolId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = 'WB-'
  for (let i = 0; i < 8; i++) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }
  return s
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'arquivo'
}

async function uploadEvidenceFiles(
  tenantId: string,
  protocolId: string,
  files: File[]
): Promise<EvidencePathEntry[]> {
  if (files.length === 0) return []
  if (files.length > MAX_EVIDENCE_FILES) {
    throw new Error(`No máximo ${MAX_EVIDENCE_FILES} arquivos por denúncia.`)
  }
  const supabase = getSupabase()
  const out: EvidencePathEntry[] = []
  for (const file of files) {
    if (file.size > MAX_EVIDENCE_BYTES) {
      throw new Error(`O arquivo "${file.name}" excede o tamanho máximo permitido (10 MB).`)
    }
    const safe = sanitizeFileName(file.name)
    const storagePath = `${tenantId}/${protocolId}/${Date.now()}_${safe}`
    const { error } = await supabase.storage.from('whistleblower-evidence').upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) {
      console.error('Storage upload:', error)
      throw new Error(`Não foi possível enviar o arquivo "${file.name}". Tente outro formato ou tamanho menor.`)
    }
    out.push({ path: storagePath, original_name: file.name })
  }
  return out
}

export type SaveWhistleblowerPayload = {
  subject: string
  accusedRelationship: string
  complaintCategory: string
  complainantGender: string
  incidentDate: string
  locationHasCamera: 'sim' | 'nao'
  body: string
  isAnonymous: boolean
  reporterName?: string
  reporterContact?: string
  evidenceFiles?: File[]
}

export async function saveWhistleblowerReport(data: SaveWhistleblowerPayload): Promise<{ protocolId: string }> {
  const supabase = getSupabase()
  const tenantId = getTenantId()
  const protocolId = generateProtocolId()
  const isAnonymous = data.isAnonymous

  const evidence_paths = await uploadEvidenceFiles(tenantId, protocolId, data.evidenceFiles ?? [])

  const complaintCategory = data.complaintCategory.trim()
  const subject = data.subject.trim()

  const { error } = await supabase.from('whistleblower_reports').insert({
    tenant_id: tenantId,
    protocol_id: protocolId,
    category: complaintCategory,
    body: data.body.trim(),
    status: 'recebida',
    is_anonymous: isAnonymous,
    reporter_name: isAnonymous ? null : data.reporterName?.trim() || null,
    reporter_contact: isAnonymous ? null : data.reporterContact?.trim() || null,
    subject,
    accused_relationship: data.accusedRelationship.trim(),
    complaint_category: complaintCategory,
    complainant_gender: data.complainantGender.trim(),
    incident_date: data.incidentDate.trim(),
    location_has_camera: data.locationHasCamera,
    evidence_paths: evidence_paths.length > 0 ? evidence_paths : [],
  })

  if (error) {
    console.error('Supabase saveWhistleblowerReport:', error)
    throw new Error('Não foi possível enviar. Tente novamente.')
  }
  return { protocolId }
}

/** URL temporária para admin baixar/visualizar prova (bucket privado). */
export async function getWhistleblowerEvidenceSignedUrl(
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.storage
    .from('whistleblower-evidence')
    .createSignedUrl(storagePath, expiresInSeconds)
  if (error) {
    console.error('Signed URL:', error)
    return null
  }
  return data?.signedUrl ?? null
}

export async function getWhistleblowerReports(tenantId?: string): Promise<WhistleblowerReport[]> {
  const supabase = getSupabase()
  let q = supabase
    .from('whistleblower_reports')
    .select(
      [
        'id',
        'tenant_id',
        'protocol_id',
        'category',
        'body',
        'created_at',
        'read_at',
        'status',
        'is_anonymous',
        'reporter_name',
        'reporter_contact',
        'subject',
        'accused_relationship',
        'complaint_category',
        'complainant_gender',
        'incident_date',
        'location_has_camera',
        'evidence_paths',
      ].join(', ')
    )
    .order('created_at', { ascending: false })
  if (tenantId) q = q.eq('tenant_id', tenantId)
  const { data, error } = await q
  if (error) {
    console.error('Supabase getWhistleblowerReports:', error)
    return []
  }
  return ((data ?? []) as unknown as WhistleblowerRow[]).map((row) => ({
    id: row.id,
    tenant_id: row.tenant_id,
    protocol_id: row.protocol_id,
    category: row.category,
    body: row.body,
    created_at: row.created_at,
    read_at: row.read_at,
    status: row.status as WhistleblowerStatus,
    is_anonymous: row.is_anonymous ?? undefined,
    reporter_name: row.reporter_name,
    reporter_contact: row.reporter_contact,
    subject: row.subject,
    accused_relationship: row.accused_relationship,
    complaint_category: row.complaint_category,
    complainant_gender: row.complainant_gender,
    incident_date: row.incident_date,
    location_has_camera: row.location_has_camera,
    evidence_paths: Array.isArray(row.evidence_paths) ? (row.evidence_paths as EvidencePathEntry[]) : [],
  }))
}

/** Consulta pública: retorna apenas status e data pelo protocol_id (sem expor o conteúdo da denúncia). */
export async function getWhistleblowerStatusByProtocol(
  protocolId: string
): Promise<{ status: string; created_at: string } | null> {
  const supabase = getSupabase()
  const normalized = protocolId.trim().toUpperCase()
  if (!/^WB-[A-Z0-9]{8}$/.test(normalized)) return null
  const { data, error } = await supabase.rpc('get_whistleblower_status', {
    p_protocol_id: normalized,
  })
  if (error) {
    console.error('Supabase get_whistleblower_status:', error)
    return null
  }
  if (!data || data.length === 0) return null
  const row = data[0]
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
