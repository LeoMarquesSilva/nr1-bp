/**
 * Leitura dos resultados pelo comitê: regras de anonimato (por pergunta, por ramificação e no tempo),
 * os números de cada pergunta (% favorável, incidência, base) e a visão-resumo da reunião.
 * Fundamentos e fontes: reports/Diversidade resultados e plano de ação.md.
 */
import {
  NR_OPTION,
  OTHER_KEY,
  describeGate,
  getAnswerOptions,
  getVisibleQuestions,
  isMultiAnswer,
  type SurveyAnswers,
  type SurveyBaseline,
  type SurveyQuestion,
} from './pesquisas'

/** Referência de mercado para % favorável; abaixo de 50%, crítico. */
export const FAVORABLE_TARGET = 0.7
export const FAVORABLE_CRITICAL = 0.5

export type Criticity = 'critico' | 'atencao' | 'bom'

export function criticityOf(favorable: number): Criticity {
  return favorable < FAVORABLE_CRITICAL ? 'critico' : favorable < FAVORABLE_TARGET ? 'atencao' : 'bom'
}

/** Variação entre dois ciclos: "estável" quando cabe na margem da diferença (~1,4× a margem de cada um). */
export type Trend = 'subiu' | 'caiu' | 'estavel'

export function trendOf(now: number, before: number, nNow: number, nBefore: number): Trend {
  const margin = (1.4 * 0.98) / Math.sqrt(Math.max(1, Math.min(nNow, nBefore)))
  const diff = now - before
  return Math.abs(diff) < margin ? 'estavel' : diff > 0 ? 'subiu' : 'caiu'
}

/** Textos abertos só aparecem com pelo menos 10 respostas na pesquisa (padrão do Viva Glint para comentários). */
export const OPEN_TEXT_MIN_SURVEY = 10

// ---------- Quando mostrar ----------

export type ResultsGate = { state: 'poucas'; total: number; min: number } | { state: 'liberado'; partial: boolean }

/** A partir do mínimo de respostas, os resultados aparecem; com a pesquisa aberta, são parciais. */
export function resultsGate(status: string, total: number, min: number): ResultsGate {
  if (total < min) return { state: 'poucas', total, min }
  return { state: 'liberado', partial: status === 'aberta' }
}

/** Quanto vale uma pessoa e a margem aproximada (95%, p = 50%) de um percentual, em pontos percentuais. */
export function noiseFor(n: number): { perPerson: number; margin: number } {
  return { perPerson: n > 0 ? 100 / n : 0, margin: n > 0 ? 98 / Math.sqrt(n) : 0 }
}

// ---------- Números por pergunta ----------

/** Escala: concordar é bom. Frequência que sugere o canal: ocorrer é ruim. Demais: sem juízo. */
export type Polarity = 'positiva' | 'negativa' | 'neutra'

export function polarityOf(q: SurveyQuestion): Polarity {
  if (q.type === 'escala') return 'positiva'
  if (q.type === 'frequencia' && q.canalHint) return 'negativa'
  return 'neutra'
}

type Base = {
  question: SurveyQuestion
  /** Número da pergunta na pesquisa. */
  n: number
  /** Texto "Só apareceu para quem respondeu “Sim” na pergunta 10." quando há ramificação antes. */
  gate: string | null
  /** Pessoas que chegaram à pergunta. */
  reached: number
  /** Abaixo do mínimo: nada da pergunta aparece, nem a contagem. */
  hidden: boolean
  section: string | null
  theme: string | null
}

/** Mesma pergunta na aplicação anterior (só percentuais). */
export type BaselineStat = { label: string; total: number; favorable: number | null; mean: number | null; trend: Trend | null }

export type ChoiceStat = Base & {
  kind: 'escolha'
  /** Respostas válidas, sem "Prefiro não responder": base dos percentuais. */
  valid: number
  nr: number
  counts: Record<string, number>
  /** Escala: 4–5. Frequência negativa: "Nunca". */
  favorable: number | null
  neutral: number | null
  /** Escala: 1–2. */
  unfavorable: number | null
  /** Frequência negativa: aconteceu ao menos raramente. */
  incidence: number | null
  /** Escala (1–5) e nota (0–10). */
  mean: number | null
  /** Mesma pergunta na aplicação anterior, quando houver. */
  baseline: BaselineStat | null
}

export type MultiStat = Base & {
  kind: 'multipla'
  respondents: number
  /** Ordenadas da mais escolhida para a menos; "Outros" sempre por último. */
  options: { key: string; label: string; count: number; share: number }[]
  /** Quem escreveu em "Outros" (os textos não são exibidos). */
  otherCount: number
}

export type OpenStat = Base & {
  kind: 'aberta'
  texts: string[]
  hiddenReason: 'pesquisa' | 'pergunta' | null
}

export type QuestionStat = ChoiceStat | MultiStat | OpenStat

/** % favorável (4–5) a partir dos percentuais guardados de uma escala. */
function favorableFromShares(shares: number[] | undefined): number | null {
  if (!shares || shares.length < 5) return null
  const total = shares.reduce((s, x) => s + x, 0)
  return total > 0 ? (shares[3] + shares[4]) / total : null
}

export function computeStats(questions: readonly SurveyQuestion[], responses: readonly SurveyAnswers[], min: number, baseline: SurveyBaseline | null = null): QuestionStat[] {
  const total = responses.length
  const visibleIds = responses.map((r) => new Set(getVisibleQuestions(questions, r).map((q) => q.id)))

  return questions.map((q, i): QuestionStat => {
    const reachedList = responses.filter((_, j) => visibleIds[j].has(q.id))
    const base = {
      question: q,
      n: i + 1,
      gate: describeGate(questions, i, 'apareceu'),
      reached: reachedList.length,
      section: q.section ?? null,
      theme: q.theme ?? null,
    }

    if (q.type === 'aberta') {
      const texts = reachedList.map((r) => r[q.id]).filter((v): v is string => typeof v === 'string' && v.trim().length > 0).map((v) => v.trim())
      const hiddenReason = total < OPEN_TEXT_MIN_SURVEY ? 'pesquisa' : texts.length < min ? 'pergunta' : null
      return { ...base, kind: 'aberta', texts: hiddenReason ? [] : texts, hidden: hiddenReason !== null, hiddenReason }
    }

    if (q.type === 'multipla') {
      const counts: Record<string, number> = {}
      let respondents = 0
      let otherCount = 0
      for (const r of reachedList) {
        const v = r[q.id]
        if (!isMultiAnswer(v) || v.selected.length === 0) continue
        respondents++
        for (const k of v.selected) counts[k] = (counts[k] ?? 0) + 1
        if (v.selected.includes(OTHER_KEY)) otherCount++
      }
      const options = getAnswerOptions(q)
        .map((o) => ({ key: o.key, label: o.label, count: counts[o.key] ?? 0, share: respondents ? (counts[o.key] ?? 0) / respondents : 0 }))
        .sort((a, b) => (a.key === OTHER_KEY ? 1 : b.key === OTHER_KEY ? -1 : b.count - a.count))
      return { ...base, kind: 'multipla', respondents, options, otherCount, hidden: respondents < min }
    }

    const counts: Record<string, number> = Object.fromEntries(getAnswerOptions(q).map((o) => [o.key, 0]))
    for (const r of reachedList) {
      const v = r[q.id]
      if (typeof v === 'string' && v in counts) counts[v]++
    }
    const nr = counts[NR_OPTION.key] ?? 0
    const valid = Object.entries(counts).reduce((s, [k, c]) => (k === NR_OPTION.key ? s : s + c), 0)
    const share = (...keys: string[]) => (valid ? keys.reduce((s, k) => s + (counts[k] ?? 0), 0) / valid : 0)
    const pol = polarityOf(q)

    let favorable: number | null = null
    let neutral: number | null = null
    let unfavorable: number | null = null
    let incidence: number | null = null
    let mean: number | null = null
    const weighted = () => (valid ? Object.entries(counts).reduce((s, [k, c]) => (k === NR_OPTION.key ? s : s + Number(k) * c), 0) / valid : null)
    if (q.type === 'escala') {
      favorable = share('4', '5')
      neutral = share('3')
      unfavorable = share('1', '2')
      mean = weighted()
    } else if (q.type === 'nota') {
      mean = weighted()
    } else if (pol === 'negativa') {
      favorable = share('nunca')
      incidence = valid ? 1 - favorable : 0
    }

    let before: BaselineStat | null = null
    const item = baseline?.items[q.id]
    if (baseline && item) {
      const bFav = q.type === 'escala' ? favorableFromShares(item.shares) : null
      const bMean = typeof item.mean === 'number' ? item.mean : null
      const trend = bFav != null && favorable != null ? trendOf(favorable, bFav, valid, baseline.total) : null
      before = { label: baseline.label, total: baseline.total, favorable: bFav, mean: bMean, trend }
    }
    return { ...base, kind: 'escolha', valid, nr, counts, favorable, neutral, unfavorable, incidence, mean, baseline: before, hidden: valid < min }
  })
}

// ---------- Dimensões e temas ----------

export type GroupSummary = {
  name: string
  /** Média simples do % favorável das escalas do grupo (cada pergunta pesa igual). */
  favorable: number
  items: ChoiceStat[]
  criticity: Criticity
  /** Média do % favorável anterior das mesmas perguntas (quando todas têm base). */
  before: number | null
  trend: Trend | null
}

export type SectionSummary = GroupSummary & { themes: GroupSummary[] }

function groupOf(name: string, items: ChoiceStat[], total: number, baseTotal: number | null): GroupSummary {
  const favorable = items.reduce((s, x) => s + (x.favorable ?? 0), 0) / items.length
  const withBase = items.filter((x) => x.baseline?.favorable != null)
  const before = baseTotal != null && withBase.length === items.length ? withBase.reduce((s, x) => s + (x.baseline!.favorable ?? 0), 0) / items.length : null
  return { name, favorable, items, criticity: criticityOf(favorable), before, trend: before != null ? trendOf(favorable, before, total, baseTotal ?? total) : null }
}

/** Escalas visíveis agrupadas por dimensão e tema, na ordem da pesquisa. Vazio se a pesquisa não tem dimensões. */
export function summarizeSections(stats: readonly QuestionStat[], total: number): SectionSummary[] {
  const scales = stats.filter((s): s is ChoiceStat => s.kind === 'escolha' && s.question.type === 'escala' && !s.hidden && s.section != null)
  const baseTotal = scales.find((s) => s.baseline)?.baseline?.total ?? null
  const names = [...new Set(scales.map((s) => s.section!))]
  return names.map((name) => {
    const items = scales.filter((s) => s.section === name)
    const themeNames = [...new Set(items.map((s) => s.theme).filter((t): t is string => Boolean(t)))]
    const themes = themeNames.map((t) => groupOf(t, items.filter((s) => s.theme === t), total, baseTotal))
    return { ...groupOf(name, items, total, baseTotal), themes }
  })
}

// ---------- Base para tabelas dinâmicas (exportação) ----------

/** Uma linha por resposta dada a uma pergunta. Sem identificação de quem respondeu. */
export type AnswerRow = {
  n: number
  pergunta: string
  dimensao: string
  tema: string
  tipo: string
  resposta: string
  grupo: string
  valor: number | null
}

const TIPO_LABEL: Record<string, string> = { escala: 'Escala de 1 a 5', frequencia: 'Frequência', sim_nao: 'Sim ou não', multipla: 'Múltipla escolha', nota: 'Nota de 0 a 10' }

/** Grupos usados nas dinâmicas e nos resumos (escala em três faixas, nota em três faixas). */
export const GRUPOS_ESCALA = ['Desfavorável (1–2)', 'Neutro (3)', 'Favorável (4–5)'] as const
export const GRUPOS_NOTA = ['Notas 0–6', 'Notas 7–8', 'Notas 9–10'] as const

function grupoOf(q: SurveyQuestion, key: string, label: string): string {
  if (key === NR_OPTION.key) return NR_OPTION.label
  if (q.type === 'escala') return Number(key) <= 2 ? GRUPOS_ESCALA[0] : Number(key) === 3 ? GRUPOS_ESCALA[1] : GRUPOS_ESCALA[2]
  if (q.type === 'nota') return Number(key) <= 6 ? GRUPOS_NOTA[0] : Number(key) <= 8 ? GRUPOS_NOTA[1] : GRUPOS_NOTA[2]
  if (q.type === 'frequencia' && polarityOf(q) === 'negativa') return key === 'nunca' ? 'Não aconteceu' : 'Aconteceu'
  if (q.type === 'multipla') return 'Tema escolhido'
  return label
}

/** "01. Sinto que posso ser eu mesmo(a)…" (número com dois dígitos para ordenar; limite de texto do Excel). */
export const perguntaLabel = (n: number, text: string) => `${String(n).padStart(2, '0')}. ${text}`.slice(0, 250)

/** Rótulo da resposta na base: nas escalas, os extremos levam a descrição ("5 · Concordo totalmente"). */
export const respostaLabel = (q: SurveyQuestion, o: { label: string; hint?: string }) => (q.type === 'escala' && o.hint ? `${o.label} · ${o.hint}` : o.label)

/** Ordem natural das respostas (pergunta a pergunta, opção a opção), para listas e tabelas dinâmicas. */
export function respostaOrder(questions: readonly SurveyQuestion[]): string[] {
  const out: string[] = []
  for (const q of questions) if (q.type !== 'aberta') for (const o of getAnswerOptions(q)) if (o.key !== NR_OPTION.key) out.push(respostaLabel(q, o))
  // "Prefiro não responder" sempre por último, em qualquer pergunta.
  return [...new Set(out), NR_OPTION.label]
}

/**
 * Linhas para a aba "Base" da planilha, com as mesmas regras do painel: só perguntas fechadas visíveis,
 * respeitando a ramificação; sem textos abertos nem o texto de "Outros"; sem nenhum identificador da
 * resposta; em ordem embaralhada, para que linhas da mesma pessoa não fiquem juntas.
 */
export function buildAnswerRows(questions: readonly SurveyQuestion[], responses: readonly SurveyAnswers[], stats: readonly QuestionStat[], random = Math.random): AnswerRow[] {
  const visible = new Set(stats.filter((s) => !s.hidden && s.kind !== 'aberta').map((s) => s.question.id))
  const rows: AnswerRow[] = []
  responses.forEach((r) => {
    const reached = getVisibleQuestions(questions, r)
    for (const q of reached) {
      if (!visible.has(q.id)) continue
      const n = questions.indexOf(q) + 1
      const opts = getAnswerOptions(q)
      const base = { n, pergunta: perguntaLabel(n, q.text), dimensao: q.section ?? '', tema: q.theme ?? '', tipo: TIPO_LABEL[q.type] ?? q.type }
      const v = r[q.id]
      if (q.type === 'multipla') {
        if (!isMultiAnswer(v)) continue
        for (const key of v.selected) {
          const o = opts.find((x) => x.key === key)
          if (o) rows.push({ ...base, resposta: o.label, grupo: grupoOf(q, key, o.label), valor: null })
        }
        continue
      }
      const o = typeof v === 'string' ? opts.find((x) => x.key === v) : undefined
      if (!o) continue
      const numeric = (q.type === 'escala' || q.type === 'nota') && o.key !== NR_OPTION.key
      rows.push({ ...base, resposta: respostaLabel(q, o), grupo: grupoOf(q, o.key, o.label), valor: numeric ? Number(o.key) : null })
    }
  })
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[rows[i], rows[j]] = [rows[j], rows[i]]
  }
  return rows
}

// ---------- Visão-resumo da reunião ----------

export type Alert = { stat: ChoiceStat; text: string }

export type MeetingSummary = {
  total: number
  /** Escalas visíveis, da mais favorável para a menos. */
  ranking: ChoiceStat[]
  strengths: ChoiceStat[]
  attention: ChoiceStat[]
  /** A diferença entre o melhor e o pior item cabe na margem de ruído. */
  withinNoise: boolean
  alerts: Alert[]
  /** Primeira pergunta de sim ou não visível (ex.: apoio ao comitê). */
  keyYesNo: ChoiceStat | null
  /** Primeira frequência negativa visível (ex.: presenciou discriminação). */
  keyIncidence: ChoiceStat | null
  /** Primeira nota de 0 a 10 visível (ex.: felicidade). */
  keyNota: ChoiceStat | null
  /** Média do % favorável de todas as escalas visíveis (com 3 ou mais). */
  overallFavorable: number | null
  /** Dimensões e temas (vazio se a pesquisa não agrupa). */
  sections: SectionSummary[]
  /** Temas abaixo da referência de 70%, do pior para o melhor. */
  focusThemes: (GroupSummary & { section: string })[]
  priorities: MultiStat[]
  voices: OpenStat[]
}

const pctText = (x: number) => `${Math.round(x * 100)}%`

export function buildMeetingSummary(stats: readonly QuestionStat[], total: number): MeetingSummary {
  const choice = stats.filter((s): s is ChoiceStat => s.kind === 'escolha' && !s.hidden)
  // Mais favorável primeiro; no empate, quem tem mais discordância fica abaixo.
  const ranking = choice
    .filter((s) => s.question.type === 'escala')
    .sort((a, b) => (b.favorable ?? 0) - (a.favorable ?? 0) || (a.unfavorable ?? 0) - (b.unfavorable ?? 0))
  const k = Math.min(3, Math.floor(ranking.length / 2))
  const strengths = ranking.slice(0, k)
  const attention = ranking.slice(ranking.length - k).reverse()
  const range = ranking.length > 1 ? ((ranking[0].favorable ?? 0) - (ranking[ranking.length - 1].favorable ?? 0)) * 100 : 0
  const withinNoise = ranking.length > 1 && range < noiseFor(total).margin

  const alerts: Alert[] = []
  for (const s of choice) {
    if (s.incidence != null && s.incidence > 0) {
      alerts.push({ stat: s, text: `${pctText(s.incidence)} disseram que aconteceu ao menos raramente (${s.counts.frequentemente ?? 0} marcaram “frequentemente”).` })
    }
    if (s.question.type === 'escala' && (s.unfavorable ?? 0) > (s.favorable ?? 0)) {
      alerts.push({ stat: s, text: `Mais gente discorda (${pctText(s.unfavorable ?? 0)}) do que concorda (${pctText(s.favorable ?? 0)}).` })
    }
    const answered = s.valid + s.nr
    if (answered > 0 && s.nr / answered >= 0.2) {
      alerts.push({ stat: s, text: `${pctText(s.nr / answered)} preferiram não responder, o que pode indicar desconforto com o tema.` })
    }
  }

  const sections = summarizeSections(stats, total)
  const focusThemes = sections
    .flatMap((sec) => sec.themes.map((t) => ({ ...t, section: sec.name })))
    .filter((t) => t.favorable < FAVORABLE_TARGET)
    .sort((a, b) => a.favorable - b.favorable)

  return {
    total,
    ranking,
    strengths,
    attention,
    withinNoise,
    alerts,
    keyYesNo: choice.find((s) => s.question.type === 'sim_nao') ?? null,
    keyIncidence: choice.find((s) => s.incidence != null) ?? null,
    keyNota: choice.find((s) => s.question.type === 'nota') ?? null,
    overallFavorable: ranking.length >= 3 ? ranking.reduce((s, x) => s + (x.favorable ?? 0), 0) / ranking.length : null,
    sections,
    focusThemes,
    priorities: stats.filter((s): s is MultiStat => s.kind === 'multipla' && !s.hidden),
    voices: stats.filter((s): s is OpenStat => s.kind === 'aberta' && !s.hidden),
  }
}
