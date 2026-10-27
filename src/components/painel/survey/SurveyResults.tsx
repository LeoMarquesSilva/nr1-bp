import { useMemo, useState } from 'react'
import { FileSpreadsheet, Loader2, Lock, Table2, Trash2, Users } from 'lucide-react'
import { feedback } from '@/lib/feedback'
import { ESCALA_OPTIONS, NR_OPTION, type SurveyQuestion } from '@/data/pesquisas'
import { buildMeetingSummary, computeStats, noiseFor, resultsGate, type ChoiceStat, type OpenStat, type QuestionStat } from '@/data/resultados'
import type { SurveyResponse, SurveyStatus } from '@/types/pesquisas'
import { cn } from '@/lib/utils'
import { Button, EmptyState, Notice, Panel, formatDayBR, pluralize } from '../ui'
import { MeetingSummary } from './MeetingSummary'
import { FavorableRow, FrequencyBlock, HiddenNote, Legend, MultiBlock, TextList, YesNoBlock, formatMean, pctOf, segmentsOf } from './resultCharts'

type View = 'resumo' | 'perguntas'

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function SurveyResults({
  questions,
  responses,
  minResponses,
  status,
  title,
  companyName,
  onDeleteAll,
  onExported,
}: {
  questions: SurveyQuestion[]
  responses: SurveyResponse[]
  minResponses: number
  status: SurveyStatus
  title: string
  companyName: string
  onDeleteAll?: () => void
  onExported?: () => void
}) {
  const [view, setView] = useState<View>('resumo')
  const [exporting, setExporting] = useState(false)
  const answers = useMemo(() => responses.map((r) => r.answers), [responses])
  const stats = useMemo(() => computeStats(questions, answers, minResponses), [questions, answers, minResponses])
  const summary = useMemo(() => buildMeetingSummary(stats, answers.length), [stats, answers.length])

  const total = responses.length
  const days = responses.map((r) => r.submittedOn).sort()
  const period = days.length > 0 ? (days[0] === days[days.length - 1] ? formatDayBR(days[0]) : `de ${formatDayBR(days[0])} a ${formatDayBR(days[days.length - 1])}`) : null
  const gate = resultsGate(status, total, minResponses)

  // A biblioteca de Excel só é carregada no clique (fica fora do pacote do painel).
  const exportar = async () => {
    setExporting(true)
    try {
      const { buildSurveyWorkbook, exportFileName } = await import('@/lib/excel/exportarPesquisa')
      const bytes = await buildSurveyWorkbook({ title, companyName, status, period, minResponses, questions, answers })
      const blob = new Blob([bytes as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = exportFileName(title)
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      onExported?.()
      feedback.success('Planilha gerada. As tabelas dinâmicas são montadas ao abrir no Excel.')
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível gerar a planilha.')
    } finally {
      setExporting(false)
    }
  }

  if (total === 0) {
    return (
      <Panel>
        <EmptyState icon={<Users className="h-6 w-6" />} title="Nenhuma resposta ainda" description="Os resultados aparecem aqui depois que as pessoas responderem pelo link." />
      </Panel>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="flex items-center gap-2 text-sm text-[var(--color-brand-700)]">
          <Users className="h-4 w-4" aria-hidden />
          <span>
            <strong className="text-[var(--color-brand-900)]">{pluralize(total, 'resposta', 'respostas')}</strong>
            {period && ` · ${period}`}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {gate.state === 'liberado' && (
            <Button type="button" variant="outline" size="sm" onClick={exportar} disabled={exporting}>
              {exporting ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
              Exportar para Excel
            </Button>
          )}
          {onDeleteAll && (
            <Button type="button" variant="ghost" size="sm" onClick={onDeleteAll}>
              <Trash2 />
              Apagar respostas
            </Button>
          )}
        </div>
      </div>

      {gate.state === 'poucas' ? (
        <Panel>
          <EmptyState
            icon={<Lock className="h-6 w-6" />}
            title={`${gate.total} de ${gate.min} respostas necessárias`}
            description={`Os resultados aparecem a partir de ${gate.min} respostas. Com menos que isso, seria possível deduzir quem respondeu o quê.`}
          />
        </Panel>
      ) : (
        <>
          {gate.partial && (
            <div className="print:hidden">
              <Notice tone="info">Pesquisa aberta: resultados parciais, que mudam conforme novas respostas chegam.</Notice>
            </div>
          )}

          <div role="tablist" aria-label="Como ver os resultados" className="inline-flex rounded-lg border border-[var(--color-brand-200)] bg-white p-1 print:hidden">
            {(
              [
                ['resumo', 'Resumo da reunião'],
                ['perguntas', 'Todas as perguntas'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={cn(
                  'rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                  view === key ? 'bg-[var(--color-brand-900)] text-white' : 'text-[var(--color-brand-700)] hover:text-[var(--color-brand-900)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {view === 'resumo' ? (
            <MeetingSummary summary={summary} title={title} period={period} partial={gate.partial} />
          ) : (
            <AllQuestions stats={stats} total={total} min={minResponses} />
          )}
        </>
      )}
    </div>
  )
}

function AllQuestions({ stats, total, min }: { stats: QuestionStat[]; total: number; min: number }) {
  const [order, setOrder] = useState<'favoravel' | 'pesquisa'>('favoravel')
  const [showTable, setShowTable] = useState(false)
  const scales = stats.filter((s): s is ChoiceStat => s.kind === 'escolha' && s.question.type === 'escala')
  const sortedScales = order === 'pesquisa' ? scales : [...scales].sort((a, b) => Number(a.hidden) - Number(b.hidden) || (b.favorable ?? 0) - (a.favorable ?? 0))
  const others = stats.filter((s) => !(s.kind === 'escolha' && s.question.type === 'escala'))
  // Textos em ordem aleatória (cada pergunta embaralhada à parte): a ordem de chegada poderia ajudar a identificar quem escreveu.
  const shuffled = useMemo(() => Object.fromEntries(stats.filter((s): s is OpenStat => s.kind === 'aberta').map((s) => [s.question.id, shuffle(s.texts)])), [stats])
  const noise = noiseFor(total)

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-[var(--color-brand-700)]">
        Com {pluralize(total, 'resposta', 'respostas')}, cada pessoa vale cerca de {Math.round(noise.perPerson)} pontos percentuais. Diferenças de até ~{Math.round(noise.margin)} pontos entre
        perguntas podem ser só variação.
      </p>

      {scales.length > 0 && (
        <Panel
          title="Escalas de 1 a 5"
          description="O número em destaque é o % que concorda (4 ou 5). A barra mostra todas as respostas; “Prefiro não responder” fica fora da conta."
          actions={
            <>
              <label className="flex items-center gap-2 text-sm text-[var(--color-brand-700)]">
                Ordem
                <select value={order} onChange={(e) => setOrder(e.target.value as typeof order)} className="rounded-md border border-[var(--input-border)] bg-white px-2 py-1 text-sm">
                  <option value="favoravel">Mais concordância primeiro</option>
                  <option value="pesquisa">Ordem da pesquisa</option>
                </select>
              </label>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowTable((v) => !v)} aria-pressed={showTable}>
                <Table2 />
                {showTable ? 'Ver gráfico' : 'Ver tabela'}
              </Button>
            </>
          }
        >
          {showTable ? (
            <ScaleTable rows={sortedScales} min={min} />
          ) : (
            <>
              <div className="mb-5">
                <Legend segments={segmentsOf(scales[0])} />
              </div>
              <ul className="space-y-6">
                {sortedScales.map((s) => (
                  <FavorableRow key={s.question.id} stat={s} min={min} />
                ))}
              </ul>
            </>
          )}
        </Panel>
      )}

      {others.map((s) => (
        <QuestionPanel key={s.question.id} stat={s}>
          {s.hidden ? (
            <HiddenNote>{hiddenText(s, min)}</HiddenNote>
          ) : s.kind === 'multipla' ? (
            <MultiBlock stat={s} />
          ) : s.kind === 'aberta' ? (
            <>
              <p className="mb-3 text-xs leading-relaxed text-[var(--color-brand-600)]">
                {s.texts.length} de {pluralize(s.reached, 'pessoa escreveu', 'pessoas escreveram')}. Ordem aleatória. Antes de mostrar na reunião, leia: um texto pode trazer detalhes que
                identificam alguém.
              </p>
              <TextList texts={shuffled[s.question.id] ?? []} />
            </>
          ) : s.question.type === 'sim_nao' ? (
            <YesNoBlock stat={s} />
          ) : (
            <FrequencyBlock stat={s} />
          )}
        </QuestionPanel>
      ))}
    </div>
  )
}

function hiddenText(s: QuestionStat, min: number): string {
  if (s.kind === 'aberta' && s.hiddenReason === 'pesquisa') return 'Os textos aparecem a partir de 10 respostas na pesquisa, para proteger o anonimato.'
  if (s.gate) return `Oculta: menos de ${min} pessoas chegaram a esta pergunta.`
  return `Oculta: menos de ${min} respostas nesta pergunta.`
}

function QuestionPanel({ stat, children }: { stat: QuestionStat; children: React.ReactNode }) {
  // Base no título: quem chegou à pergunta, quando há ramificação antes dela (sem número quando está oculta).
  const base = stat.gate ? (stat.hidden ? stat.gate : `${stat.gate.replace(/\.$/, '')}: ${pluralize(stat.reached, 'pessoa', 'pessoas')}.`) : null
  return (
    <Panel>
      <p className="flex items-start gap-3 font-medium leading-snug text-[var(--color-brand-900)]">
        <span className="w-6 shrink-0 text-right font-semibold tabular-nums text-[var(--color-brand-500)]">{stat.n}.</span>
        <span>{stat.question.text}</span>
      </p>
      {base && <p className="mt-1.5 pl-9 text-xs font-medium text-[var(--color-brand-700)]">{base}</p>}
      <div className="mt-4 sm:pl-9">{children}</div>
    </Panel>
  )
}

function ScaleTable({ rows, min }: { rows: ChoiceStat[]; min: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-xs text-[var(--color-brand-600)]">
            <th scope="col" className="py-2 pr-3 font-medium">Pergunta</th>
            <th scope="col" className="px-2 py-2 text-right font-medium">Concordam</th>
            {ESCALA_OPTIONS.map((o) => (
              <th key={o.key} scope="col" className="px-2 py-2 text-right font-medium" title={o.hint}>
                {o.label}
              </th>
            ))}
            <th scope="col" className="px-2 py-2 text-right font-medium">{NR_OPTION.label}</th>
            <th scope="col" className="py-2 pl-2 text-right font-medium">Média</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.question.id} className="border-b border-[var(--border)] align-top last:border-0">
              <td className="py-2.5 pr-3 text-[var(--color-brand-800)]">
                <span className="mr-1.5 font-semibold">{s.n}.</span>
                {s.question.text}
              </td>
              {s.hidden ? (
                <td colSpan={ESCALA_OPTIONS.length + 3} className="px-2 py-2.5 text-right text-[var(--color-brand-600)]">
                  Oculta (menos de {min} respostas)
                </td>
              ) : (
                <>
                  <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-[var(--color-brand-900)]">{pctOf(s.favorable)}</td>
                  {ESCALA_OPTIONS.map((o) => (
                    <td key={o.key} className="px-2 py-2.5 text-right tabular-nums text-[var(--color-brand-800)]">
                      {s.counts[o.key] ?? 0}
                    </td>
                  ))}
                  <td className="px-2 py-2.5 text-right tabular-nums text-[var(--color-brand-600)]">{s.nr}</td>
                  <td className="py-2.5 pl-2 text-right tabular-nums text-[var(--color-brand-800)]">{formatMean(s.mean)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
