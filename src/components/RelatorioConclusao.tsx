import { useState, useEffect } from 'react'
import { Copy, Check, Loader2, FileText } from 'lucide-react'
import type { DimensionSummary } from '@/data/hseIt'
import { getRiskLevel, getRiskLevelKey } from '@/data/riskLevels'
import { fetchPlanoDeAcao, getPlanoText, type PlanoDeAcaoMap } from '@/data/planoDeAcao'

const ORDEM_DIMENSOES = [
  'demandas',
  'controle',
  'apoio_chefia',
  'apoio_colega',
  'relacionamentos',
  'cargo_papel',
  'comunicacao_mudancas',
] as const

function ordenarScores(scores: DimensionSummary[]): DimensionSummary[] {
  const byId = new Map(scores.map((s) => [s.dimensionId, s]))
  return ORDEM_DIMENSOES.map((id) => byId.get(id)).filter(
    (s): s is DimensionSummary => s != null
  )
}

function buildVisaoGeral(scores: DimensionSummary[]): string {
  const counts = { muito_alto: 0, alto: 0, moderado: 0, baixo: 0, muito_baixo: 0 }
  for (const s of scores) {
    const key = getRiskLevelKey(s.average)
    counts[key] = (counts[key] ?? 0) + 1
  }
  const parts: string[] = []
  if (counts.muito_baixo) parts.push(`${counts.muito_baixo} em risco muito baixo`)
  if (counts.baixo) parts.push(`${counts.baixo} em risco baixo`)
  if (counts.moderado) parts.push(`${counts.moderado} em risco moderado`)
  if (counts.alto) parts.push(`${counts.alto} em risco alto`)
  if (counts.muito_alto) parts.push(`${counts.muito_alto} em risco muito alto`)
  if (parts.length === 0) return 'Sem dados suficientes para visão geral.'
  return `Com base nas médias por dimensão: ${parts.join(', ')}. Segue a classificação de risco e as diretrizes do plano de ação para cada dimensão.`
}

export type RelatorioConclusaoMeta = {
  /** Nome da empresa */
  empresaNome?: string
  /** Número de respostas (ex.: total da empresa ou 1 para setor individual) */
  totalRespostas?: number
  /** Data do relatório (ex.: data em que foi gerado) */
  dataRelatorio?: string
}

function buildTextoParaCopiar(
  setor: string,
  scores: DimensionSummary[],
  planoMap: PlanoDeAcaoMap | null,
  meta?: RelatorioConclusaoMeta
): string {
  const ordenados = ordenarScores(scores)
  const linhas: string[] = []

  if (meta?.empresaNome || meta?.totalRespostas != null || meta?.dataRelatorio) {
    linhas.push('RELATÓRIO DO DIAGNÓSTICO — INFORMAÇÕES GERAIS')
    linhas.push('')
    if (meta.empresaNome) {
      linhas.push(`Empresa: ${meta.empresaNome}`)
    }
    if (meta.totalRespostas != null) {
      linhas.push(`Total de respostas: ${meta.totalRespostas}`)
    }
    if (meta.dataRelatorio) {
      linhas.push(`Data do relatório: ${meta.dataRelatorio}`)
    }
    linhas.push('')
    linhas.push('---')
    linhas.push('')
  }

  linhas.push('CONCLUSÃO')
  linhas.push('')
  linhas.push(`Setor / escopo: ${setor}`)
  linhas.push('')
  linhas.push('Visão geral')
  linhas.push(buildVisaoGeral(scores))
  linhas.push('')
  linhas.push('---')
  linhas.push('')
  linhas.push('Dimensões e plano de ação')
  linhas.push('')

  for (const d of ordenados) {
    const risk = getRiskLevel(d.average)
    const planoText = planoMap ? getPlanoText(planoMap, d.dimensionId, risk.key) : ''
    linhas.push(`${d.dimensionLabel}`)
    linhas.push(`Média: ${d.average} (1–5) | Classificação: ${risk.label}`)
    if (planoText) {
      linhas.push('')
      linhas.push(planoText.slice(0, 500) + (planoText.length > 500 ? '...' : ''))
    }
    linhas.push('')
  }
  return linhas.join('\n')
}

type Props = {
  scores: DimensionSummary[]
  setor: string
  /** Se true, mostra botão de copiar e seção para impressão/export */
  showCopy?: boolean
  /** Dados para incluir no texto copiado (empresa, respostas, data) */
  meta?: RelatorioConclusaoMeta
}

export function RelatorioConclusao({ scores, setor, showCopy = true, meta }: Props) {
  const [planoMap, setPlanoMap] = useState<PlanoDeAcaoMap | null>(null)
  const [planoLoading, setPlanoLoading] = useState(true)
  const [planoError, setPlanoError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setPlanoLoading(true)
    setPlanoError(null)
    fetchPlanoDeAcao()
      .then((map) => {
        if (!cancelled) setPlanoMap(map)
      })
      .catch((err) => {
        if (!cancelled) setPlanoError(err instanceof Error ? err.message : 'Erro ao carregar plano de ação.')
      })
      .finally(() => {
        if (!cancelled) setPlanoLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleCopyConclusao = async () => {
    const text = buildTextoParaCopiar(setor, scores, planoMap, meta)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      alert('Não foi possível copiar. Tente selecionar e copiar manualmente.')
    }
  }

  const ordenados = ordenarScores(scores)
  const visaoGeral = buildVisaoGeral(scores)

  return (
    <div className="relatorio-conclusao rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border print:shadow-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FileText className="h-5 w-5 text-slate-500" />
          Conclusão do diagnóstico
        </h3>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopyConclusao}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar conclusão para relatório
              </>
            )}
          </button>
        )}
      </div>

      <section className="mb-6">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Setor / escopo
        </h4>
        <p className="mt-1 font-medium text-slate-900">{setor}</p>
      </section>

      <section className="mb-6">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Visão geral do setor
        </h4>
        <p className="mt-2 text-sm text-slate-700">{visaoGeral}</p>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Dimensões e plano de ação
        </h4>
        <ul className="space-y-6">
          {ordenados.map((d) => {
            const risk = getRiskLevel(d.average)
            const planoText = planoMap ? getPlanoText(planoMap, d.dimensionId, risk.key) : null
            return (
              <li
                key={d.dimensionId}
                className={`rounded-xl border-2 p-4 transition-colors ${risk.bgClass}`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">{d.dimensionLabel}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${risk.colorClass}`}>
                    {d.average} – {risk.label}
                  </span>
                </div>
                {planoLoading && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando plano de ação...
                  </div>
                )}
                {planoError && !planoText && (
                  <p className="text-xs text-amber-700">{planoError}</p>
                )}
                {planoText && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-slate-500 mb-1.5">
                      Plano de ação para este nível ({risk.label}):
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                      {planoText}
                    </p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
