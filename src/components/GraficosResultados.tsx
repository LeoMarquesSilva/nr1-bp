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
import { useRef, useState, useCallback, type ReactNode, type RefObject } from 'react'
import { Download, Loader2 } from 'lucide-react'
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

const CHART_SHELL_CLASS =
  'relative mt-4 h-[320px] w-full min-h-[320px] min-w-0 sm:h-[360px] sm:min-h-[360px]'

type Props = {
  scores: DimensionSummary[]
  /** Se true, mostra botão para baixar o gráfico como PNG */
  showDownloadChart?: boolean
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function GraficosResultados({ scores, showDownloadChart = false }: Props) {
  const ordenados = ordenarScores(scores)
  const radarRef = useRef<HTMLDivElement>(null)
  const barrasRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState<'radar' | 'barras' | null>(null)

  const downloadChartAsPng = useCallback(async (ref: RefObject<HTMLDivElement | null>, filename: string) => {
    const el = ref.current
    if (!el) return

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
      await new Promise((r) => setTimeout(r, 250))

      // html2canvas não rasteriza bem SVG (Recharts); html-to-image usa caminho via SVG/canvas adequado.
      const { toBlob } = await import('html-to-image')
      const blob = await toBlob(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f8fafc',
      })

      if (!blob) {
        throw new Error('Falha ao gerar PNG do gráfico.')
      }

      downloadBlob(blob, filename)
    } catch (err) {
      console.error(err)
      alert(
        'Não foi possível gerar a imagem do gráfico. Tente outro navegador, use HTTPS (ou localhost) ou use captura de tela.'
      )
    } finally {
      setExporting(null)
    }
  }, [])

  const handleDownloadRadar = () => {
    setExporting('radar')
    void downloadChartAsPng(radarRef, 'grafico-radar-diagnostico.png')
  }

  const handleDownloadBarras = () => {
    setExporting('barras')
    void downloadChartAsPng(barrasRef, 'grafico-barras-diagnostico.png')
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

  const responsiveWrap = (chart: ReactNode) => (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280} debounce={50}>
      {chart}
    </ResponsiveContainer>
  )

  return (
    <div className="w-full min-w-0 space-y-8">
      {/* Radar: perfil das 7 dimensões (padrão HSE) */}
      <div className="bg-card-escritorio w-full min-w-0 rounded-2xl p-6 shadow-sm">
        <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div ref={radarRef} className="min-w-0 w-full sm:flex-1 sm:basis-0">
            <h3 className="text-lg font-semibold text-escritorio">
              Perfil por dimensão (radar)
            </h3>
            <p className="mt-1 text-sm text-escritorio opacity-80">
              Quanto mais próximo de 5, melhor a dimensão. Escala 1–5.
            </p>
            <div className={CHART_SHELL_CLASS}>
              {responsiveWrap(
                <RadarChart data={dadosRadar} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <PolarGrid stroke="rgba(4,12,30,0.14)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#040c1e', fontSize: 11 }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#040c1e', fontSize: 10 }} />
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
              )}
            </div>
          </div>
          {showDownloadChart && (
            <button
              type="button"
              onClick={handleDownloadRadar}
              disabled={exporting === 'radar'}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {exporting === 'radar' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting === 'radar' ? 'Gerando…' : 'Baixar imagem'}
            </button>
          )}
        </div>
      </div>

      {/* Barras horizontais: priorização (menor média = mais atenção) */}
      <div className="bg-card-escritorio w-full min-w-0 rounded-2xl p-6 shadow-sm">
        <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div ref={barrasRef} className="min-w-0 w-full sm:flex-1 sm:basis-0">
            <h3 className="text-lg font-semibold text-escritorio">
              Médias por dimensão (priorização)
            </h3>
            <p className="mt-1 text-sm text-escritorio opacity-80">
              Dimensões com média menor exigem mais atenção. Linha de referência: 3.
            </p>
            <div className={CHART_SHELL_CLASS}>
              {responsiveWrap(
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
              )}
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
          {showDownloadChart && (
            <button
              type="button"
              onClick={handleDownloadBarras}
              disabled={exporting === 'barras'}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {exporting === 'barras' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting === 'barras' ? 'Gerando…' : 'Baixar imagem'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
