/**
 * Motor de pesquisas internas (anônimas): tipos de pergunta, validação, paginação e agregação de resultados.
 * O diagnóstico NR-1 (HSE-IT) não passa por aqui: é instrumento validado, com dados e cálculo próprios (hseIt.ts).
 */

export type QuestionType = 'escala' | 'frequencia' | 'sim_nao' | 'multipla' | 'nota' | 'aberta'

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
  /** Sim ou não: a resposta que encerra a pesquisa (as perguntas seguintes não aparecem). */
  endIf?: 'sim' | 'nao'
  /** Escala: rótulos dos 5 pontos, do pior para o melhor. Sem rótulos, mostra os números de 1 a 5. */
  labels?: string[]
  /** Agrupamento nos resultados e nas partes (ex.: dimensão "Credibilidade", tema "Comunicação da liderança"). */
  section?: string
  theme?: string
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

export const NOTA_OPTIONS: readonly SurveyOption[] = Array.from({ length: 11 }, (_, i) => ({ key: String(i), label: String(i) }))

/** Rótulos prontos para a escala de 5 pontos (do pior para o melhor). */
export const SCALE_PRESETS: readonly { id: string; label: string; labels: readonly string[] | null }[] = [
  { id: 'numeros', label: 'Números de 1 a 5 (discordo → concordo)', labels: null },
  { id: 'concordancia', label: 'Concordância por extenso', labels: ['Discordo totalmente', 'Discordo', 'Nem discordo, nem concordo', 'Concordo', 'Concordo totalmente'] },
  { id: 'frequencia', label: 'Frequência (nunca → sempre)', labels: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'] },
  { id: 'qualidade', label: 'Qualidade (muito ruim → excelente)', labels: ['Muito ruim', 'Ruim', 'Média', 'Boa', 'Excelente'] },
]

export const QUESTION_TYPES: readonly { type: QuestionType; label: string; description: string }[] = [
  { type: 'escala', label: 'Escala de 1 a 5', description: 'Discordo a concordo, ou rótulos próprios' },
  { type: 'frequencia', label: 'Frequência', description: 'Nunca, raramente, às vezes, frequentemente' },
  { type: 'sim_nao', label: 'Sim ou não', description: 'Duas opções' },
  { type: 'multipla', label: 'Múltipla escolha', description: 'Opções definidas por você, com limite' },
  { type: 'nota', label: 'Nota de 0 a 10', description: 'Média e distribuição das notas' },
  { type: 'aberta', label: 'Resposta aberta', description: 'Texto livre, opcional' },
]

export const TEXT_MAX_LENGTH = 1000
export const QUESTION_MAX_LENGTH = 400
export const DEFAULT_MIN_RESPONSES = 5
export const MIN_RESPONSES_CHOICES = [3, 5, 7, 10] as const
export const QUESTIONS_PER_PAGE = 4

export const DEFAULT_INTRO =
  'Esta pesquisa é anônima: não pedimos nome, e-mail, cargo nem setor, e as respostas são analisadas apenas em conjunto. Responda com sinceridade: não há respostas certas ou erradas.'

export type IntroSegment = { text: string; bold: boolean }

/**
 * Texto de abertura em parágrafos (separados por linha em branco), com *trechos entre asteriscos* em negrito,
 * como no WhatsApp. Asterisco sem par fica como está.
 */
export function parseIntro(text: string): IntroSegment[][] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const out: IntroSegment[] = []
      let last = 0
      for (const m of p.matchAll(/\*([^*\n]+)\*/g)) {
        if (m.index > last) out.push({ text: p.slice(last, m.index), bold: false })
        out.push({ text: m[1], bold: true })
        last = m.index + m[0].length
      }
      if (last < p.length) out.push({ text: p.slice(last), bold: false })
      return out
    })
}

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
    case 'nota':
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

/** Troca o tipo mantendo o texto e o agrupamento da pergunta. */
export function changeQuestionType(q: SurveyQuestion, type: QuestionType): SurveyQuestion {
  if (q.type === type) return q
  return { ...createQuestion(type), id: q.id, text: q.text, ...(q.section ? { section: q.section } : {}), ...(q.theme ? { theme: q.theme } : {}) }
}

/** Escala com 5 rótulos próprios? */
export function hasScaleLabels(q: SurveyQuestion): q is SurveyQuestion & { labels: string[] } {
  return q.type === 'escala' && Array.isArray(q.labels) && q.labels.length === ESCALA_OPTIONS.length
}

/** Opções que a pessoa vê (inclui "Prefiro não responder" e "Outros" quando configurados). */
export function getAnswerOptions(q: SurveyQuestion): SurveyOption[] {
  switch (q.type) {
    case 'escala': {
      const opts = hasScaleLabels(q) ? q.labels.map((label, i) => ({ key: String(i + 1), label })) : [...ESCALA_OPTIONS]
      return q.allowNR ? [...opts, NR_OPTION] : opts
    }
    case 'nota':
      return [...NOTA_OPTIONS]
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

/** Resposta de sim ou não que libera as perguntas seguintes (a oposta à que encerra). */
function continueKey(q: SurveyQuestion): string | null {
  if (q.type !== 'sim_nao' || !q.endIf) return null
  return q.endIf === 'nao' ? 'sim' : 'nao'
}

/**
 * Perguntas que a pessoa vê com as respostas atuais (ramificação): depois de uma pergunta de sim ou não
 * com regra, as seguintes só aparecem quando ela escolhe a resposta que continua. Sem resposta ou com a
 * resposta que encerra, a lista para ali.
 */
export function getVisibleQuestions<T extends SurveyQuestion>(questions: readonly T[], answers: SurveyAnswers): T[] {
  const out: T[] = []
  for (const q of questions) {
    out.push(q)
    const next = continueKey(q)
    if (next && answers[q.id] !== next) break
  }
  return out
}

/** Pergunta anterior que pode encerrar a pesquisa antes desta (a mais próxima), com seu número. */
export function getGatingQuestion(questions: readonly SurveyQuestion[], index: number): { question: SurveyQuestion; n: number } | null {
  for (let i = index - 1; i >= 0; i--) {
    const q = questions[i]
    if (q.type === 'sim_nao' && q.endIf) return { question: q, n: i + 1 }
  }
  return null
}

/** Rótulo da resposta que encerra ("Não") e da que segue ("Sim"). */
export function endIfLabels(q: SurveyQuestion): { ends: string; continues: string } | null {
  if (q.type !== 'sim_nao' || !q.endIf) return null
  const ends = SIM_NAO_OPTIONS.find((o) => o.key === q.endIf)
  const continues = SIM_NAO_OPTIONS.find((o) => o.key !== q.endIf)
  return ends && continues ? { ends: ends.label, continues: continues.label } : null
}

/** "Só aparece para quem respondeu “Sim” na pergunta 10." (ou null se nada antes encerra a pesquisa). */
export function describeGate(questions: readonly SurveyQuestion[], index: number, verb: 'aparece' | 'apareceu' = 'aparece'): string | null {
  const gate = getGatingQuestion(questions, index)
  const labels = gate && endIfLabels(gate.question)
  return gate && labels ? `Só ${verb} para quem respondeu “${labels.continues}” na pergunta ${gate.n}.` : null
}

/** Quantas respostas chegaram até a pergunta (as que não encerraram antes). */
export function countReached(questions: readonly SurveyQuestion[], responses: readonly SurveyAnswers[], questionId: string): number {
  return responses.filter((r) => getVisibleQuestions(questions, r).some((q) => q.id === questionId)).length
}

/** Perguntas agrupadas em dimensões: cada parte fica dentro de uma dimensão, com até 7 perguntas. */
export const QUESTIONS_PER_SECTION_PAGE = 7

export function paginateQuestions(questions: readonly SurveyQuestion[], perPage = QUESTIONS_PER_PAGE): SurveyQuestion[][] {
  const pages: SurveyQuestion[][] = []
  if (!questions.some((q) => q.section)) {
    for (let i = 0; i < questions.length; i += perPage) pages.push(questions.slice(i, i + perPage))
    return pages
  }
  // Blocos consecutivos da mesma dimensão, divididos em partes de tamanho parecido.
  let start = 0
  while (start < questions.length) {
    let end = start + 1
    while (end < questions.length && (questions[end].section ?? '') === (questions[start].section ?? '')) end++
    const block = questions.slice(start, end)
    const parts = Math.ceil(block.length / QUESTIONS_PER_SECTION_PAGE)
    const size = Math.ceil(block.length / parts)
    for (let i = 0; i < block.length; i += size) pages.push(block.slice(i, i + size))
    start = end
  }
  return pages
}

/** Tempo estimado em minutos: escolhas são rápidas; textos abertos levam mais. */
export function estimateMinutes(questions: readonly SurveyQuestion[]): number {
  const seconds = questions.reduce((s, q) => s + (q.type === 'aberta' ? 60 : q.type === 'multipla' ? 20 : 10), 0)
  return Math.max(2, Math.ceil(seconds / 60))
}

export function isPageComplete(page: readonly SurveyQuestion[], answers: SurveyAnswers): boolean {
  return page.every((q) => isQuestionAnswered(q, answers[q.id]))
}

/**
 * Mantém só respostas válidas e textos aparados/limitados (o que vai para o banco).
 * Respostas de perguntas que não aparecem (depois de uma resposta que encerra) são descartadas.
 */
export function sanitizeAnswers(questions: readonly SurveyQuestion[], answers: SurveyAnswers): SurveyAnswers {
  const out: SurveyAnswers = {}
  for (const q of getVisibleQuestions(questions, answers)) {
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
    if (q.type === 'escala' && q.labels && (q.labels.length !== ESCALA_OPTIONS.length || q.labels.some((l) => !l.trim()))) {
      problems.push(`Pergunta ${n}: preencha os 5 rótulos da escala.`)
    }
  })
  return problems
}

/** Remove "Outros" de opções da múltipla e normaliza campos, para salvar no banco. */
export function normalizeQuestions(questions: readonly SurveyQuestion[]): SurveyQuestion[] {
  return questions.map((q) => {
    const section = q.section?.trim().slice(0, 60)
    const theme = q.theme?.trim().slice(0, 60)
    const base: SurveyQuestion = {
      id: q.id,
      type: q.type,
      text: q.text.slice(0, QUESTION_MAX_LENGTH),
      required: q.required,
      ...(section ? { section } : {}),
      ...(theme ? { theme } : {}),
    }
    if (q.type === 'escala') {
      const labels = hasScaleLabels(q) ? q.labels.map((l) => l.slice(0, 40)) : null
      return { ...base, allowNR: Boolean(q.allowNR), ...(labels ? { labels } : {}) }
    }
    if (q.type === 'frequencia') return { ...base, allowNR: Boolean(q.allowNR), ...(q.canalHint ? { canalHint: true } : {}) }
    if (q.type === 'multipla') {
      return {
        ...base,
        options: (q.options ?? []).filter((o) => o.key !== OTHER_KEY).map((o) => ({ key: o.key, label: o.label.slice(0, 120) })),
        maxSelections: maxSelectionsOf(q),
        allowOther: Boolean(q.allowOther),
      }
    }
    if (q.type === 'sim_nao' && (q.endIf === 'sim' || q.endIf === 'nao')) return { ...base, endIf: q.endIf }
    return base
  })
}

/** Resultado de uma aplicação anterior, guardado só em percentuais (sem respostas individuais). */
export interface SurveyBaseline {
  /** Ex.: "Pesquisa anterior". */
  label: string
  /** Quantas pessoas responderam na aplicação anterior. */
  total: number
  /** Por id de pergunta: % de cada opção (0–100, na ordem das opções, sem "Prefiro não responder") ou a média da nota. */
  items: Record<string, { shares?: number[]; mean?: number }>
}

export function parseBaseline(raw: unknown): SurveyBaseline | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<SurveyBaseline>
  if (typeof r.label !== 'string' || typeof r.total !== 'number' || !r.items || typeof r.items !== 'object') return null
  return { label: r.label, total: r.total, items: r.items }
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
export function summarizeResponses(questions: readonly SurveyQuestion[], allResponses: readonly SurveyAnswers[]): QuestionSummary[] {
  // Cada pergunta só conta quem chegou até ela (respostas depois de um "encerrar" são ignoradas).
  const reachedIds = allResponses.map((r) => new Set(getVisibleQuestions(questions, r).map((q) => q.id)))
  return questions.map((q): QuestionSummary => {
    const responses = allResponses.filter((_, i) => reachedIds[i].has(q.id))
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
    { id: 'q9', type: 'aberta', required: true, text: 'O que você entende por diversidade e inclusão no ambiente de trabalho?' },
    // "Não" encerra a pesquisa: as perguntas sobre o comitê (11 e 12) só aparecem para quem respondeu "Sim".
    { id: 'q10', type: 'sim_nao', required: true, endIf: 'nao', text: 'Você entende que o escritório deveria ter um comitê de diversidade e inclusão?' },
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
      required: true,
      text: 'Qual ação concreta você gostaria de ver o escritório adotar nos próximos 12 meses em relação à diversidade e à inclusão?',
    },
  ] satisfies SurveyQuestion[],
}
