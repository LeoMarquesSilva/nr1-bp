import { ArrowDownRight, ArrowRight, ArrowUpRight, EyeOff, MessageSquareText } from 'lucide-react'
import { ESCALA_OPTIONS, FREQUENCIA_OPTIONS, NOTA_OPTIONS, SCALE_PRESETS, SIM_NAO_OPTIONS, hasScaleLabels, type SurveyQuestion } from '@/data/pesquisas'
import type { BaselineStat, ChoiceStat, Criticity, MultiStat, Trend } from '@/data/resultados'
import { cn } from '@/lib/utils'
import { pluralize } from '../ui'

/**
 * Cores com significado fixo (seguras para daltonismo: azul x vermelho, nunca vermelho x verde).
 * Lado bom em azul, lado ruim em vermelho, meio em cinza visível; texto escrito em todas as barras.
 */
const GOOD_STRONG = '#256abf'
const GOOD_SOFT = '#86b6ef'
const NEUTRAL = '#c4c1b6'
const BAD_SOFT = '#ee8f8d'
const BAD_STRONG = '#c63c3b'

const LIKERT_COLORS: Record<string, string> = { '1': BAD_STRONG, '2': BAD_SOFT, '3': NEUTRAL, '4': GOOD_SOFT, '5': GOOD_STRONG }
/** Frequência em que ocorrer é ruim: "Nunca" é o lado bom. */
const FREQ_NEGATIVE_COLORS: Record<string, string> = { nunca: GOOD_STRONG, raramente: '#f4b9b7', as_vezes: BAD_SOFT, frequentemente: BAD_STRONG }
/** Frequência sem juízo: tons de uma cor só. */
const FREQ_NEUTRAL_COLORS: Record<string, string> = { nunca: '#dbe6f3', raramente: '#a9c3e2', as_vezes: '#5f8fc9', frequentemente: '#2c5c97' }
const YES_NO_COLORS: Record<string, string> = { sim: 'var(--color-brand-700)', nao: 'var(--color-brand-300)' }
const DARK_TEXT = new Set([GOOD_SOFT, NEUTRAL, BAD_SOFT, '#f4b9b7', '#dbe6f3', '#a9c3e2', 'var(--color-brand-300)'])

export const LIKERT_LABELS: Record<string, string> = { '1': '1 · Discordo totalmente', '2': '2', '3': '3', '4': '4', '5': '5 · Concordo totalmente' }

export const pctOf = (x: number | null | undefined) => `${Math.round((x ?? 0) * 100)}%`

export function formatMean(mean: number | null): string {
  return mean == null ? '—' : mean.toFixed(1).replace('.', ',')
}

type Segment = { key: string; label: string; count: number; share: number; color: string }

/** Segmentos de uma pergunta de escolha única (escala, frequência, sim/não), na ordem das opções. */
export function segmentsOf(stat: ChoiceStat): Segment[] {
  const q = stat.question
  const opts = q.type === 'escala' ? ESCALA_OPTIONS : q.type === 'frequencia' ? FREQUENCIA_OPTIONS : SIM_NAO_OPTIONS
  const colors = q.type === 'escala' ? LIKERT_COLORS : q.type === 'frequencia' ? (q.canalHint ? FREQ_NEGATIVE_COLORS : FREQ_NEUTRAL_COLORS) : YES_NO_COLORS
  return opts.map((o, i) => {
    const count = stat.counts[o.key] ?? 0
    const label = q.type === 'escala' ? (hasScaleLabels(q) ? q.labels[i] : LIKERT_LABELS[o.key]) : o.label
    return { key: o.key, label, count, share: stat.valid ? count / stat.valid : 0, color: colors[o.key] }
  })
}

const AGREEMENT = SCALE_PRESETS.find((p) => p.id === 'concordancia')?.labels?.join('|')

/** Palavras do % favorável: "concordam" na escala de concordância; "boa ou excelente" etc. nas outras. */
export function scaleWords(q: SurveyQuestion): { favorable: string; unfavorable: string; neutral: string } {
  if (!hasScaleLabels(q) || q.labels.join('|') === AGREEMENT) return { favorable: 'concordam', unfavorable: 'Discordam', neutral: 'Neutros' }
  return { favorable: `${q.labels[3]} ou ${q.labels[4]}`.toLowerCase(), unfavorable: 'Desfavoráveis', neutral: 'Neutros' }
}

const TREND_STYLE: Record<Trend, { label: string; cls: string; Icon: typeof ArrowUpRight }> = {
  subiu: { label: 'subiu', cls: 'text-[var(--color-success-700)]', Icon: ArrowUpRight },
  caiu: { label: 'caiu', cls: 'text-[var(--color-error-700)]', Icon: ArrowDownRight },
  estavel: { label: 'estável (dentro da margem)', cls: 'text-[var(--color-brand-600)]', Icon: ArrowRight },
}

/** "Antes 58% · +7 p.p. subiu" (ou a média, nas notas). */
export function BaselineNote({ now, before, mean }: { now: number | null; before: BaselineStat; mean?: boolean }) {
  if (mean) {
    if (before.mean == null) return null
    return (
      <p className="mt-1 text-xs text-[var(--color-brand-600)]">
        {before.label}: média <strong className="text-[var(--color-brand-900)]">{formatMean(before.mean)}</strong> ({before.total} respostas)
      </p>
    )
  }
  if (before.favorable == null || now == null) return null
  const diff = Math.round((now - before.favorable) * 100)
  const t = before.trend ? TREND_STYLE[before.trend] : null
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-[var(--color-brand-600)]">
      {before.label}: <strong className="text-[var(--color-brand-900)]">{pctOf(before.favorable)}</strong>
      <span aria-hidden>·</span>
      <span className={cn('inline-flex items-center gap-0.5 font-semibold', t?.cls)}>
        {t && <t.Icon className="h-3.5 w-3.5" aria-hidden />}
        {diff > 0 ? `+${diff}` : diff} p.p. {t?.label}
      </span>
    </p>
  )
}

const CRITICITY_STYLE: Record<Criticity, { label: string; cls: string }> = {
  critico: { label: 'Crítico', cls: 'border-[var(--color-error-500)] text-[var(--color-error-700)]' },
  atencao: { label: 'Atenção', cls: 'border-[var(--color-warning-500)] text-[var(--color-warning-700)]' },
  bom: { label: 'Bom', cls: 'border-[var(--color-success-500)] text-[var(--color-success-700)]' },
}

export function CriticityPill({ value }: { value: Criticity }) {
  const s = CRITICITY_STYLE[value]
  return <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', s.cls)}>{s.label}</span>
}

/** Nota de 0 a 10: média em destaque e distribuição em colunas. */
export function NotaBlock({ stat }: { stat: ChoiceStat }) {
  const max = Math.max(1, ...NOTA_OPTIONS.map((o) => stat.counts[o.key] ?? 0))
  return (
    <div>
      <p className="mb-4 flex flex-wrap items-baseline gap-x-3">
        <span className="font-sans text-3xl font-bold tabular-nums text-[var(--color-brand-900)]">{formatMean(stat.mean)}</span>
        <span className="text-sm text-[var(--color-brand-800)]">média de 0 a 10 · {pluralize(stat.valid, 'resposta', 'respostas')}</span>
      </p>
      <div className="flex h-28 items-end gap-1" role="img" aria-label={NOTA_OPTIONS.map((o) => `${o.label}: ${stat.counts[o.key] ?? 0}`).join('; ')}>
        {NOTA_OPTIONS.map((o) => {
          const c = stat.counts[o.key] ?? 0
          return (
            <div key={o.key} className="flex flex-1 flex-col items-center gap-1" title={`Nota ${o.label}: ${c}`}>
              <span className="text-[10px] tabular-nums text-[var(--color-brand-600)]">{c > 0 ? c : ''}</span>
              <div className="w-full rounded-t-sm bg-[var(--color-brand-700)]" style={{ height: `${(c / max) * 80}px`, minHeight: c > 0 ? 3 : 0 }} />
              <span className="text-[11px] tabular-nums text-[var(--color-brand-700)]">{o.label}</span>
            </div>
          )
        })}
      </div>
      {stat.baseline && <BaselineNote now={stat.mean} before={stat.baseline} mean />}
    </div>
  )
}

/** Barra 100% empilhada: o cinza do meio fica visível e cada segmento largo o bastante leva o percentual escrito. */
export function StackedBar({ segments, size = 'md' }: { segments: Segment[]; size?: 'sm' | 'md' }) {
  const described = segments.filter((s) => s.count > 0).map((s) => `${s.label}: ${s.count} (${pctOf(s.share)})`).join('; ')
  return (
    <div className={cn('flex w-full overflow-hidden rounded-md', size === 'sm' ? 'h-4' : 'h-8')} role="img" aria-label={described}>
      {segments.map(
        (s) =>
          s.share > 0 && (
            <div
              key={s.key}
              title={`${s.label}: ${s.count} (${pctOf(s.share)})`}
              className={cn('flex items-center justify-center border-r-2 border-white text-xs font-semibold tabular-nums last:border-r-0', DARK_TEXT.has(s.color) ? 'text-[var(--color-brand-900)]' : 'text-white')}
              style={{ width: `${s.share * 100}%`, background: s.color }}
            >
              {size === 'md' && s.share >= 0.07 ? pctOf(s.share) : null}
            </div>
          )
      )}
    </div>
  )
}

export function Legend({ segments }: { segments: Segment[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--color-brand-700)]">
      {segments.map((s) => (
        <li key={s.key} className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px]" style={{ background: s.color }} aria-hidden />
          {s.label}
        </li>
      ))}
    </ul>
  )
}

/** Linha de uma escala: pergunta, % favorável em destaque, distribuição completa e a base. */
export function FavorableRow({ stat, min }: { stat: ChoiceStat; min: number }) {
  const words = scaleWords(stat.question)
  return (
    <li>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-snug text-[var(--color-brand-900)]">
          <span className="mr-1.5 font-semibold">{stat.n}.</span>
          {stat.question.text}
        </p>
        {!stat.hidden && (
          <p className="shrink-0 text-right leading-none">
            <span className="font-sans text-2xl font-bold tabular-nums text-[var(--color-brand-900)]">{pctOf(stat.favorable)}</span>
            <span className="mt-1 block max-w-[8rem] text-[11px] leading-tight text-[var(--color-brand-600)]">{words.favorable}</span>
          </p>
        )}
      </div>
      {stat.hidden ? (
        <HiddenNote>Oculta: menos de {min} respostas válidas nesta pergunta.</HiddenNote>
      ) : (
        <>
          <div className="mt-2">
            <StackedBar segments={segmentsOf(stat)} />
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-brand-600)]">
            {words.unfavorable} {pctOf(stat.unfavorable)} · {words.neutral} {pctOf(stat.neutral)} · {pluralize(stat.valid, 'resposta', 'respostas')}
            {stat.nr > 0 && ` · ${stat.nr} ${stat.nr > 1 ? 'preferiram' : 'preferiu'} não responder`} · média {formatMean(stat.mean)}
          </p>
          {stat.baseline && <BaselineNote now={stat.favorable} before={stat.baseline} />}
        </>
      )}
    </li>
  )
}

/** Pergunta de frequência: incidência em destaque quando ocorrer é ruim; distribuição completa nos dois casos. */
export function FrequencyBlock({ stat }: { stat: ChoiceStat }) {
  const negative = stat.incidence != null
  const segments = segmentsOf(stat)
  return (
    <div>
      {negative && (
        <p className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-sans text-3xl font-bold tabular-nums text-[var(--color-brand-900)]">{pctOf(stat.incidence)}</span>
          <span className="text-sm text-[var(--color-brand-800)]">disseram que aconteceu ao menos raramente</span>
          <span className="rounded-full border border-[var(--color-error-500)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-error-700)]">quanto maior, pior</span>
        </p>
      )}
      <StackedBar segments={segments} />
      <div className="mt-2.5">
        <Legend segments={segments} />
      </div>
      <p className="mt-2 text-xs text-[var(--color-brand-600)]">
        {pluralize(stat.valid, 'resposta', 'respostas')}
        {stat.nr > 0 && ` · ${stat.nr} ${stat.nr > 1 ? 'preferiram' : 'preferiu'} não responder`}
      </p>
    </div>
  )
}

/** Sim ou não: número em destaque, em cores neutras (não é "bom" nem "ruim"). */
export function YesNoBlock({ stat }: { stat: ChoiceStat }) {
  const segments = segmentsOf(stat)
  const sim = segments.find((s) => s.key === 'sim')
  return (
    <div>
      <p className="mb-3 flex flex-wrap items-baseline gap-x-3">
        <span className="font-sans text-3xl font-bold tabular-nums text-[var(--color-brand-900)]">{pctOf(sim?.share)}</span>
        <span className="text-sm text-[var(--color-brand-800)]">responderam “Sim”</span>
      </p>
      <StackedBar segments={segments} />
      <p className="mt-2 text-xs text-[var(--color-brand-600)]">
        {segments.map((s) => `${s.label}: ${s.count}`).join(' · ')}
        {stat.question.endIf && ` · quem respondeu “${stat.question.endIf === 'nao' ? 'Não' : 'Sim'}” encerrou a pesquisa aqui`}
      </p>
    </div>
  )
}

/** Múltipla escolha: % de quem respondeu (a soma passa de 100%); "Outros" por último, sem os textos. */
export function MultiBlock({ stat, limit }: { stat: MultiStat; limit?: number }) {
  const max = stat.question.maxSelections ?? 1
  const items = limit ? stat.options.filter((o) => o.count > 0).slice(0, limit) : stat.options
  return (
    <div>
      <ul className="space-y-3">
        {items.map((o) => (
          <li key={o.key}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-[var(--color-brand-800)]">{o.label}</span>
              <span className="shrink-0 tabular-nums text-[var(--color-brand-600)]">
                {o.count} · <span className="font-semibold text-[var(--color-brand-900)]">{pctOf(o.share)}</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--color-brand-100)]">
              <div className="h-full rounded-full bg-[var(--color-brand-700)]" style={{ width: `${o.share * 100}%`, minWidth: o.count > 0 ? '6px' : 0 }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-[var(--color-brand-600)]">
        Percentuais sobre {pluralize(stat.respondents, 'pessoa', 'pessoas')}.{max > 1 && ` Cada pessoa pôde escolher até ${max}, por isso a soma passa de 100%.`}
        {stat.otherCount > 0 && ` ${stat.otherCount} ${stat.otherCount > 1 ? 'escreveram' : 'escreveu'} em “Outros”; esses textos não aparecem aqui, para proteger o anonimato.`}
      </p>
    </div>
  )
}

export function TextList({ texts, max }: { texts: string[]; max?: number }) {
  const shown = max ? texts.slice(0, max) : texts
  return (
    <ul className={cn('space-y-2', !max && 'max-h-[28rem] overflow-y-auto pr-2 [scrollbar-color:var(--color-brand-300)_transparent] [scrollbar-width:thin]')}>
      {shown.map((t, i) => (
        <li key={i} className="flex gap-3 rounded-lg border border-[var(--border)] p-3 text-sm text-[var(--color-brand-900)]">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-400)]" aria-hidden />
          <span className="max-w-[75ch] whitespace-pre-wrap leading-relaxed">{t}</span>
        </li>
      ))}
    </ul>
  )
}

export function HiddenNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-brand-600)]">
      <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
      {children}
    </p>
  )
}
