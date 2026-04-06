import { ArrowLeft } from 'lucide-react'
import { computeDimensionScores, type OptionKey, type DimensionSummary } from '../data/hseIt'
import { getRiskLevel } from '../data/riskLevels'
import { GraficosResultados } from './GraficosResultados'

type Props = {
  answers: Record<number, OptionKey>
  setor: string
  onVoltar: () => void
  isAdmin?: boolean
  /** Quando passado, usa estes scores em vez de calcular a partir de answers (ex.: visão empresa) */
  scoresOverride?: DimensionSummary[]
}

export function Resultados({ answers, setor, onVoltar, isAdmin, scoresOverride }: Props) {
  const scores = scoresOverride ?? computeDimensionScores(answers)
  const showVoltar = !scoresOverride

  return (
    <div className="space-y-8">
      {isAdmin && !scoresOverride && (
        <div className="mb-8">
          <GraficosResultados scores={scores} />
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Resultados — {setor}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Mapeamento por dimensão. Quanto menor a média, maior a necessidade de atenção.
          </p>
        </div>
        {showVoltar && (
          <button
            type="button"
            onClick={onVoltar}
            className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {isAdmin ? 'Voltar ao dashboard' : 'Novo diagnóstico'}
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {scores.map((d) => {
          const risk = getRiskLevel(d.average)
          const barPercent = (d.average / 5) * 100
          return (
            <div
              key={d.dimensionId}
              className={`rounded-2xl border-2 p-5 shadow-sm ${risk.bgClass}`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{d.dimensionLabel}</h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${risk.colorClass}`}>
                  {risk.label}
                </span>
              </div>
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="dimension-bar h-full rounded-full"
                  style={{ width: `${barPercent}%`, backgroundColor: risk.hex }}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-bold text-slate-900">{d.average}</span>
                  <span className="ml-1 text-slate-600">média (1–5)</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">{d.totalScore}</span>
                  <span className="ml-1 text-slate-600">soma</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">{d.questionCount}</span>
                  <span className="ml-1 text-slate-600">perguntas</span>
                </div>
              </div>
              {d.isInverted && (
                <p className="mt-2 text-xs text-slate-500" title="Nunca=5, Sempre=1">
                  Critério de pontuação invertido
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
