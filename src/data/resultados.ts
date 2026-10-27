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
  type SurveyQuestion,
} from './pesquisas'

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
}

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
  mean: number | null
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

export function computeStats(questions: readonly SurveyQuestion[], responses: readonly SurveyAnswers[], min: number): QuestionStat[] {
  const total = responses.length
  const visibleIds = responses.map((r) => new Set(getVisibleQuestions(questions, r).map((q) => q.id)))

  return questions.map((q, i): QuestionStat => {
    const reachedList = responses.filter((_, j) => visibleIds[j].has(q.id))
    const base = { question: q, n: i + 1, gate: describeGate(questions, i, 'apareceu'), reached: reachedList.length }

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
    if (q.type === 'escala') {
      favorable = share('4', '5')
      neutral = share('3')
      unfavorable = share('1', '2')
      mean = valid ? ['1', '2', '3', '4', '5'].reduce((s, k) => s + Number(k) * (counts[k] ?? 0), 0) / valid : null
    } else if (pol === 'negativa') {
      favorable = share('nunca')
      incidence = valid ? 1 - favorable : 0
    }
    return { ...base, kind: 'escolha', valid, nr, counts, favorable, neutral, unfavorable, incidence, mean, hidden: valid < min }
  })
}

// ---------- Base para tabelas dinâmicas (exportação) ----------

/** Uma linha por resposta dada a uma pergunta. Sem identificação de quem respondeu. */
export type AnswerRow = { n: number; pergunta: string; tipo: string; resposta: string; grupo: string; valor: number | null }

const TIPO_LABEL: Record<string, string> = { escala: 'Escala de 1 a 5', frequencia: 'Frequência', sim_nao: 'Sim ou não', multipla: 'Múltipla escolha' }

function grupoOf(q: SurveyQuestion, key: string, label: string): string {
  if (key === NR_OPTION.key) return NR_OPTION.label
  if (q.type === 'escala') return Number(key) <= 2 ? 'Discorda (1–2)' : Number(key) === 3 ? 'Neutro (3)' : 'Concorda (4–5)'
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
      const base = { n, pergunta: perguntaLabel(n, q.text), tipo: TIPO_LABEL[q.type] ?? q.type }
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
      rows.push({ ...base, resposta: respostaLabel(q, o), grupo: grupoOf(q, o.key, o.label), valor: q.type === 'escala' && o.key !== NR_OPTION.key ? Number(o.key) : null })
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

  return {
    total,
    ranking,
    strengths,
    attention,
    withinNoise,
    alerts,
    keyYesNo: choice.find((s) => s.question.type === 'sim_nao') ?? null,
    keyIncidence: choice.find((s) => s.incidence != null) ?? null,
    priorities: stats.filter((s): s is MultiStat => s.kind === 'multipla' && !s.hidden),
    voices: stats.filter((s): s is OpenStat => s.kind === 'aberta' && !s.hidden),
  }
}
