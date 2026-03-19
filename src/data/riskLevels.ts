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
  /** Texto da legenda dos gráficos (faixa numérica + rótulo) */
  legendCaption: string
  /** Classe Tailwind para texto (ex.: text-red-700) */
  colorClass: string
  /** Classe Tailwind para fundo/borda (ex.: bg-red-50 border-red-200) */
  bgClass: string
  /**
   * Cor hex para gráficos — semáforo de risco (faz sentido para o usuário):
   * crítico → alerta → atenção → adequado → muito favorável.
   * Tons escolhidos para afastar vizinhos (laranja ≠ âmbar, verde claro ≠ verde escuro).
   */
  hex: string
}

/** Faixas de média (1–5) → nível de risco. Até 1.0, 1.1–2.0, 2.1–3.0, 3.1–4.0, 4.1–5.0 */
export const RISK_LEVELS: RiskLevel[] = [
  {
    key: 'muito_alto',
    label: 'Risco Muito Alto',
    legendCaption: 'Até 1,0 – Risco Muito Alto',
    colorClass: 'text-red-800',
    bgClass: 'bg-red-50 border-red-400',
    /** Vermelho crítico */
    hex: '#B91C1C',
  },
  {
    key: 'alto',
    label: 'Risco Alto',
    legendCaption: '1,1–2,0 – Risco Alto',
    colorClass: 'text-orange-700',
    bgClass: 'bg-orange-50 border-orange-400',
    /** Laranja “alerta” (matiz mais afastado do vermelho que tons queimados) */
    hex: '#F97316',
  },
  {
    key: 'moderado',
    label: 'Risco Moderado',
    legendCaption: '2,1–3,0 – Risco Moderado',
    colorClass: 'text-yellow-900',
    bgClass: 'bg-yellow-50 border-yellow-500',
    /** Amarelo atenção (bem mais claro que laranja) */
    hex: '#EAB308',
  },
  {
    key: 'baixo',
    label: 'Risco Baixo',
    legendCaption: '3,1–4,0 – Risco Baixo',
    colorClass: 'text-green-800',
    bgClass: 'bg-green-50 border-green-500',
    /** Verde claro = situação favorável */
    hex: '#4ADE80',
  },
  {
    key: 'muito_baixo',
    label: 'Risco Muito Baixo',
    legendCaption: '4,1–5,0 – Risco Muito Baixo',
    colorClass: 'text-green-900',
    bgClass: 'bg-emerald-50 border-emerald-700',
    /** Verde escuro = muito favorável (mesma família do “baixo”, contraste por luminância) */
    hex: '#166534',
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
