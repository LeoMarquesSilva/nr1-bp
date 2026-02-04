import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts'
import type { DimensionSummary } from '../data/hseIt'

/** Ordem fixa das dimensões para gráficos (HSE-IT) */
const ORDEM_DIMENSOES = [
  'demandas',
  'controle',
  'apoio_chefia',
  'apoio_colega',
  'relacionamentos',
  'cargo_papel',
  'comunicacao_mudancas',
] as const

/** Nomes curtos para o radar (evitar sobreposição) */
const NOMES_CURTOS: Record<string, string> = {
  demandas: 'Demandas',
  controle: 'Controle',
  apoio_chefia: 'Apoio chefia',
  apoio_colega: 'Apoio colegas',
  relacionamentos: 'Relacionamentos',
  cargo_papel: 'Cargo / Papel',
  comunicacao_mudancas: 'Comunicação',
}

type Props = {
  scores: DimensionSummary[]
}

function ordenarScores(scores: DimensionSummary[]): DimensionSummary[] {
  const byId = new Map(scores.map((s) => [s.dimensionId, s]))
  return ORDEM_DIMENSOES.map((id) => byId.get(id)).filter(
    (s): s is DimensionSummary => s != null
  )
}

function corPorMedia(media: number): string {
  if (media >= 4) return '#059669' // ok
  if (media >= 3) return '#D5B170' // dourado (média)
  return '#dc2626' // atenção
}

export function GraficosResultados({ scores }: Props) {
  const ordenados = ordenarScores(scores)

  const dadosRadar = ordenados.map((d) => ({
    subject: NOMES_CURTOS[d.dimensionId] ?? d.dimensionLabel,
    media: d.average,
    fullMark: 5,
  }))

  const dadosBarras = ordenados.map((d) => ({
    dimensao: NOMES_CURTOS[d.dimensionId] ?? d.dimensionLabel,
    media: d.average,
    cor: corPorMedia(d.average),
  }))

  return (
    <div className="space-y-8">
      {/* Radar: perfil das 7 dimensões (padrão HSE) */}
      <div className="bg-card-escritorio rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-escritorio">
          Perfil por dimensão (radar)
        </h3>
        <p className="mb-4 text-sm text-escritorio opacity-80">
          Quanto mais próximo de 5, melhor a dimensão. Escala 1–5.
        </p>
        <div className="h-[320px] w-full sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={dadosRadar} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <PolarGrid stroke="rgba(16,31,46,0.15)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#101F2E', fontSize: 11 }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: '#101F2E', fontSize: 10 }}
              />
              <Radar
                name="Média"
                dataKey="media"
                stroke="#D5B170"
                fill="#D5B170"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid rgba(16,31,46,0.1)',
                  background: '#FAFBFB',
                  color: '#101F2E',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                }}
                formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : '–', 'Média']}
                labelFormatter={(label) => label}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Barras horizontais: priorização (menor média = mais atenção) */}
      <div className="bg-card-escritorio rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-escritorio">
          Médias por dimensão (priorização)
        </h3>
        <p className="mb-4 text-sm text-escritorio opacity-80">
          Dimensões com média menor exigem mais atenção. Linha de referência: 3.
        </p>
        <div className="h-[320px] w-full sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosBarras}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,31,46,0.12)" />
              <XAxis type="number" domain={[0, 5]} tick={{ fill: '#101F2E', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="dimensao"
                width={75}
                tick={{ fill: '#101F2E', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid rgba(16,31,46,0.1)',
                  background: '#FAFBFB',
                  color: '#101F2E',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                }}
                formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : '–', 'Média']}
                cursor={{ fill: 'rgba(213,177,112,0.12)' }}
              />
              <ReferenceLine x={3} stroke="#D5B170" strokeDasharray="4 4" />
              <Bar dataKey="media" name="Média" radius={[0, 4, 4, 0]} maxBarSize={32}>
                {dadosBarras.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-escritorio opacity-80">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500" /> Baixa atenção (≥4)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ background: '#D5B170' }} /> Média (3–4)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" /> Alta / Urgente (&lt;3)
          </span>
        </div>
      </div>
    </div>
  )
}
