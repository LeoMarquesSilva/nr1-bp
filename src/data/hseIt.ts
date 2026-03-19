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

/**
 * Legenda do que cada dimensão representa (fonte: aba "descrição" da planilha HSE).
 * Substitua pelos textos oficiais da planilha quando disponível.
 */
export const DIMENSION_DESCRIPTIONS: Record<DimensionId, string> = {
  demandas:
    'Avalia o volume de trabalho e a pressão por prazos. Envolve aspectos como quantidade de tarefas, ritmo de trabalho, prazos e intensidade das atividades no dia a dia.',
  controle:
    'Avalia o nível de autonomia que o trabalhador tem para realizar suas atividades. Trata-se da possibilidade de organizar o próprio trabalho, tomar decisões e participar de escolhas relacionadas às tarefas.',
  apoio_chefia:
    'Avalia o suporte oferecido pela liderança. Inclui orientação, confiança, disponibilidade para ajudar, reconhecimento e incentivo da chefia.',
  apoio_colega:
    'Avalia o nível de cooperação entre os colegas de trabalho. Considera ajuda mútua, respeito, colaboração e disposição para apoiar uns aos outros.',
  relacionamentos:
    'Avalia como são as relações no ambiente de trabalho. Se refere a respeito, tratamento entre as pessoas, clima de convivência e possíveis conflitos no dia a dia.',
  cargo_papel:
    'Avalia se o trabalhador tem clareza sobre suas responsabilidades e expectativas no trabalho. Inclui entendimento das tarefas, objetivos da função e responsabilidades dentro da equipe.',
  comunicacao_mudancas:
    'Avalia como as mudanças no trabalho são comunicadas e conduzidas. Considera a forma como informações são compartilhadas, o preparo das equipes e o suporte durante mudanças organizacionais.',
}

const LABEL_COMUNICACAO = 'Comunicação e mudanças'

export const QUESTIONS: Question[] = [
  // Demandas (8) - invertido
  {
    id: 1,
    dimensionId: 'demandas',
    dimensionLabel: 'Demandas',
    text: 'Recebo pedidos de trabalho de diferentes pessoas ou setores que são difíceis de conciliar entre si.',
  },
  {
    id: 2,
    dimensionId: 'demandas',
    dimensionLabel: 'Demandas',
    text: 'Recebo prazos difíceis de serem cumpridos.',
  },
  {
    id: 3,
    dimensionId: 'demandas',
    dimensionLabel: 'Demandas',
    text: 'Meu trabalho exige um ritmo muito intenso.',
  },
  {
    id: 4,
    dimensionId: 'demandas',
    dimensionLabel: 'Demandas',
    text: 'Tenho tarefas demais para conseguir fazer tudo.',
  },
  {
    id: 5,
    dimensionId: 'demandas',
    dimensionLabel: 'Demandas',
    text: 'Não consigo fazer pausas suficientes durante o trabalho.',
  },
  {
    id: 6,
    dimensionId: 'demandas',
    dimensionLabel: 'Demandas',
    text: 'Recebo pressão para trabalhar além do horário normal.',
  },
  {
    id: 7,
    dimensionId: 'demandas',
    dimensionLabel: 'Demandas',
    text: 'Tenho que fazer meu trabalho com muita rapidez.',
  },
  {
    id: 8,
    dimensionId: 'demandas',
    dimensionLabel: 'Demandas',
    text: 'As pausas temporárias são impossíveis de cumprir.',
  },
  // Controle (6)
  {
    id: 9,
    dimensionId: 'controle',
    dimensionLabel: 'Controle',
    text: 'Posso decidir quando fazer pausas no trabalho.',
  },
  {
    id: 10,
    dimensionId: 'controle',
    dimensionLabel: 'Controle',
    text: 'Tenho algum poder de decisão sobre a minha maneira de trabalhar.',
  },
  {
    id: 11,
    dimensionId: 'controle',
    dimensionLabel: 'Controle',
    text: 'Tenho liberdade para decidir como fazer meu trabalho.',
  },
  {
    id: 12,
    dimensionId: 'controle',
    dimensionLabel: 'Controle',
    text: 'Tenho liberdade para decidir o que fazer no meu trabalho.',
  },
  {
    id: 13,
    dimensionId: 'controle',
    dimensionLabel: 'Controle',
    text: 'Minhas sugestões são consideradas sobre como fazer meu trabalho.',
  },
  {
    id: 14,
    dimensionId: 'controle',
    dimensionLabel: 'Controle',
    text: 'Tenho flexibilidade no meu horário de trabalho.',
  },
  // Apoio da chefia (5)
  {
    id: 15,
    dimensionId: 'apoio_chefia',
    dimensionLabel: 'Apoio da chefia',
    text: 'Recebo informações e apoio que me ajudam a fazer meu trabalho.',
  },
  {
    id: 16,
    dimensionId: 'apoio_chefia',
    dimensionLabel: 'Apoio da chefia',
    text: 'Posso confiar no meu chefe quando tenho problemas no trabalho.',
  },
  {
    id: 17,
    dimensionId: 'apoio_chefia',
    dimensionLabel: 'Apoio da chefia',
    text: 'Quando algo me incomoda no trabalho, posso falar com meu chefe.',
  },
  {
    id: 18,
    dimensionId: 'apoio_chefia',
    dimensionLabel: 'Apoio da chefia',
    text: 'Recebo apoio quando realizo trabalho que pode ser emocionalmente desgastante.',
  },
  {
    id: 19,
    dimensionId: 'apoio_chefia',
    dimensionLabel: 'Apoio da chefia',
    text: 'Meu chefe me incentiva no trabalho.',
  },
  // Apoio dos colegas (4)
  {
    id: 20,
    dimensionId: 'apoio_colega',
    dimensionLabel: 'Apoio dos colegas',
    text: 'Quando o trabalho fica difícil, posso contar com a ajuda dos colegas.',
  },
  {
    id: 21,
    dimensionId: 'apoio_colega',
    dimensionLabel: 'Apoio dos colegas',
    text: 'Posso contar com a ajuda dos meus colegas quando preciso.',
  },
  {
    id: 22,
    dimensionId: 'apoio_colega',
    dimensionLabel: 'Apoio dos colegas',
    text: 'No trabalho, meus colegas me tratam com respeito.',
  },
  {
    id: 23,
    dimensionId: 'apoio_colega',
    dimensionLabel: 'Apoio dos colegas',
    text: 'Meus colegas estão disponíveis para ouvir meus problemas de trabalho.',
  },
  // Relacionamentos (4) - invertido
  {
    id: 24,
    dimensionId: 'relacionamentos',
    dimensionLabel: 'Relacionamentos',
    text: 'No trabalho falam comigo de forma dura ou desrespeitosa.',
  },
  {
    id: 25,
    dimensionId: 'relacionamentos',
    dimensionLabel: 'Relacionamentos',
    text: 'Existem conflitos entre colegas no trabalho.',
  },
  {
    id: 26,
    dimensionId: 'relacionamentos',
    dimensionLabel: 'Relacionamentos',
    text: 'Sinto que algumas pessoas me tratam de forma injusta no trabalho.',
  },
  {
    id: 27,
    dimensionId: 'relacionamentos',
    dimensionLabel: 'Relacionamentos',
    text: 'O clima entre as pessoas no trabalho é tenso.',
  },
  // Cargo / Papel (5)
  {
    id: 28,
    dimensionId: 'cargo_papel',
    dimensionLabel: 'Cargo / Papel',
    text: 'Tenho clareza sobre o que esperam do meu trabalho.',
  },
  {
    id: 29,
    dimensionId: 'cargo_papel',
    dimensionLabel: 'Cargo / Papel',
    text: 'Sei o que preciso fazer no meu trabalho.',
  },
  {
    id: 30,
    dimensionId: 'cargo_papel',
    dimensionLabel: 'Cargo / Papel',
    text: 'Minhas tarefas e responsabilidades são claras.',
  },
  {
    id: 31,
    dimensionId: 'cargo_papel',
    dimensionLabel: 'Cargo / Papel',
    text: 'Os objetivos e metas do meu setor são claros para mim.',
  },
  {
    id: 32,
    dimensionId: 'cargo_papel',
    dimensionLabel: 'Cargo / Papel',
    text: 'Entendo como meu trabalho contribui para os objetivos da empresa.',
  },
  // Comunicação e mudanças (3)
  {
    id: 33,
    dimensionId: 'comunicacao_mudancas',
    dimensionLabel: LABEL_COMUNICACAO,
    text: 'Posso questionar meu chefe sobre mudanças no trabalho.',
  },
  {
    id: 34,
    dimensionId: 'comunicacao_mudancas',
    dimensionLabel: LABEL_COMUNICACAO,
    text: 'A equipe é sempre consultada sobre mudanças no trabalho.',
  },
  {
    id: 35,
    dimensionId: 'comunicacao_mudancas',
    dimensionLabel: LABEL_COMUNICACAO,
    text: 'As mudanças no trabalho são comunicadas de forma clara.',
  },
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
