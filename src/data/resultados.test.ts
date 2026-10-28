import { describe, expect, it } from 'vitest'
import { TEMPLATE_DIVERSIDADE, estimateMinutes, normalizeQuestions, paginateQuestions, validateQuestions, type SurveyAnswers } from './pesquisas'
import { TEMPLATE_CULTURA } from './modeloCultura'
import {
  answerRowsFromStats,
  buildAnswerRows,
  buildMeetingSummary,
  computeStats,
  countsFromShares,
  statsFromBaseline,
  noiseFor,
  resultsGate,
  summarizeSections,
  trendOf,
  type ChoiceStat,
  type MultiStat,
  type OpenStat,
} from './resultados'

const di = normalizeQuestions(TEMPLATE_DIVERSIDADE.questions)
const base = { q1: '5', q2: '4', q3: 'nunca', q4: '4', q5: '2', q6: '1', q7: '2', q8: '3', q9: 'Respeito' }
const sim = (extra: Partial<SurveyAnswers> = {}): SurveyAnswers => ({ ...base, q10: 'sim', q11: { selected: ['genero', 'raca'] }, q12: 'Mentoria', ...extra })
const nao = (extra: Partial<SurveyAnswers> = {}): SurveyAnswers => ({ ...base, q10: 'nao', ...extra })
const stat = <T,>(stats: unknown[], id: string) => (stats as { question: { id: string } }[]).find((s) => s.question.id === id) as T

describe('quando mostrar os resultados', () => {
  it('pede o mínimo e marca como parcial enquanto a pesquisa está aberta', () => {
    expect(resultsGate('aberta', 4, 5)).toEqual({ state: 'poucas', total: 4, min: 5 })
    expect(resultsGate('aberta', 8, 5)).toEqual({ state: 'liberado', partial: true })
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
    expect(rows.find((r) => r.pergunta.startsWith('01.'))).toMatchObject({ tipo: 'Escala de 1 a 5', valor: 5, grupo: 'Favorável (4–5)', resposta: '5 · Concordo totalmente' })
    expect(rows.find((r) => r.pergunta.startsWith('03.'))?.grupo).toBe('Não aconteceu')
  })

  it('deixa de fora a pergunta oculta pela ramificação', () => {
    const respostas = [sim(), sim(), ...Array.from({ length: 8 }, () => nao())]
    const rows = buildAnswerRows(di, respostas, computeStats(di, respostas, 5))
    expect(rows.some((r) => r.pergunta.startsWith('11.'))).toBe(false)
  })
})

describe('cultura organizacional: dimensões, nota e comparação', () => {
  const cultura = normalizeQuestions(TEMPLATE_CULTURA.questions)
  const resposta = (fav: boolean, nota: string): SurveyAnswers => Object.fromEntries(cultura.map((q) => [q.id, q.type === 'nota' ? nota : fav ? '5' : '2']))

  it('o modelo tem 46 afirmações em 5 dimensões e 7 indicadores, em partes por dimensão', () => {
    expect(cultura).toHaveLength(53)
    expect(new Set(cultura.filter((q) => q.section !== 'Indicadores').map((q) => q.section))).toEqual(new Set(['Credibilidade', 'Respeito', 'Imparcialidade', 'Orgulho', 'Camaradagem']))
    expect(cultura.filter((q) => q.labels?.length === 5)).toHaveLength(52)
    expect(validateQuestions(cultura)).toEqual([])
    const pages = paginateQuestions(cultura)
    expect(pages.every((p) => new Set(p.map((q) => q.section)).size === 1 && p.length <= 7)).toBe(true)
    expect(estimateMinutes(cultura)).toBeLessThanOrEqual(10)
  })

  it('calcula média da nota e % favorável por dimensão e tema, com comparação', () => {
    const respostas = [...Array.from({ length: 6 }, () => resposta(true, '9')), ...Array.from({ length: 4 }, () => resposta(false, '6'))]
    const baseline = { label: 'Pesquisa anterior', total: 45, items: { p1: { shares: [0, 10, 30, 40, 20] }, ind_felicidade: { mean: 8.31 } } }
    const stats = computeStats(cultura, respostas, 5, baseline)
    const p1 = stat<ChoiceStat>(stats, 'p1')
    expect(p1.favorable).toBeCloseTo(0.6)
    expect(p1.baseline).toMatchObject({ favorable: 0.6, trend: 'estavel' })
    expect(stat<ChoiceStat>(stats, 'ind_felicidade')).toMatchObject({ mean: 7.8, baseline: { mean: 8.31 } })
    const secoes = summarizeSections(stats, respostas.length)
    expect(secoes.map((s) => s.name)).toEqual(['Credibilidade', 'Respeito', 'Imparcialidade', 'Orgulho', 'Camaradagem', 'Indicadores'])
    expect(secoes[0].favorable).toBeCloseTo(0.6)
    expect(secoes[0].criticity).toBe('atencao')
    expect(secoes[0].themes.map((t) => t.name)).toEqual(['Comunicação da liderança', 'Competência da liderança', 'Integridade da liderança'])
    const resumo = buildMeetingSummary(stats, respostas.length)
    expect(resumo.keyNota?.question.id).toBe('ind_felicidade')
    expect(resumo.focusThemes.length).toBeGreaterThan(0)
  })

  it('leva dimensão, tema e nota para a base das dinâmicas', () => {
    const respostas = Array.from({ length: 5 }, () => resposta(true, '10'))
    const rows = buildAnswerRows(cultura, respostas, computeStats(cultura, respostas, 5))
    expect(rows.find((r) => r.pergunta.startsWith('01.'))).toMatchObject({ dimensao: 'Credibilidade', tema: 'Comunicação da liderança', resposta: 'Concordo totalmente', grupo: 'Favorável (4–5)' })
    expect(rows.find((r) => r.tipo === 'Nota de 0 a 10')).toMatchObject({ valor: 10, grupo: 'Notas 9–10' })
  })

  it('mostra a aplicação anterior a partir dos percentuais, respeitando quem teve 44 respostas', () => {
    expect(countsFromShares([0, 6.8, 15.9, 45.5, 31.8], 45)).toEqual([0, 3, 7, 20, 14])
    expect(countsFromShares([0, 11.1, 26.7, 37.8, 24.4], 45)).toEqual([0, 5, 12, 17, 11])
    const baseline = {
      label: 'Pesquisa de 2024',
      total: 45,
      items: { p1: { shares: [0, 11.1, 26.7, 37.8, 24.4] }, p10: { shares: [0, 6.8, 15.9, 45.5, 31.8] }, ind_felicidade: { mean: 8.31 } },
    }
    const stats = statsFromBaseline(cultura, baseline, 5)
    expect(stats).toHaveLength(3)
    expect(stat<ChoiceStat>(stats, 'p1')).toMatchObject({ valid: 45, n: 1, section: 'Credibilidade', baseline: null })
    expect(stat<ChoiceStat>(stats, 'p1').favorable).toBeCloseTo(28 / 45)
    expect(stat<ChoiceStat>(stats, 'p10').valid).toBe(44)
    expect(stat<ChoiceStat>(stats, 'ind_felicidade')).toMatchObject({ mean: 8.31, counts: {} })
    expect(summarizeSections(stats, 45)[0].name).toBe('Credibilidade')
    const rows = answerRowsFromStats(stats)
    expect(rows.filter((r) => r.pergunta.startsWith('01.'))).toHaveLength(45)
    expect(rows.some((r) => r.tipo === 'Nota de 0 a 10')).toBe(false)
  })

  it('variação só conta como subida ou queda fora da margem', () => {
    expect(trendOf(0.8, 0.5, 45, 45)).toBe('subiu')
    expect(trendOf(0.55, 0.5, 45, 45)).toBe('estavel')
    expect(trendOf(0.2, 0.5, 45, 45)).toBe('caiu')
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
