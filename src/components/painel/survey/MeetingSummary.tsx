import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Maximize2, Minimize2, Printer, ThumbsDown, ThumbsUp } from 'lucide-react'
import { noiseFor, type ChoiceStat, type MeetingSummary as Summary, type OpenStat } from '@/data/resultados'
import { cn } from '@/lib/utils'
import { Button, pluralize } from '../ui'
import { MultiBlock, StackedBar, TextList, pctOf, segmentsOf } from './resultCharts'

const SAMPLE_SIZE = 3

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Uma página para a reunião do comitê: onde estamos bem, onde há alerta e o que as pessoas pedem.
 * Pode ir para a tela cheia (apresentar) ou para o papel/PDF (imprimir).
 */
export function MeetingSummary({ summary, title, period, partial }: { summary: Summary; title: string; period: string | null; partial: boolean }) {
  const ref = useRef<HTMLElement>(null)
  // Apresentação: o resumo ocupa a janela inteira; se o navegador permitir, vai também para a tela cheia.
  const [fullscreen, setFullscreen] = useState(false)
  // Falas sorteadas uma vez por abertura (sorteio, e não escolha, para não puxar a leitura para um lado).
  const voices = useMemo(() => summary.voices.map((v) => ({ stat: v, sample: shuffle(v.texts).slice(0, SAMPLE_SIZE) })), [summary.voices])
  const noise = noiseFor(summary.total)

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false)
    // Saiu da tela cheia do navegador (Esc ou F11): sai da apresentação também.
    const onChange = () => !document.fullscreenElement && setFullscreen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onChange)
    }
  }, [fullscreen])

  const toggleFullscreen = () => {
    if (fullscreen) {
      setFullscreen(false)
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
      return
    }
    setFullscreen(true)
    void document.documentElement.requestFullscreen?.().catch(() => {})
  }

  const print = () => {
    document.body.classList.add('imprimindo-resumo')
    const done = () => {
      document.body.classList.remove('imprimindo-resumo')
      window.removeEventListener('afterprint', done)
    }
    window.addEventListener('afterprint', done)
    window.print()
  }

  return (
    <section
      ref={ref}
      aria-label="Resumo para a reunião"
      className={cn('area-impressao space-y-8 bg-[var(--color-brand-50)]', fullscreen && 'fixed inset-0 z-[60] overflow-y-auto px-6 py-10 sm:px-16')}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-600)]">Resumo para a reunião</p>
          <h2 className={cn('mt-1 font-sans font-bold tracking-tight text-[var(--color-brand-900)]', fullscreen ? 'text-4xl' : 'text-2xl')}>{title}</h2>
          <p className="mt-1 text-sm text-[var(--color-brand-700)]">
            {pluralize(summary.total, 'resposta', 'respostas')}
            {period && ` · ${period}`}
            {partial && ' · resultados parciais (pesquisa aberta)'}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button type="button" variant="outline" size="sm" onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 /> : <Maximize2 />}
            {fullscreen ? 'Sair da apresentação' : 'Apresentar'}
          </Button>
          {!fullscreen && (
            <Button type="button" variant="outline" size="sm" onClick={print}>
              <Printer />
              Imprimir ou PDF
            </Button>
          )}
        </div>
      </header>

      {/* 1. Três números */}
      <div className="grid gap-3 sm:grid-cols-3">
        <BigNumber value={String(summary.total)} label="pessoas responderam" detail={period ?? undefined} />
        {summary.keyYesNo && (
          <BigNumber value={pctOf((summary.keyYesNo.counts.sim ?? 0) / (summary.keyYesNo.valid || 1))} label="responderam “Sim”" detail={`${summary.keyYesNo.n}. ${summary.keyYesNo.question.text}`} />
        )}
        {summary.keyIncidence && (
          <BigNumber
            value={pctOf(summary.keyIncidence.incidence)}
            label="disseram que aconteceu ao menos raramente"
            detail={`${summary.keyIncidence.n}. ${summary.keyIncidence.question.text}`}
            badge="quanto maior, pior"
          />
        )}
      </div>

      {/* 2. Fortes e atenção */}
      {summary.ranking.length >= 2 && (
        <div>
          <div className="grid gap-4 lg:grid-cols-2">
            <RankCard title="Pontos fortes" icon={<ThumbsUp className="h-4 w-4" />} items={summary.strengths} />
            <RankCard title="Pontos de atenção" icon={<ThumbsDown className="h-4 w-4" />} items={summary.attention} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--color-brand-600)]">
            Ordem pelo % que concorda (4 ou 5). Com {summary.total} respostas, cada pessoa vale cerca de {Math.round(noise.perPerson)} pontos percentuais e diferenças de até ~
            {Math.round(noise.margin)} pontos podem ser só variação.
            {summary.withinNoise && ' Aqui, a distância entre o melhor e o pior item cabe nessa margem: trate a ordem com cautela.'}
          </p>
        </div>
      )}

      {/* 3. Alertas */}
      {summary.alerts.length > 0 && (
        <Block title="Sinais de alerta" icon={<AlertTriangle className="h-4 w-4 text-[var(--color-error-700)]" />}>
          <ul className="divide-y divide-[var(--border)]">
            {summary.alerts.map((a, i) => (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm text-[var(--color-brand-900)]">
                  <span className="mr-1.5 font-semibold">{a.stat.n}.</span>
                  {a.stat.question.text}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--color-error-700)]">{a.text}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* 4. Panorama */}
      {summary.ranking.length > 0 && (
        <Block title="Panorama das escalas" description="Do item com mais concordância para o com menos.">
          <ul className="space-y-3">
            {summary.ranking.map((s) => (
              <li key={s.question.id} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_14rem_3.5rem]">
                <p className="line-clamp-2 text-sm leading-snug text-[var(--color-brand-900)]">
                  <span className="mr-1.5 font-semibold">{s.n}.</span>
                  {s.question.text}
                </p>
                <StackedBar segments={segmentsOf(s)} size="sm" />
                <p className="text-right font-sans text-lg font-bold tabular-nums text-[var(--color-brand-900)]">{pctOf(s.favorable)}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* 5. Prioridades */}
      {summary.priorities.map((p) => (
        <Block key={p.question.id} title="O que as pessoas priorizam" description={`${p.n}. ${p.question.text}${p.gate ? ` ${p.gate.replace('Só apareceu', 'Respondida só')}` : ''}`}>
          <MultiBlock stat={p} limit={5} />
        </Block>
      ))}

      {/* 6. Vozes */}
      {voices.map(({ stat, sample }) => (
        <VoiceBlock key={stat.question.id} stat={stat} sample={sample} />
      ))}
    </section>
  )
}

function BigNumber({ value, label, detail, badge }: { value: string; label: string; detail?: string; badge?: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-brand-200)] bg-white p-5">
      <p className="font-sans text-4xl font-bold tabular-nums tracking-tight text-[var(--color-brand-900)]">{value}</p>
      <p className="mt-1 text-sm font-medium text-[var(--color-brand-800)]">{label}</p>
      {badge && <span className="mt-2 inline-block rounded-full border border-[var(--color-error-500)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-error-700)]">{badge}</span>}
      {detail && <p className="mt-2 line-clamp-2 text-xs leading-snug text-[var(--color-brand-600)]">{detail}</p>}
    </div>
  )
}

function RankCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: ChoiceStat[] }) {
  return (
    <Block title={title} icon={icon}>
      <ol className="space-y-3">
        {items.map((s) => (
          <li key={s.question.id} className="flex items-start gap-3">
            <span className="w-12 shrink-0 font-sans text-xl font-bold tabular-nums text-[var(--color-brand-900)]">{pctOf(s.favorable)}</span>
            <p className="text-sm leading-snug text-[var(--color-brand-800)]">
              <span className="mr-1 font-semibold">{s.n}.</span>
              {s.question.text}
            </p>
          </li>
        ))}
      </ol>
    </Block>
  )
}

function VoiceBlock({ stat, sample }: { stat: OpenStat; sample: string[] }) {
  return (
    <Block
      title="Vozes"
      description={`${stat.n}. ${stat.question.text} ${sample.length} de ${stat.texts.length} respostas, sorteadas. Todas estão em “Todas as perguntas”.`}
    >
      <TextList texts={sample} max={SAMPLE_SIZE} />
    </Block>
  )
}

function Block({ title, description, icon, children }: { title: string; description?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-xl border border-[var(--color-brand-200)] bg-white p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-sans text-base font-semibold text-[var(--color-brand-900)]">
        {icon}
        {title}
      </h3>
      {description && <p className="mt-1 text-sm leading-relaxed text-[var(--color-brand-700)]">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}
