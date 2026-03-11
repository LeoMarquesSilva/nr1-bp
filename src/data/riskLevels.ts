/**
 * Faixas de classificação de risco psicossocial (escala 1–5).
 * Alinhado ao relatório de diagnóstico e plano de ação.
 */

export type RiskLevelKey =
  | 'muito_alto'
  | 'alto'
  | 'moderado'
  | 'baixo'
  | 'muito_baixo'

export interface RiskLevel {
  key: RiskLevelKey
  label: string
  /** Classe Tailwind para texto (ex.: text-red-700) */
  colorClass: string
  /** Classe Tailwind para fundo/borda (ex.: bg-red-50 border-red-200) */
  bgClass: string
  /** Cor hex para gráficos */
  hex: string
}

/** Faixas de média (1–5) → nível de risco. Até 1.0, 1.1–2.0, 2.1–3.0, 3.1–4.0, 4.1–5.0 */
export const RISK_LEVELS: RiskLevel[] = [
  {
    key: 'muito_alto',
    label: 'Risco Muito Alto',
    colorClass: 'text-red-800',
    bgClass: 'bg-red-50 border-red-200',
    hex: '#B91C1C',
  },
  {
    key: 'alto',
    label: 'Risco Alto',
    colorClass: 'text-orange-700',
    bgClass: 'bg-orange-50 border-orange-200',
    hex: '#C2410C',
  },
  {
    key: 'moderado',
    label: 'Risco Moderado',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50 border-amber-200',
    hex: '#B45309',
  },
  {
    key: 'baixo',
    label: 'Risco Baixo',
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-200',
    hex: '#047857',
  },
  {
    key: 'muito_baixo',
    label: 'Risco Muito Baixo',
    colorClass: 'text-emerald-800',
    bgClass: 'bg-emerald-50 border-emerald-300',
    hex: '#065F46',
  },
]

/**
 * Retorna o nível de risco conforme a média (1–5).
 * Até 1,0 → Muito Alto; 1,1–2,0 → Alto; 2,1–3,0 → Moderado; 3,1–4,0 → Baixo; 4,1–5,0 → Muito Baixo.
 */
export function getRiskLevel(average: number): RiskLevel {
  if (average <= 1) return RISK_LEVELS[0]
  if (average <= 2) return RISK_LEVELS[1]
  if (average <= 3) return RISK_LEVELS[2]
  if (average <= 4) return RISK_LEVELS[3]
  return RISK_LEVELS[4]
}

/** Retorna a chave do nível de risco para uso no mapa do plano de ação. */
export function getRiskLevelKey(average: number): RiskLevelKey {
  return getRiskLevel(average).key
}

export function getRiskLevelByKey(key: RiskLevelKey): RiskLevel {
  const level = RISK_LEVELS.find((l) => l.key === key)
  return level ?? RISK_LEVELS[2]
}
