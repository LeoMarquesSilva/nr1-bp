import { describe, expect, it } from 'vitest'
import { TEMPLATE_DIVERSIDADE, normalizeQuestions, type SurveyAnswers } from './pesquisas'
import { buildAnswerRows, buildMeetingSummary, computeStats, noiseFor, resultsGate, type ChoiceStat, type MultiStat, type OpenStat } from './resultados'

const di = normalizeQuestions(TEMPLATE_DIVERSIDADE.questions)
const base = { q1: '5', q2: '4', q3: 'nunca', q4: '4', q5: '2', q6: '1', q7: '2', q8: '3', q9: 'Respeito' }
const sim = (extra: Partial<SurveyAnswers> = {}): SurveyAnswers => ({ ...base, q10: 'sim', q11: { selected: ['genero', 'raca'] }, q12: 'Mentoria', ...extra })
const nao = (extra: Partial<SurveyAnswers> = {}): SurveyAnswers => ({ ...base, q10: 'nao', ...extra })
const stat = <T,>(stats: unknown[], id: string) => (stats as { question: { id: string } }[]).find((s) => s.question.id === id) as T

describe('quando mostrar os resultados', () => {
  it('pede o mínimo e, com a pesquisa aberta, só libera lotes completos', () => {
    expect(resultsGate('aberta', 4, 5)).toEqual({ state: 'poucas', total: 4, min: 5 })
    expect(resultsGate('aberta', 10, 5)).toEqual({ state: 'liberado', partial: true })
    expect(resultsGate('aberta', 12, 5)).toEqual({ state: 'lote', total: 12, batch: 5, missing: 3 })
    expect(resultsGate('encerrada', 12, 5)).toEqual({ state: 'liberado', partial: false })
  })

  it('explica o ruído pelo tamanho da amostra', () => {
    expect(Math.round(noiseFor(20).perPerson)).toBe(5)
    expect(Math.round(noiseFor(20).margin)).toBe(22)
  })
})

describe('anonimato por pergunta e por ramificação', () => {
  it('esconde 11 e 12 quando menos de 5 pessoas responderam "Sim" na 10', () => {
    const respostas = [sim(), sim(), sim(), ...Array.from({ length: 9 }, () => nao())]
    const stats = computeStats(di, respostas, 5)
    expect(stat<MultiStat>(stats, 'q11').hidden).toBe(true)
    expect(stat<OpenStat>(stats, 'q12').hidden).toBe(true)
    expect(stat<ChoiceStat>(stats, 'q10').hidden).toBe(false)
  })

  it('textos abertos só com 10 respostas na pesquisa e 5 na pergunta', () => {
    const poucas = computeStats(di, Array.from({ length: 8 }, () => sim()), 5)
    expect(stat<OpenStat>(poucas, 'q9')).toMatchObject({ hidden: true, hiddenReason: 'pesquisa', texts: [] })
    const muitas = computeStats(di, Array.from({ length: 12 }, () => sim()), 5)
    expect(stat<OpenStat>(muitas, 'q9').texts).toHaveLength(12)
  })

  it('conta quem escreveu em "Outros" sem expor o texto e deixa "Outros" por último', () => {
    const respostas = Array.from({ length: 6 }, (_, i) => sim({ q11: i === 0 ? { selected: ['outros'], outro: 'texto pessoal' } : { selected: ['raca'] } }))
    const q11 = stat<MultiStat>(computeStats(di, respostas, 5), 'q11')
    expect(q11.otherCount).toBe(1)
    expect(q11.options[0].key).toBe('raca')
    expect(q11.options.at(-1)?.key).toBe('outros')
    expect(JSON.stringify(q11)).not.toContain('texto pessoal')
  })

  it('esconde item de escala com menos de 5 respostas válidas (sem "Prefiro não responder")', () => {
    const respostas = Array.from({ length: 6 }, (_, i) => sim({ q1: i < 2 ? 'nr' : '5' }))
    expect(stat<ChoiceStat>(computeStats(di, respostas, 5), 'q1')).toMatchObject({ hidden: true, valid: 4, nr: 2 })
  })
})

describe('base para tabelas dinâmicas', () => {
  it('uma linha por resposta fechada, sem abertas, sem texto de "Outros" e sem perguntas ocultas', () => {
    const respostas = [
      ...Array.from({ length: 5 }, () => sim({ q11: { selected: ['genero', 'outros'], outro: 'texto pessoal' } })),
      ...Array.from({ length: 5 }, () => nao()),
    ]
    const stats = computeStats(di, respostas, 5)
    const rows = buildAnswerRows(di, respostas, stats)
    // 9 fechadas por pessoa (q1–q8 e q10) + 2 temas para as 5 que disseram "Sim"
    expect(rows).toHaveLength(10 * 9 + 5 * 2)
    expect(rows.some((r) => r.pergunta.startsWith('09.') || r.pergunta.startsWith('12.'))).toBe(false)
    expect(JSON.stringify(rows)).not.toContain('texto pessoal')
    expect(rows.find((r) => r.pergunta.startsWith('01.'))).toMatchObject({ tipo: 'Escala de 1 a 5', valor: 5, grupo: 'Concorda (4–5)', resposta: '5 · Concordo totalmente' })
    expect(rows.find((r) => r.pergunta.startsWith('03.'))?.grupo).toBe('Não aconteceu')
  })

  it('deixa de fora a pergunta oculta pela ramificação', () => {
    const respostas = [sim(), sim(), ...Array.from({ length: 8 }, () => nao())]
    const rows = buildAnswerRows(di, respostas, computeStats(di, respostas, 5))
    expect(rows.some((r) => r.pergunta.startsWith('11.'))).toBe(false)
  })
})

describe('números e visão-resumo', () => {
  const respostas = [
    ...Array.from({ length: 6 }, () => sim()),
    ...Array.from({ length: 4 }, () => nao({ q3: 'raramente', q5: '1' })),
  ]
  const stats = computeStats(di, respostas, 5)

  it('calcula % favorável na escala e incidência na frequência negativa', () => {
    expect(stat<ChoiceStat>(stats, 'q1')).toMatchObject({ favorable: 1, unfavorable: 0, valid: 10 })
    expect(stat<ChoiceStat>(stats, 'q3').incidence).toBeCloseTo(0.4)
    expect(stat<ChoiceStat>(stats, 'q10').incidence).toBeNull()
  })

  it('ordena fortes e pontos de atenção e levanta alertas', () => {
    const resumo = buildMeetingSummary(stats, respostas.length)
    expect(resumo.strengths.map((s) => s.question.id)).toEqual(['q1', 'q2', 'q4'])
    expect(resumo.attention[0].question.id).toMatch(/q5|q6|q7/)
    expect(resumo.keyYesNo?.question.id).toBe('q10')
    expect(resumo.keyIncidence?.question.id).toBe('q3')
    expect(resumo.alerts.some((a) => a.stat.question.id === 'q3')).toBe(true)
    expect(resumo.alerts.some((a) => a.stat.question.id === 'q6' && a.text.startsWith('Mais gente discorda'))).toBe(true)
  })
})
