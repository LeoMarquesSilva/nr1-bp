import { describe, expect, it } from 'vitest'
import {
  NR_OPTION,
  OTHER_KEY,
  TEMPLATE_DIVERSIDADE,
  changeQuestionType,
  countReached,
  createQuestion,
  describeGate,
  getAnswerOptions,
  getVisibleQuestions,
  isPageComplete,
  isQuestionAnswered,
  normalizeQuestions,
  paginateQuestions,
  parseIntro,
  parseQuestions,
  sanitizeAnswers,
  summarizeResponses,
  validateQuestions,
  type SurveyAnswers,
  type SurveyQuestion,
} from './pesquisas'

const di = TEMPLATE_DIVERSIDADE.questions as SurveyQuestion[]
const q = (id: string) => di.find((x) => x.id === id)!

const completo: SurveyAnswers = {
  q1: '5', q2: '4', q3: 'nunca', q4: 'nr', q5: '3', q6: '2', q7: '1', q8: '4',
  q10: 'sim',
  q11: { selected: ['genero', 'raca'] },
}

describe('motor de pesquisas', () => {
  it('modelo de D&I tem as 12 perguntas do documento, em 3 páginas', () => {
    expect(di.map((x) => x.id)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12'])
    expect(paginateQuestions(di).map((p) => p.length)).toEqual([4, 4, 4])
    expect(validateQuestions(di)).toEqual([])
  })

  it('aceita "Prefiro não responder" só onde está habilitado e exige as abertas da D&I', () => {
    expect(isQuestionAnswered(q('q1'), NR_OPTION.key)).toBe(true)
    expect(isQuestionAnswered(q('q3'), 'nr')).toBe(true)
    expect(isQuestionAnswered(q('q3'), '5')).toBe(false)
    expect(isQuestionAnswered(q('q10'), 'nr')).toBe(false)
    expect(isQuestionAnswered(q('q9'), undefined)).toBe(false)
    expect(isQuestionAnswered(q('q12'), '  ')).toBe(false)
    expect(isQuestionAnswered({ ...q('q9'), required: false }, undefined)).toBe(true)
    expect(paginateQuestions(di).every((page) => isPageComplete(page, completo))).toBe(false)
    expect(paginateQuestions(di).every((page) => isPageComplete(page, { ...completo, q9: 'Respeito', q12: 'Mentoria' }))).toBe(true)
  })

  it('limita seleções da múltipla escolha e exige texto em "Outros"', () => {
    const q11 = q('q11')
    expect(getAnswerOptions(q11).at(-1)?.key).toBe(OTHER_KEY)
    expect(isQuestionAnswered(q11, { selected: [] })).toBe(false)
    expect(isQuestionAnswered(q11, { selected: ['genero', 'raca', 'pcd', 'lgbtqia'] })).toBe(false)
    expect(isQuestionAnswered(q11, { selected: [OTHER_KEY] })).toBe(false)
    expect(isQuestionAnswered(q11, { selected: [OTHER_KEY], outro: 'Etarismo' })).toBe(true)
    expect(isQuestionAnswered(q11, { selected: ['inexistente'] })).toBe(false)
  })

  it('a 11 e a 12 só aparecem depois do "Sim" na pergunta 10; "Não" encerra', () => {
    const ate10 = { q1: '5', q2: '4', q3: 'nunca', q4: 'nr', q5: '3', q6: '2', q7: '1', q8: '4', q9: 'Respeito' }
    expect(getVisibleQuestions(di, { ...ate10, q10: 'nao' }).map((x) => x.id).at(-1)).toBe('q10')
    expect(getVisibleQuestions(di, { ...ate10, q10: 'sim' })).toHaveLength(12)
    expect(getVisibleQuestions(di, ate10).map((x) => x.id).at(-1)).toBe('q10')

    // Quem respondeu "Não" pode enviar sem a 11 (obrigatória para quem segue)
    const nao = { ...ate10, q10: 'nao' }
    expect(paginateQuestions(getVisibleQuestions(di, nao)).every((p) => isPageComplete(p, nao))).toBe(true)
    expect(paginateQuestions(getVisibleQuestions(di, { ...ate10, q10: 'sim' })).every((p) => isPageComplete(p, { ...ate10, q10: 'sim' }))).toBe(false)

    // Respostas da 11 e 12 dadas antes de trocar para "Não" não vão para o banco
    const clean = sanitizeAnswers(di, { ...nao, q11: { selected: ['genero'] }, q12: 'texto' })
    expect(clean.q10).toBe('nao')
    expect(clean.q11).toBeUndefined()
    expect(clean.q12).toBeUndefined()

    expect(describeGate(di, 10)).toBe('Só aparece para quem respondeu “Sim” na pergunta 10.')
    expect(describeGate(di, 9)).toBeNull()
    expect(countReached(di, [{ q10: 'sim' }, { q10: 'nao' }, { q10: 'sim' }], 'q11')).toBe(2)

    // Nos resultados, a 11 só conta quem respondeu "Sim" (mesmo que um "Não" antigo tenha resposta na 11)
    const s11 = summarizeResponses(di, [
      { q10: 'sim', q11: { selected: ['genero'] } },
      { q10: 'nao', q11: { selected: ['raca'] } },
    ]).find((s) => s.question.id === 'q11')
    expect(s11?.kind === 'multipla' && [s11.respondents, s11.counts.genero, s11.counts.raca]).toEqual([1, 1, 0])
  })

  it('lê o texto de abertura em parágrafos, com *negrito*', () => {
    const intro = parseIntro('Conhecer o *Bismarchi | Pires* e agir.\r\n\r\nSegundo *parágrafo*\ncom quebra.\n\n\nPreço * 2 sem par')
    expect(intro).toHaveLength(3)
    expect(intro[0]).toEqual([
      { text: 'Conhecer o ', bold: false },
      { text: 'Bismarchi | Pires', bold: true },
      { text: ' e agir.', bold: false },
    ])
    expect(intro[1].map((s) => s.bold)).toEqual([false, true, false])
    expect(intro[2]).toEqual([{ text: 'Preço * 2 sem par', bold: false }])
  })

  it('guarda a regra de encerrar só em sim ou não', () => {
    const sn: SurveyQuestion = { id: 'a', type: 'sim_nao', text: 'x', required: true, endIf: 'nao' }
    expect(normalizeQuestions([sn])[0].endIf).toBe('nao')
    expect(normalizeQuestions([{ ...sn, type: 'escala' }])[0].endIf).toBeUndefined()
    expect(changeQuestionType(sn, 'escala').endIf).toBeUndefined()
  })

  it('limpa respostas antes de salvar', () => {
    const clean = sanitizeAnswers(di, {
      ...completo,
      q2: 'invalida',
      q9: '   ',
      q11: { selected: ['genero', 'xyz', 'genero'], outro: 'ignorado' },
      q12: '  Mentoria  ',
      extra: 'campo desconhecido',
    })
    expect(clean.q2).toBeUndefined()
    expect(clean.q9).toBeUndefined()
    expect(clean.q11).toEqual({ selected: ['genero'] })
    expect(clean.q12).toBe('Mentoria')
    expect(clean.extra).toBeUndefined()
  })

  it('agrega contagens e média sem contar "Prefiro não responder"', () => {
    const summary = summarizeResponses(di, [
      { ...completo, q1: '5' },
      { ...completo, q1: '3' },
      { ...completo, q1: 'nr', q9: 'Respeito', q11: { selected: [OTHER_KEY], outro: 'Etarismo' } },
    ])
    const s1 = summary.find((s) => s.question.id === 'q1')
    expect(s1?.kind === 'escala' && s1.mean).toBe(4)
    expect(s1?.kind === 'escala' && s1.counts.nr).toBe(1)
    const s10 = summary.find((s) => s.question.id === 'q10')
    expect(s10?.kind === 'opcoes' && s10.counts.sim).toBe(3)
    const s11 = summary.find((s) => s.question.id === 'q11')
    expect(s11?.kind === 'multipla' && s11.counts.genero).toBe(2)
    expect(s11?.kind === 'multipla' && s11.outros).toEqual(['Etarismo'])
    const s9 = summary.find((s) => s.question.id === 'q9')
    expect(s9?.kind === 'aberta' && s9.texts).toEqual(['Respeito'])
  })

  it('valida perguntas antes de abrir a pesquisa', () => {
    expect(validateQuestions([])).toEqual(['Adicione ao menos uma pergunta.'])
    const multipla = createQuestion('multipla')
    const problemas = validateQuestions([{ ...multipla, text: 'Temas?' }])
    expect(problemas.some((p) => p.includes('2 opções'))).toBe(true)
    const repetidas = { ...multipla, text: 'Temas?', options: [{ key: 'a', label: 'X' }, { key: 'b', label: 'x' }] }
    expect(validateQuestions([repetidas]).some((p) => p.includes('repetidas'))).toBe(true)
  })

  it('troca de tipo preserva id e texto; normaliza e lê perguntas do banco', () => {
    const original = { ...createQuestion('escala'), text: 'Texto' }
    const trocada = changeQuestionType(original, 'multipla')
    expect(trocada.id).toBe(original.id)
    expect(trocada.text).toBe('Texto')
    expect(trocada.options?.length).toBe(2)
    expect(normalizeQuestions([q('q3')])[0]).toEqual(q('q3'))
    expect(parseQuestions([...di, { id: 1 }, null, { id: 'x', type: 'invalido', text: '' }])).toHaveLength(12)
  })
})
