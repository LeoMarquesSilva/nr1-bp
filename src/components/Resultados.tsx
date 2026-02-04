import { ArrowLeft, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { computeDimensionScores, type OptionKey, type DimensionSummary } from '../data/hseIt'
import { GraficosResultados } from './GraficosResultados'

type Props = {
  answers: Record<number, OptionKey>
  setor: string
  onVoltar: () => void
  isAdmin?: boolean
  /** Quando passado, usa estes scores em vez de calcular a partir de answers (ex.: visão empresa) */
  scoresOverride?: DimensionSummary[]
}

function nivelAtencao(average: number): {
  label: string
  color: string
  bg: string
  Icon: React.ComponentType<{ className?: string }>
} {
  if (average >= 4) return { label: 'Baixa', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', Icon: CheckCircle2 }
  if (average >= 3) return { label: 'Média', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', Icon: Info }
  return { label: 'Alta / Urgente', color: 'text-red-700', bg: 'bg-red-50 border-red-200', Icon: AlertTriangle }
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
          <h2 className="text-2xl font-bold tracking-tight text-escritorio">
            Resultados — {setor}
          </h2>
          <p className="mt-1 text-sm text-escritorio opacity-80">
            Mapeamento por dimensão. Quanto menor a média, maior a necessidade de atenção.
          </p>
        </div>
        {showVoltar && (
          <button
            type="button"
            onClick={onVoltar}
            className="inline-flex items-center gap-2 rounded-xl border bg-card-escritorio px-4 py-2.5 font-semibold text-escritorio shadow-sm transition hover:opacity-90"
            style={{ borderColor: 'rgba(16,31,46,0.2)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            {isAdmin ? 'Voltar ao dashboard' : 'Novo diagnóstico'}
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {scores.map((d) => {
          const nivel = nivelAtencao(d.average)
          const { Icon } = nivel
          const barPercent = (d.average / 5) * 100
          return (
            <div
              key={d.dimensionId}
              className={`rounded-2xl border-2 p-5 shadow-sm ${nivel.bg}`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-escritorio">{d.dimensionLabel}</h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${nivel.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {nivel.label}
                </span>
              </div>
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-dourado-light">
                <div
                  className="dimension-bar h-full rounded-full"
                  style={{ background: 'var(--escritorio-dourado)', width: `${barPercent}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-bold text-escritorio">{d.average}</span>
                  <span className="ml-1 text-escritorio opacity-75">média (1–5)</span>
                </div>
                <div>
                  <span className="font-bold text-escritorio">{d.totalScore}</span>
                  <span className="ml-1 text-escritorio opacity-75">soma</span>
                </div>
                <div>
                  <span className="font-bold text-escritorio">{d.questionCount}</span>
                  <span className="ml-1 text-escritorio opacity-75">perguntas</span>
                </div>
              </div>
              {d.isInverted && (
                <p className="mt-2 text-xs text-escritorio opacity-70" title="Nunca=5, Sempre=1">
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
