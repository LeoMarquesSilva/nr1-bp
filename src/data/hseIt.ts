/**
 * Dados do estudo HSE-IT - 35 perguntas em 7 dimensões.
 * Dimensões "Demandas" e "Relacionamentos" têm pontuação invertida.
 */

export type DimensionId =
  | 'demandas'
  | 'controle'
  | 'apoio_chefia'
  | 'apoio_colega'
  | 'relacionamentos'
  | 'cargo_papel'
  | 'comunicacao_mudancas'

export type OptionKey = 'nunca' | 'raramente' | 'as_vezes' | 'frequentemente' | 'sempre'

export const OPTIONS: { key: OptionKey; label: string }[] = [
  { key: 'nunca', label: 'Nunca' },
  { key: 'raramente', label: 'Raramente' },
  { key: 'as_vezes', label: 'Às vezes' },
  { key: 'frequentemente', label: 'Frequentemente' },
  { key: 'sempre', label: 'Sempre' },
]

/** Pontuação padrão: Nunca=1 ... Sempre=5 */
const SCORE_STANDARD: Record<OptionKey, number> = {
  nunca: 1,
  raramente: 2,
  as_vezes: 3,
  frequentemente: 4,
  sempre: 5,
}

/** Pontuação invertida (Demanda, Relacionamentos): Nunca=5 ... Sempre=1 */
const SCORE_INVERTED: Record<OptionKey, number> = {
  nunca: 5,
  raramente: 4,
  as_vezes: 3,
  frequentemente: 2,
  sempre: 1,
}

export const DIMENSIONS_INVERTED: DimensionId[] = ['demandas', 'relacionamentos']

export function getScore(dimensionId: DimensionId, optionKey: OptionKey): number {
  return DIMENSIONS_INVERTED.includes(dimensionId)
    ? SCORE_INVERTED[optionKey]
    : SCORE_STANDARD[optionKey]
}

export interface Question {
  id: number
  dimensionId: DimensionId
  dimensionLabel: string
  text: string
}

export const QUESTIONS: Question[] = [
  // Demandas (8) - invertido
  { id: 1, dimensionId: 'demandas', dimensionLabel: 'Demandas', text: 'As exigências de trabalho feitas por colegas e supervisores são difíceis de conciliar' },
  { id: 2, dimensionId: 'demandas', dimensionLabel: 'Demandas', text: 'Tenho prazos inatingíveis' },
  { id: 3, dimensionId: 'demandas', dimensionLabel: 'Demandas', text: 'Devo trabalhar muito intensamente' },
  { id: 4, dimensionId: 'demandas', dimensionLabel: 'Demandas', text: 'Eu não faço algumas tarefas porque tenho muita coisa para fazer' },
  { id: 5, dimensionId: 'demandas', dimensionLabel: 'Demandas', text: 'Não tenho possibilidade de fazer pausas suficientes' },
  { id: 6, dimensionId: 'demandas', dimensionLabel: 'Demandas', text: 'Recebo pressão para trabalhar em outro horário' },
  { id: 7, dimensionId: 'demandas', dimensionLabel: 'Demandas', text: 'Tenho que fazer meu trabalho com muita rapidez' },
  { id: 8, dimensionId: 'demandas', dimensionLabel: 'Demandas', text: 'As pausas temporárias são impossíveis de cumprir' },
  // Controle (6)
  { id: 9, dimensionId: 'controle', dimensionLabel: 'Controle', text: 'Posso decidir quando fazer uma pausa' },
  { id: 10, dimensionId: 'controle', dimensionLabel: 'Controle', text: 'Consideram a minha opinião sobre a velocidade do meu trabalho' },
  { id: 11, dimensionId: 'controle', dimensionLabel: 'Controle', text: 'Tenho liberdade de escolha de como fazer o meu trabalho' },
  { id: 12, dimensionId: 'controle', dimensionLabel: 'Controle', text: 'Tenho liberdade de escolha para decidir o que fazer no trabalho' },
  { id: 13, dimensionId: 'controle', dimensionLabel: 'Controle', text: 'Minhas sugestões são consideradas sobre como fazer meu trabalho' },
  { id: 14, dimensionId: 'controle', dimensionLabel: 'Controle', text: 'O meu horário de trabalho pode ser flexível' },
  // Apoio da chefia (5)
  { id: 15, dimensionId: 'apoio_chefia', dimensionLabel: 'Apoio da chefia', text: 'Recebo informações e suporte que me ajudam no trabalho que eu faço' },
  { id: 16, dimensionId: 'apoio_chefia', dimensionLabel: 'Apoio da chefia', text: 'Posso confiar no meu chefe quando eu tiver problemas no trabalho' },
  { id: 17, dimensionId: 'apoio_chefia', dimensionLabel: 'Apoio da chefia', text: 'Quando algo no trabalho me perturba ou irrita posso falar com o meu chefe' },
  { id: 18, dimensionId: 'apoio_chefia', dimensionLabel: 'Apoio da chefia', text: 'Tenho suportado trabalhos emocionalmente exigentes' },
  { id: 19, dimensionId: 'apoio_chefia', dimensionLabel: 'Apoio da chefia', text: 'Meu chefe me incentiva no trabalho' },
  // Apoio dos colegas (4)
  { id: 20, dimensionId: 'apoio_colega', dimensionLabel: 'Apoio dos colegas', text: 'Quando o trabalho se torna difícil, posso contar com ajuda dos colegas' },
  { id: 21, dimensionId: 'apoio_colega', dimensionLabel: 'Apoio dos colegas', text: 'Meus colegas me ajudam e me dão apoio quando eu preciso' },
  { id: 22, dimensionId: 'apoio_colega', dimensionLabel: 'Apoio dos colegas', text: 'No trabalho os meus colegas demonstram o respeito que mereço' },
  { id: 23, dimensionId: 'apoio_colega', dimensionLabel: 'Apoio dos colegas', text: 'Os colegas estão disponíveis para escutar os meus problemas de trabalho' },
  // Relacionamentos (4) - invertido
  { id: 24, dimensionId: 'relacionamentos', dimensionLabel: 'Relacionamentos', text: 'Falam ou se comportam comigo de forma dura' },
  { id: 25, dimensionId: 'relacionamentos', dimensionLabel: 'Relacionamentos', text: 'Existem conflitos entre os colegas' },
  { id: 26, dimensionId: 'relacionamentos', dimensionLabel: 'Relacionamentos', text: 'Sinto que sou perseguido no trabalho' },
  { id: 27, dimensionId: 'relacionamentos', dimensionLabel: 'Relacionamentos', text: 'As relações no trabalho são tensas' },
  // Cargo / Papel (5)
  { id: 28, dimensionId: 'cargo_papel', dimensionLabel: 'Cargo / Papel', text: 'Tenho clareza sobre o que se espera do meu trabalho' },
  { id: 29, dimensionId: 'cargo_papel', dimensionLabel: 'Cargo / Papel', text: 'Eu sei como fazer o meu trabalho' },
  { id: 30, dimensionId: 'cargo_papel', dimensionLabel: 'Cargo / Papel', text: 'Estão claras as minhas tarefas e responsabilidades' },
  { id: 31, dimensionId: 'cargo_papel', dimensionLabel: 'Cargo / Papel', text: 'Os objetivos e metas do meu setor são claros para mim' },
  { id: 32, dimensionId: 'cargo_papel', dimensionLabel: 'Cargo / Papel', text: 'Eu vejo como o meu trabalho se encaixa nos objetivos da empresa' },
  // Comunicação e mudanças organizacionais (3)
  { id: 33, dimensionId: 'comunicacao_mudancas', dimensionLabel: 'Comunicação e mudanças organizacionais', text: 'Tenho oportunidades para pedir explicações ao chefe sobre as mudanças relacionadas ao meu trabalho' },
  { id: 34, dimensionId: 'comunicacao_mudancas', dimensionLabel: 'Comunicação e mudanças organizacionais', text: 'As pessoas são sempre consultadas sobre as mudanças no trabalho' },
  { id: 35, dimensionId: 'comunicacao_mudancas', dimensionLabel: 'Comunicação e mudanças organizacionais', text: 'Quando há mudanças, faço o meu trabalho com o mesmo carinho' },
]

export interface DimensionSummary {
  dimensionId: DimensionId
  dimensionLabel: string
  totalScore: number
  questionCount: number
  average: number
  maxPossible: number
  isInverted: boolean
}

export function computeDimensionScores(
  answers: Record<number, OptionKey>
): DimensionSummary[] {
  const byDimension = new Map<DimensionId, { total: number; count: number }>()
  for (const q of QUESTIONS) {
    const opt = answers[q.id]
    if (!opt) continue
    const score = getScore(q.dimensionId, opt)
    const prev = byDimension.get(q.dimensionId) ?? { total: 0, count: 0 }
    byDimension.set(q.dimensionId, {
      total: prev.total + score,
      count: prev.count + 1,
    })
  }
  const result: DimensionSummary[] = []
  const labels = new Map(QUESTIONS.map((q) => [q.dimensionId, q.dimensionLabel]))
  for (const [dimensionId, { total, count }] of byDimension) {
    const maxPossible = count * 5
    result.push({
      dimensionId,
      dimensionLabel: labels.get(dimensionId) ?? dimensionId,
      totalScore: total,
      questionCount: count,
      average: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
      maxPossible,
      isInverted: DIMENSIONS_INVERTED.includes(dimensionId),
    })
  }
  return result
}

/**
 * Agrega scores de vários envios (ex.: visão da empresa toda).
 * Para cada dimensão: soma dos totais / soma das contagens = média ponderada.
 */
export function aggregateDimensionScores(
  allScores: DimensionSummary[][]
): DimensionSummary[] {
  if (allScores.length === 0) return []
  const byDimension = new Map<
    DimensionId,
    { totalScore: number; questionCount: number; dimensionLabel: string; isInverted: boolean }
  >()
  const labels = new Map(QUESTIONS.map((q) => [q.dimensionId, q.dimensionLabel]))
  for (const scores of allScores) {
    for (const d of scores) {
      const prev = byDimension.get(d.dimensionId)
      if (!prev) {
        byDimension.set(d.dimensionId, {
          totalScore: d.totalScore,
          questionCount: d.questionCount,
          dimensionLabel: d.dimensionLabel,
          isInverted: d.isInverted,
        })
      } else {
        prev.totalScore += d.totalScore
        prev.questionCount += d.questionCount
      }
    }
  }
  const result: DimensionSummary[] = []
  for (const [dimensionId, data] of byDimension) {
    const { totalScore, questionCount, dimensionLabel, isInverted } = data
    const average =
      questionCount > 0 ? Math.round((totalScore / questionCount) * 10) / 10 : 0
    result.push({
      dimensionId,
      dimensionLabel: labels.get(dimensionId) ?? dimensionLabel,
      totalScore,
      questionCount,
      average,
      maxPossible: questionCount * 5,
      isInverted,
    })
  }
  return result
}
