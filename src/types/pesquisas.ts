import {
  DEFAULT_MIN_RESPONSES,
  normalizeQuestions,
  parseBaseline,
  parseQuestions,
  sanitizeAnswers,
  type SurveyAnswers,
  type SurveyBaseline,
  type SurveyQuestion,
} from '../data/pesquisas'
import { getSupabase } from '../lib/supabase'

export type SurveyStatus = 'rascunho' | 'aberta' | 'encerrada'

export interface SurveyTemplate {
  id: string
  key: string | null
  name: string
  description: string | null
  intro: string | null
  questions: SurveyQuestion[]
  builtin: boolean
  updatedAt: string
}

export interface Survey {
  id: string
  tenantId: string
  title: string
  intro: string | null
  questions: SurveyQuestion[]
  status: SurveyStatus
  minResponses: number
  templateId: string | null
  createdAt: string
  updatedAt: string
  openedAt: string | null
  closedAt: string | null
  /** Resultado de uma aplicação anterior (percentuais), para comparar. */
  baseline: SurveyBaseline | null
}

export interface SurveyStats {
  total: number
  lastOn: string | null
  firstOn: string | null
}

export interface SurveyResponse {
  answers: SurveyAnswers
  /** Só a data (AAAA-MM-DD), sem horário, para preservar o anonimato. */
  submittedOn: string
}

export interface PublicSurvey {
  id: string
  tenantId: string
  title: string
  intro: string | null
  questions: SurveyQuestion[]
  status: SurveyStatus
  minResponses: number
  orgName: string | null
  orgLogo: string | null
  whistleblowerEnabled: boolean
}

const MIGRATION_HINT = 'Confira se a migração 026 foi aplicada no Supabase.'

type SurveyRow = {
  id: string
  tenant_id: string
  title: string
  intro: string | null
  questions: unknown
  status: SurveyStatus
  min_responses: number
  template_id: string | null
  created_at: string
  updated_at: string
  opened_at: string | null
  closed_at: string | null
  baseline: unknown
}

type TemplateRow = {
  id: string
  key: string | null
  name: string
  description: string | null
  intro: string | null
  questions: unknown
  builtin: boolean
  updated_at: string
}

const SURVEY_COLUMNS =
  'id, tenant_id, title, intro, questions, status, min_responses, template_id, created_at, updated_at, opened_at, closed_at, baseline'
const TEMPLATE_COLUMNS = 'id, key, name, description, intro, questions, builtin, updated_at'

function toSurvey(r: SurveyRow): Survey {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    title: r.title,
    intro: r.intro,
    questions: parseQuestions(r.questions),
    status: r.status,
    minResponses: r.min_responses,
    templateId: r.template_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    openedAt: r.opened_at,
    closedAt: r.closed_at,
    baseline: parseBaseline(r.baseline),
  }
}

function toTemplate(r: TemplateRow): SurveyTemplate {
  return {
    id: r.id,
    key: r.key,
    name: r.name,
    description: r.description,
    intro: r.intro,
    questions: parseQuestions(r.questions),
    builtin: r.builtin,
    updatedAt: r.updated_at,
  }
}

/** Mensagens de regra do banco (gatilhos) são seguras para mostrar; o resto vira mensagem genérica. */
function dbError(error: { message?: string; code?: string } | null, fallback: string): Error {
  const msg = error?.message ?? ''
  if (error?.code === 'P0001' && msg) return new Error(msg)
  if (error?.code === '42P01' || msg.includes('does not exist') || msg.includes('schema cache')) {
    return new Error(`${fallback} ${MIGRATION_HINT}`)
  }
  return new Error(fallback)
}

// ---------- Modelos ----------

export async function getSurveyTemplates(): Promise<SurveyTemplate[]> {
  const { data, error } = await getSupabase().from('survey_templates').select(TEMPLATE_COLUMNS).order('builtin', { ascending: false }).order('name')
  if (error) throw dbError(error, 'Não foi possível carregar os modelos.')
  return ((data ?? []) as TemplateRow[]).map(toTemplate)
}

export async function getSurveyTemplate(id: string): Promise<SurveyTemplate | null> {
  const { data, error } = await getSupabase().from('survey_templates').select(TEMPLATE_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw dbError(error, 'Não foi possível carregar o modelo.')
  return data ? toTemplate(data as TemplateRow) : null
}

export async function createSurveyTemplate(input: {
  name: string
  description?: string | null
  intro?: string | null
  questions?: SurveyQuestion[]
}): Promise<SurveyTemplate> {
  const { data, error } = await getSupabase()
    .from('survey_templates')
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      intro: input.intro?.trim() || null,
      questions: normalizeQuestions(input.questions ?? []),
    })
    .select(TEMPLATE_COLUMNS)
    .single()
  if (error) throw dbError(error, 'Não foi possível criar o modelo.')
  return toTemplate(data as TemplateRow)
}

export async function updateSurveyTemplate(
  id: string,
  patch: { name?: string; description?: string | null; intro?: string | null; questions?: SurveyQuestion[] }
): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name.trim()
  if (patch.description !== undefined) row.description = patch.description?.trim() || null
  if (patch.intro !== undefined) row.intro = patch.intro?.trim() || null
  if (patch.questions !== undefined) row.questions = normalizeQuestions(patch.questions)
  const { error } = await getSupabase().from('survey_templates').update(row).eq('id', id)
  if (error) throw dbError(error, 'Não foi possível salvar o modelo.')
}

export async function deleteSurveyTemplate(id: string): Promise<void> {
  const { error } = await getSupabase().from('survey_templates').delete().eq('id', id)
  if (error) throw dbError(error, 'Não foi possível excluir o modelo.')
}

// ---------- Pesquisas ----------

export async function getSurveys(tenantId?: string): Promise<Survey[]> {
  let q = getSupabase().from('surveys').select(SURVEY_COLUMNS).order('created_at', { ascending: false })
  if (tenantId) q = q.eq('tenant_id', tenantId.trim().toLowerCase())
  const { data, error } = await q
  if (error) throw dbError(error, 'Não foi possível carregar as pesquisas.')
  return ((data ?? []) as SurveyRow[]).map(toSurvey)
}

export async function getSurvey(id: string): Promise<Survey | null> {
  const { data, error } = await getSupabase().from('surveys').select(SURVEY_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw dbError(error, 'Não foi possível carregar a pesquisa.')
  return data ? toSurvey(data as SurveyRow) : null
}

export async function createSurvey(input: {
  tenantId: string
  title: string
  intro?: string | null
  questions?: SurveyQuestion[]
  templateId?: string | null
  minResponses?: number
}): Promise<Survey> {
  const { data, error } = await getSupabase()
    .from('surveys')
    .insert({
      tenant_id: input.tenantId.trim().toLowerCase(),
      title: input.title.trim(),
      intro: input.intro?.trim() || null,
      questions: normalizeQuestions(input.questions ?? []),
      template_id: input.templateId ?? null,
      min_responses: input.minResponses ?? DEFAULT_MIN_RESPONSES,
    })
    .select(SURVEY_COLUMNS)
    .single()
  if (error) throw dbError(error, 'Não foi possível criar a pesquisa.')
  return toSurvey(data as SurveyRow)
}

export async function updateSurvey(
  id: string,
  patch: { title?: string; intro?: string | null; questions?: SurveyQuestion[]; minResponses?: number }
): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.title !== undefined) row.title = patch.title.trim()
  if (patch.intro !== undefined) row.intro = patch.intro?.trim() || null
  if (patch.questions !== undefined) row.questions = normalizeQuestions(patch.questions)
  if (patch.minResponses !== undefined) row.min_responses = patch.minResponses
  const { error } = await getSupabase().from('surveys').update(row).eq('id', id)
  if (error) throw dbError(error, 'Não foi possível salvar a pesquisa.')
}

export async function setSurveyStatus(id: string, status: SurveyStatus): Promise<Survey> {
  const { data, error } = await getSupabase().from('surveys').update({ status }).eq('id', id).select(SURVEY_COLUMNS).single()
  if (error) throw dbError(error, 'Não foi possível alterar o status da pesquisa.')
  return toSurvey(data as SurveyRow)
}

export async function deleteSurvey(id: string): Promise<void> {
  const { error } = await getSupabase().from('surveys').delete().eq('id', id)
  if (error) throw dbError(error, 'Não foi possível excluir a pesquisa.')
}

/** Totais de respostas por pesquisa (view com RLS: só admin). */
export async function getSurveyStats(surveyIds: string[]): Promise<Record<string, SurveyStats>> {
  if (surveyIds.length === 0) return {}
  const { data, error } = await getSupabase().from('survey_response_stats').select('survey_id, total, last_on, first_on').in('survey_id', surveyIds)
  if (error) throw dbError(error, 'Não foi possível carregar os totais de respostas.')
  return Object.fromEntries(
    ((data ?? []) as { survey_id: string; total: number; last_on: string | null; first_on: string | null }[]).map((r) => [
      r.survey_id,
      { total: r.total, lastOn: r.last_on, firstOn: r.first_on },
    ])
  )
}

export async function getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  const { data, error } = await getSupabase()
    .from('survey_responses')
    .select('answers, submitted_on')
    .eq('survey_id', surveyId)
    .order('submitted_on', { ascending: false })
  if (error) throw dbError(error, 'Não foi possível carregar as respostas.')
  return ((data ?? []) as { answers: unknown; submitted_on: string }[]).map((r) => ({
    answers: (r.answers && typeof r.answers === 'object' ? r.answers : {}) as SurveyAnswers,
    submittedOn: r.submitted_on,
  }))
}

/** Apaga todas as respostas da pesquisa (ex.: respostas de teste antes de divulgar o link). */
export async function deleteSurveyResponses(surveyId: string): Promise<void> {
  const { error } = await getSupabase().from('survey_responses').delete().eq('survey_id', surveyId)
  if (error) throw dbError(error, 'Não foi possível apagar as respostas.')
}

// ---------- Público ----------

export async function getPublicSurvey(id: string): Promise<PublicSurvey | null> {
  const { data, error } = await getSupabase().rpc('get_public_survey', { p_id: id })
  if (error) {
    console.error('Supabase get_public_survey:', error)
    return null
  }
  const r = (data as Record<string, unknown>[] | null)?.[0]
  if (!r) return null
  return {
    id: String(r.id),
    tenantId: String(r.tenant_id),
    title: String(r.title),
    intro: (r.intro as string | null) ?? null,
    questions: parseQuestions(r.questions),
    status: r.status as SurveyStatus,
    minResponses: Number(r.min_responses) || DEFAULT_MIN_RESPONSES,
    orgName: (r.org_name as string | null)?.trim() || null,
    orgLogo: (r.org_logo as string | null)?.trim() || null,
    whistleblowerEnabled: r.whistleblower_enabled === true,
  }
}

export async function submitSurveyResponse(survey: Pick<PublicSurvey, 'id' | 'questions'>, answers: SurveyAnswers): Promise<void> {
  const { error } = await getSupabase()
    .from('survey_responses')
    .insert({ survey_id: survey.id, answers: sanitizeAnswers(survey.questions, answers) })
  if (error) {
    console.error('Supabase submitSurveyResponse:', error)
    if (error.code === 'P0001') throw new Error('Esta pesquisa não está mais recebendo respostas.')
    throw new Error('Não foi possível enviar sua resposta. Tente novamente.')
  }
  // Sem .select(): para anon, o RLS não permite ler a linha inserida.
}
