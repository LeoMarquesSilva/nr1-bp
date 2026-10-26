/**
 * Motor de pesquisas internas (anônimas): tipos de pergunta, validação, paginação e agregação de resultados.
 * O diagnóstico NR-1 (HSE-IT) não passa por aqui: é instrumento validado, com dados e cálculo próprios (hseIt.ts).
 */

export type QuestionType = 'escala' | 'frequencia' | 'sim_nao' | 'multipla' | 'aberta'

/** `hint` descreve os extremos da escala de 1 a 5. */
export type SurveyOption = { key: string; label: string; hint?: string }

export interface SurveyQuestion {
  id: string
  type: QuestionType
  text: string
  required: boolean
  /** Escala e frequência: oferece "Prefiro não responder". */
  allowNR?: boolean
  /** Frequência: quando a resposta indica ocorrência, sugere o Canal de Denúncias. */
  canalHint?: boolean
  /** Múltipla escolha. */
  options?: SurveyOption[]
  maxSelections?: number
  allowOther?: boolean
}

export type MultiAnswer = { selected: string[]; outro?: string }
export type AnswerValue = string | MultiAnswer
/** Chave = id da pergunta. */
export type SurveyAnswers = Record<string, AnswerValue>

export const NR_OPTION: SurveyOption = { key: 'nr', label: 'Prefiro não responder' }
export const OTHER_KEY = 'outros'
export const OTHER_LABEL = 'Outros'

export const ESCALA_OPTIONS: readonly SurveyOption[] = [
  { key: '1', label: '1', hint: 'Discordo totalmente' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '4', label: '4' },
  { key: '5', label: '5', hint: 'Concordo totalmente' },
]

export const FREQUENCIA_OPTIONS: readonly SurveyOption[] = [
  { key: 'nunca', label: 'Nunca' },
  { key: 'raramente', label: 'Raramente' },
  { key: 'as_vezes', label: 'Às vezes' },
  { key: 'frequentemente', label: 'Frequentemente' },
]

export const SIM_NAO_OPTIONS: readonly SurveyOption[] = [
  { key: 'sim', label: 'Sim' },
  { key: 'nao', label: 'Não' },
]

export const QUESTION_TYPES: readonly { type: QuestionType; label: string; description: string }[] = [
  { type: 'escala', label: 'Escala de 1 a 5', description: 'Discordo totalmente a concordo totalmente' },
  { type: 'frequencia', label: 'Frequência', description: 'Nunca, raramente, às vezes, frequentemente' },
  { type: 'sim_nao', label: 'Sim ou não', description: 'Duas opções' },
  { type: 'multipla', label: 'Múltipla escolha', description: 'Opções definidas por você, com limite' },
  { type: 'aberta', label: 'Resposta aberta', description: 'Texto livre, opcional' },
]

export const TEXT_MAX_LENGTH = 1000
export const QUESTION_MAX_LENGTH = 400
export const DEFAULT_MIN_RESPONSES = 5
export const MIN_RESPONSES_CHOICES = [3, 5, 7, 10] as const
export const QUESTIONS_PER_PAGE = 4

export const DEFAULT_INTRO =
  'Esta pesquisa é anônima: não pedimos nome, e-mail, cargo nem setor, e as respostas são analisadas apenas em conjunto. Responda com sinceridade: não há respostas certas ou erradas.'

export function getQuestionTypeLabel(type: QuestionType): string {
  return QUESTION_TYPES.find((t) => t.type === type)?.label ?? type
}

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function newQuestionId(): string {
  return randomId('q')
}

export function newOptionKey(): string {
  return randomId('o')
}

export function createQuestion(type: QuestionType): SurveyQuestion {
  const base = { id: newQuestionId(), type, text: '' }
  switch (type) {
    case 'escala':
    case 'frequencia':
      return { ...base, required: true, allowNR: true }
    case 'sim_nao':
      return { ...base, required: true }
    case 'multipla':
      return {
        ...base,
        required: true,
        options: [
          { key: newOptionKey(), label: '' },
          { key: newOptionKey(), label: '' },
        ],
        maxSelections: 1,
        allowOther: false,
      }
    case 'aberta':
      return { ...base, required: false }
  }
}

/** Troca o tipo mantendo o texto da pergunta. */
export function changeQuestionType(q: SurveyQuestion, type: QuestionType): SurveyQuestion {
  if (q.type === type) return q
  return { ...createQuestion(type), id: q.id, text: q.text }
}

/** Opções que a pessoa vê (inclui "Prefiro não responder" e "Outros" quando configurados). */
export function getAnswerOptions(q: SurveyQuestion): SurveyOption[] {
  switch (q.type) {
    case 'escala':
      return q.allowNR ? [...ESCALA_OPTIONS, NR_OPTION] : [...ESCALA_OPTIONS]
    case 'frequencia':
      return q.allowNR ? [...FREQUENCIA_OPTIONS, NR_OPTION] : [...FREQUENCIA_OPTIONS]
    case 'sim_nao':
      return [...SIM_NAO_OPTIONS]
    case 'multipla':
      return [...(q.options ?? []), ...(q.allowOther ? [{ key: OTHER_KEY, label: OTHER_LABEL }] : [])]
    case 'aberta':
      return []
  }
}

export function isMultiAnswer(value: unknown): value is MultiAnswer {
  return Boolean(value) && typeof value === 'object' && Array.isArray((value as MultiAnswer).selected)
}

function maxSelectionsOf(q: SurveyQuestion): number {
  return Math.max(1, q.maxSelections ?? 1)
}

/** Resposta válida para a pergunta? Perguntas não obrigatórias aceitam vazio. */
export function isQuestionAnswered(q: SurveyQuestion, value: AnswerValue | undefined): boolean {
  if (q.type === 'aberta') {
    return !q.required || (typeof value === 'string' && value.trim().length > 0)
  }
  if (q.type === 'multipla') {
    if (!isMultiAnswer(value) || value.selected.length === 0) return !q.required
    if (value.selected.length > maxSelectionsOf(q)) return false
    const valid = new Set(getAnswerOptions(q).map((o) => o.key))
    if (!value.selected.every((k) => valid.has(k))) return false
    if (value.selected.includes(OTHER_KEY)) return (value.outro ?? '').trim().length > 0
    return true
  }
  if (value === undefined || value === '') return !q.required
  return typeof value === 'string' && getAnswerOptions(q).some((o) => o.key === value)
}

export function paginateQuestions(questions: readonly SurveyQuestion[], perPage = QUESTIONS_PER_PAGE): SurveyQuestion[][] {
  const pages: SurveyQuestion[][] = []
  for (let i = 0; i < questions.length; i += perPage) pages.push(questions.slice(i, i + perPage))
  return pages
}

export function isPageComplete(page: readonly SurveyQuestion[], answers: SurveyAnswers): boolean {
  return page.every((q) => isQuestionAnswered(q, answers[q.id]))
}

/** Mantém só respostas válidas e textos aparados/limitados (o que vai para o banco). */
export function sanitizeAnswers(questions: readonly SurveyQuestion[], answers: SurveyAnswers): SurveyAnswers {
  const out: SurveyAnswers = {}
  for (const q of questions) {
    const value = answers[q.id]
    if (q.type === 'aberta') {
      const text = typeof value === 'string' ? value.trim().slice(0, TEXT_MAX_LENGTH) : ''
      if (text) out[q.id] = text
      continue
    }
    if (q.type === 'multipla') {
      if (!isMultiAnswer(value)) continue
      const valid = new Set(getAnswerOptions(q).map((o) => o.key))
      const selected = [...new Set(value.selected)].filter((k) => valid.has(k)).slice(0, maxSelectionsOf(q))
      if (selected.length === 0) continue
      const outro = selected.includes(OTHER_KEY) ? (value.outro ?? '').trim().slice(0, TEXT_MAX_LENGTH) : ''
      out[q.id] = outro ? { selected, outro } : { selected }
      continue
    }
    if (typeof value === 'string' && value && isQuestionAnswered(q, value)) out[q.id] = value
  }
  return out
}

/** Problemas que impedem abrir a pesquisa (lista vazia = pode abrir). */
export function validateQuestions(questions: readonly SurveyQuestion[]): string[] {
  const problems: string[] = []
  if (questions.length === 0) problems.push('Adicione ao menos uma pergunta.')
  questions.forEach((q, i) => {
    const n = i + 1
    if (!q.text.trim()) problems.push(`Pergunta ${n}: escreva o texto da pergunta.`)
    if (q.type === 'multipla') {
      const labels = (q.options ?? []).map((o) => o.label.trim())
      if (labels.filter(Boolean).length < 2) problems.push(`Pergunta ${n}: inclua ao menos 2 opções.`)
      if (labels.some((l) => !l)) problems.push(`Pergunta ${n}: há opções sem texto.`)
      const lower = labels.filter(Boolean).map((l) => l.toLowerCase())
      if (new Set(lower).size !== lower.length) problems.push(`Pergunta ${n}: há opções repetidas.`)
      const total = getAnswerOptions(q).length
      if (maxSelectionsOf(q) > total) problems.push(`Pergunta ${n}: o limite de seleções passa do número de opções.`)
    }
  })
  return problems
}

/** Remove "Outros" de opções da múltipla e normaliza campos, para salvar no banco. */
export function normalizeQuestions(questions: readonly SurveyQuestion[]): SurveyQuestion[] {
  return questions.map((q) => {
    const base: SurveyQuestion = { id: q.id, type: q.type, text: q.text.slice(0, QUESTION_MAX_LENGTH), required: q.required }
    if (q.type === 'escala' || q.type === 'frequencia') return { ...base, allowNR: Boolean(q.allowNR), ...(q.canalHint ? { canalHint: true } : {}) }
    if (q.type === 'multipla') {
      return {
        ...base,
        options: (q.options ?? []).filter((o) => o.key !== OTHER_KEY).map((o) => ({ key: o.key, label: o.label.slice(0, 120) })),
        maxSelections: maxSelectionsOf(q),
        allowOther: Boolean(q.allowOther),
      }
    }
    return base
  })
}

/** Lê perguntas vindas do banco (jsonb), descartando o que não tiver formato válido. */
export function parseQuestions(raw: unknown): SurveyQuestion[] {
  if (!Array.isArray(raw)) return []
  const types = new Set(QUESTION_TYPES.map((t) => t.type))
  return raw.filter(
    (q): q is SurveyQuestion =>
      Boolean(q) && typeof q === 'object' && typeof (q as SurveyQuestion).id === 'string' && types.has((q as SurveyQuestion).type) && typeof (q as SurveyQuestion).text === 'string'
  )
}

export type QuestionSummary =
  | { kind: 'escala'; question: SurveyQuestion; counts: Record<string, number>; total: number; mean: number | null }
  | { kind: 'opcoes'; question: SurveyQuestion; counts: Record<string, number>; total: number }
  | { kind: 'multipla'; question: SurveyQuestion; counts: Record<string, number>; respondents: number; outros: string[] }
  | { kind: 'aberta'; question: SurveyQuestion; texts: string[] }

/** Agrega as respostas por pergunta (contagens, média 1–5 sem "Prefiro não responder", textos). */
export function summarizeResponses(questions: readonly SurveyQuestion[], responses: readonly SurveyAnswers[]): QuestionSummary[] {
  return questions.map((q): QuestionSummary => {
    if (q.type === 'aberta') {
      const texts = responses
        .map((r) => r[q.id])
        .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((v) => v.trim())
      return { kind: 'aberta', question: q, texts }
    }
    if (q.type === 'multipla') {
      const counts: Record<string, number> = Object.fromEntries(getAnswerOptions(q).map((o) => [o.key, 0]))
      const outros: string[] = []
      let respondents = 0
      for (const r of responses) {
        const v = r[q.id]
        if (!isMultiAnswer(v) || v.selected.length === 0) continue
        respondents++
        for (const key of v.selected) if (key in counts) counts[key]++
        if (v.outro?.trim()) outros.push(v.outro.trim())
      }
      return { kind: 'multipla', question: q, counts, respondents, outros }
    }
    const counts: Record<string, number> = Object.fromEntries(getAnswerOptions(q).map((o) => [o.key, 0]))
    let total = 0
    let sum = 0
    let scored = 0
    for (const r of responses) {
      const v = r[q.id]
      if (typeof v !== 'string' || !(v in counts)) continue
      counts[v]++
      total++
      if (q.type === 'escala' && v !== NR_OPTION.key) {
        sum += Number(v)
        scored++
      }
    }
    if (q.type === 'escala') return { kind: 'escala', question: q, counts, total, mean: scored > 0 ? sum / scored : null }
    return { kind: 'opcoes', question: q, counts, total }
  })
}

/** Modelo embutido: pesquisa de Diversidade e Inclusão (perguntas do documento "PERGUNTAS D&I - atualizado"). */
export const TEMPLATE_DIVERSIDADE = {
  key: 'diversidade-inclusao',
  name: 'Diversidade e Inclusão',
  description: 'Pesquisa interna com 12 perguntas para apoiar a criação do Comitê de Diversidade e Inclusão.',
  intro:
    'Esta pesquisa apoia a criação do Comitê de Diversidade e Inclusão. É anônima: não pedimos nome, e-mail, cargo nem setor, e as respostas são analisadas apenas em conjunto. Responda com sinceridade: não há respostas certas ou erradas.',
  questions: [
    { id: 'q1', type: 'escala', required: true, allowNR: true, text: 'Sinto que posso ser eu mesmo(a) no escritório e que pertenço à equipe.' },
    { id: 'q2', type: 'escala', required: true, allowNR: true, text: 'Minha opinião é ouvida e considerada, independentemente do meu cargo ou perfil.' },
    {
      id: 'q3',
      type: 'frequencia',
      required: true,
      allowNR: true,
      canalHint: true,
      text: 'Já presenciei ou vivenciei comentários, piadas ou comportamentos discriminatórios no escritório.',
    },
    {
      id: 'q4',
      type: 'escala',
      required: true,
      allowNR: true,
      text: 'Eu sei a quem recorrer e confio que haveria seriedade e sigilo se sofresse ou presenciasse discriminação ou assédio.',
    },
    {
      id: 'q5',
      type: 'escala',
      required: true,
      allowNR: true,
      text: 'Os critérios de promoção e crescimento são claros, e as oportunidades (casos relevantes, clientes, palestras, visibilidade) são distribuídas de forma justa.',
    },
    {
      id: 'q6',
      type: 'escala',
      required: true,
      allowNR: true,
      text: 'Todos os colaboradores têm as mesmas chances de chegar à liderança e à sociedade e são reconhecidos pela competência na mesma medida.',
    },
    { id: 'q7', type: 'escala', required: true, allowNR: true, text: 'Vejo no escritório pessoas com trajetória parecida com a minha em posições de liderança.' },
    {
      id: 'q8',
      type: 'escala',
      required: true,
      allowNR: true,
      text: 'O escritório oferece equilíbrio e flexibilidade suficientes para lidar com a vida pessoal e familiar, incluindo maternidade e paternidade, sem prejuízo para a carreira.',
    },
    { id: 'q9', type: 'aberta', required: false, text: 'O que você entende por diversidade e inclusão no ambiente de trabalho?' },
    { id: 'q10', type: 'sim_nao', required: true, text: 'Você entende que o escritório deveria ter um comitê de diversidade e inclusão?' },
    {
      id: 'q11',
      type: 'multipla',
      required: true,
      maxSelections: 3,
      allowOther: true,
      text: 'Quais temas o comitê de diversidade e inclusão deve priorizar?',
      options: [
        { key: 'genero', label: 'Equidade de gênero e liderança feminina' },
        { key: 'raca', label: 'Raça e etnia' },
        { key: 'lgbtqia', label: 'LGBTQIA+' },
        { key: 'pcd', label: 'Pessoas com deficiência' },
        { key: 'parentalidade', label: 'Parentalidade' },
        { key: 'canal_denuncia', label: 'Canal de denúncia' },
        { key: 'treinamentos', label: 'Treinamentos e letramento' },
        { key: 'acoes_sociais', label: 'Ações sociais' },
      ],
    },
    {
      id: 'q12',
      type: 'aberta',
      required: false,
      text: 'Qual ação concreta você gostaria de ver o escritório adotar nos próximos 12 meses em relação à diversidade e à inclusão?',
    },
  ] satisfies SurveyQuestion[],
}
