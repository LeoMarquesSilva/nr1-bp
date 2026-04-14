/**
 * Carrega e faz parse do plano de ação (plano-de-acao.md) para obter
 * texto por dimensão e nível de risco.
 */

import type { DimensionId } from './hseIt'
import type { RiskLevelKey } from './riskLevels'

export type PlanoDeAcaoMap = Record<DimensionId, Record<RiskLevelKey, string>>

const DIMENSION_NAME_TO_ID: Record<string, DimensionId> = {
  demandas: 'demandas',
  controle: 'controle',
  'apoio da chefia': 'apoio_chefia',
  'apoio dos colegas': 'apoio_colega',
  relacionamentos: 'relacionamentos',
  'papel / cargo': 'cargo_papel',
  'cargo / papel': 'cargo_papel',
  'comunicação e mudanças organizacionais': 'comunicacao_mudancas',
}

const RISCO_LABEL_TO_KEY: Record<string, RiskLevelKey> = {
  'risco muito alto': 'muito_alto',
  'risco alto': 'alto',
  'risco moderado': 'moderado',
  'risco baixo': 'baixo',
  'risco muito baixo': 'muito_baixo',
}

function normalizeDimensionName(raw: string): DimensionId | null {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
  return DIMENSION_NAME_TO_ID[normalized] ?? null
}

function parseRiskBlocks(block: string): Partial<Record<RiskLevelKey, string>> {
  const result: Partial<Record<RiskLevelKey, string>> = {}
  // Ordem importante: "Muito Alto" e "Muito Baixo" antes de "Alto" e "Baixo" para não casar "Baixo" dentro de "Muito Baixo"
  const riskRegex = /^Risco (Muito Alto|Muito Baixo|Alto|Moderado|Baixo)\s*$/gm
  const matches: { key: RiskLevelKey; contentStart: number; headerStart: number }[] = []
  let match: RegExpExecArray | null

  while ((match = riskRegex.exec(block)) !== null) {
    const label = (`Risco ${match[1]}`).toLowerCase()
    const key = RISCO_LABEL_TO_KEY[label]
    if (!key) continue
    matches.push({
      key,
      contentStart: match.index + match[0].length,
      headerStart: match.index,
    })
  }

  for (let i = 0; i < matches.length; i++) {
    // Cortar até o início do próximo cabeçalho (exclusive), para não incluir "Risco Muito Baixo" no texto de "Risco Baixo"
    const end = matches[i + 1]?.headerStart ?? block.length
    const raw = block.slice(matches[i].contentStart, end)
    const text = raw.replace(/\n{3,}/g, '\n\n').trim()
    if (text) result[matches[i].key] = text
  }

  return result
}

/**
 * Faz o parse do conteúdo do plano-de-acao.md e retorna mapa
 * dimensionId -> { riskLevelKey -> texto }.
 */
export function parsePlanoDeAcaoMd(md: string): PlanoDeAcaoMap {
  const map = {} as PlanoDeAcaoMap
  const dimensionBlockRegex = /PLANO DE AÇÃO – DIMENSÃO:\s*([^\n(]+)/gi
  /** `headerIndex` = início do cabeçalho; `contentStart` = após o cabeçalho da dimensão (fim do match). */
  const blocks: { name: string; headerIndex: number; contentStart: number }[] = []
  let match: RegExpExecArray | null
  while ((match = dimensionBlockRegex.exec(md)) !== null) {
    blocks.push({
      name: match[1].trim(),
      headerIndex: match.index,
      contentStart: match.index + match[0].length,
    })
  }

  for (let i = 0; i < blocks.length; i++) {
    const dimName = blocks[i].name
    const start = blocks[i].contentStart
    // Cortar no início do próximo cabeçalho de dimensão — não no fim da linha do próximo cabeçalho,
    // senão a linha "PLANO DE AÇÃO – DIMENSÃO: …" seguinte entra no último bloco de risco.
    const end = blocks[i + 1]?.headerIndex ?? md.length
    const blockContent = md.slice(start, end)
    const dimensionId = normalizeDimensionName(dimName)
    if (!dimensionId) continue
    const riskTexts = parseRiskBlocks(blockContent)
    if (!map[dimensionId]) map[dimensionId] = {} as Record<RiskLevelKey, string>
    for (const [k, v] of Object.entries(riskTexts)) {
      if (v) map[dimensionId][k as RiskLevelKey] = v
    }
  }

  return map
}

let cachedMap: PlanoDeAcaoMap | null = null

/**
 * Busca o plano de ação em /plano-de-acao.md, faz parse e retorna o mapa.
 * Cacheia o resultado na primeira chamada bem-sucedida.
 */
export async function fetchPlanoDeAcao(): Promise<PlanoDeAcaoMap> {
  if (cachedMap) return cachedMap
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${base}/plano-de-acao.md`)
  if (!res.ok) throw new Error('Não foi possível carregar o plano de ação.')
  const text = await res.text()
  cachedMap = parsePlanoDeAcaoMd(text)
  return cachedMap
}

/**
 * Retorna o texto do plano de ação para uma dimensão e nível de risco.
 * Requer que fetchPlanoDeAcao() já tenha sido chamado e o mapa passado ou em cache.
 */
export function getPlanoText(
  map: PlanoDeAcaoMap,
  dimensionId: DimensionId,
  riskKey: RiskLevelKey
): string {
  const byDim = map[dimensionId]
  if (!byDim) return ''
  return byDim[riskKey] ?? ''
}
