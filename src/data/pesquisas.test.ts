import { describe, expect, it } from 'vitest'
import {
  NR_OPTION,
  OTHER_KEY,
  TEMPLATE_DIVERSIDADE,
  changeQuestionType,
  createQuestion,
  getAnswerOptions,
  isPageComplete,
  isQuestionAnswered,
  normalizeQuestions,
  paginateQuestions,
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

  it('aceita "Prefiro não responder" só onde está habilitado e deixa abertas opcionais', () => {
    expect(isQuestionAnswered(q('q1'), NR_OPTION.key)).toBe(true)
    expect(isQuestionAnswered(q('q3'), 'nr')).toBe(true)
    expect(isQuestionAnswered(q('q3'), '5')).toBe(false)
    expect(isQuestionAnswered(q('q10'), 'nr')).toBe(false)
    expect(isQuestionAnswered(q('q9'), undefined)).toBe(true)
    expect(isQuestionAnswered({ ...q('q9'), required: true }, '  ')).toBe(false)
    expect(paginateQuestions(di).every((page) => isPageComplete(page, completo))).toBe(true)
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
