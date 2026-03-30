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
import { useRef, useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import type { DimensionSummary } from '../data/hseIt'
import { getRiskLevel, RISK_LEVELS } from '../data/riskLevels'

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
  /** Se true, mostra botão para copiar gráfico como imagem */
  showCopyChart?: boolean
}

function ordenarScores(scores: DimensionSummary[]): DimensionSummary[] {
  const byId = new Map(scores.map((s) => [s.dimensionId, s]))
  return ORDEM_DIMENSOES.map((id) => byId.get(id)).filter(
    (s): s is DimensionSummary => s != null
  )
}

function corPorMedia(media: number): string {
  return getRiskLevel(media).hex
}

export function GraficosResultados({ scores, showCopyChart = false }: Props) {
  const ordenados = ordenarScores(scores)
  const radarRef = useRef<HTMLDivElement>(null)
  const barrasRef = useRef<HTMLDivElement>(null)
  const [copying, setCopying] = useState<'radar' | 'barras' | null>(null)

  const copyChartAsImage = useCallback(async (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return
    try {
      // Pequena pausa para o gráfico SVG estar totalmente renderizado
      await new Promise((r) => setTimeout(r, 300))
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(ref.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#f7f9fc',
        logging: false,
        allowTaint: true,
        // Melhora captura de SVG (Recharts)
        foreignObjectRendering: false,
        imageTimeout: 0,
      })
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setCopying(null)
            return
          }
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ])
            setTimeout(() => setCopying(null), 2500)
          } catch {
            // Fallback: download da imagem se a área de transferência falhar (ex.: HTTP, permissão)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'grafico-diagnostico.png'
            a.click()
            URL.revokeObjectURL(url)
            setCopying(null)
            alert('A cópia para a área de transferência não está disponível. O gráfico foi baixado como imagem.')
          }
        },
        'image/png',
        1
      )
    } catch (err) {
      setCopying(null)
      console.error(err)
      alert('Não foi possível gerar a imagem do gráfico. Tente em outro navegador ou use HTTPS.')
    }
  }, [])

  const handleCopyRadar = () => {
    setCopying('radar')
    copyChartAsImage(radarRef)
  }
  const handleCopyBarras = () => {
    setCopying('barras')
    copyChartAsImage(barrasRef)
  }

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
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div ref={radarRef} className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-escritorio">
              Perfil por dimensão (radar)
            </h3>
            <p className="mt-1 text-sm text-escritorio opacity-80">
              Quanto mais próximo de 5, melhor a dimensão. Escala 1–5.
            </p>
            <div className="mt-4 h-[320px] w-full sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dadosRadar} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <PolarGrid stroke="rgba(4,12,30,0.14)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#040c1e', fontSize: 11 }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: '#040c1e', fontSize: 10 }}
              />
              <Radar
                name="Média"
                dataKey="media"
                stroke="#5b88b2"
                fill="#5b88b2"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid rgba(4,12,30,0.1)',
                  background: '#f7f9fc',
                  color: '#040c1e',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                }}
                formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : '–', 'Média']}
                labelFormatter={(label) => label}
              />
            </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {showCopyChart && (
            <button
              type="button"
              onClick={handleCopyRadar}
              disabled={copying === 'radar'}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {copying === 'radar' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copying === 'radar' ? 'Copiado!' : 'Copiar gráfico'}
            </button>
          )}
        </div>
      </div>

      {/* Barras horizontais: priorização (menor média = mais atenção) */}
      <div className="bg-card-escritorio rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div ref={barrasRef} className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-escritorio">
              Médias por dimensão (priorização)
            </h3>
            <p className="mt-1 text-sm text-escritorio opacity-80">
              Dimensões com média menor exigem mais atenção. Linha de referência: 3.
            </p>
            <div className="mt-4 h-[320px] w-full sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosBarras}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(4,12,30,0.12)" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: '#040c1e', fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="dimensao"
                    width={75}
                    tick={{ fill: '#040c1e', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid rgba(4,12,30,0.1)',
                      background: '#f7f9fc',
                      color: '#040c1e',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                    }}
                    formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : '–', 'Média']}
                    cursor={{ fill: 'rgba(91,136,178,0.14)' }}
                  />
                  <ReferenceLine x={3} stroke="#5b88b2" strokeDasharray="4 4" />
                  <Bar dataKey="media" name="Média" radius={[0, 4, 4, 0]} maxBarSize={32}>
                    {dadosBarras.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-700">
              {RISK_LEVELS.map((level) => (
                <span key={level.key} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10 shadow-sm"
                    style={{ background: level.hex }}
                  />
                  {level.legendCaption}
                </span>
              ))}
            </div>
          </div>
          {showCopyChart && (
            <button
              type="button"
              onClick={handleCopyBarras}
              disabled={copying === 'barras'}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {copying === 'barras' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copying === 'barras' ? 'Copiado!' : 'Copiar gráfico'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
