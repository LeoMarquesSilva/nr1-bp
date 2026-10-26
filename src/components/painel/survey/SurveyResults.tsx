import { useMemo, useState } from 'react'
import { Lock, MessageSquareText, Table2, Trash2, Users } from 'lucide-react'
import {
  ESCALA_OPTIONS,
  NR_OPTION,
  getAnswerOptions,
  summarizeResponses,
  type QuestionSummary,
  type SurveyQuestion,
} from '@/data/pesquisas'
import type { SurveyResponse } from '@/types/pesquisas'
import { cn } from '@/lib/utils'
import { Button, EmptyState, Panel, formatDayBR, pluralize } from '../ui'

type EscalaSummary = Extract<QuestionSummary, { kind: 'escala' }>

/** Escala divergente (discordo ↔ concordo) com neutro cinza; validada para daltonismo no fundo branco. */
const LIKERT_COLORS: Record<string, string> = {
  '1': '#c63c3b',
  '2': '#ee8f8d',
  '3': '#dcdad2',
  '4': '#86b6ef',
  '5': '#256abf',
}

const LIKERT_LABELS: Record<string, string> = {
  '1': '1 · Discordo totalmente',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5 · Concordo totalmente',
}

function pct(part: number, total: number): string {
  return total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`
}

function formatMean(mean: number | null): string {
  return mean == null ? '—' : mean.toFixed(1).replace('.', ',')
}

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
  onDeleteAll,
}: {
  questions: SurveyQuestion[]
  responses: SurveyResponse[]
  minResponses: number
  onDeleteAll?: () => void
}) {
  const [showTable, setShowTable] = useState(false)
  const summary = useMemo(() => summarizeResponses(questions, responses.map((r) => r.answers)), [questions, responses])
  // Textos em ordem aleatória: a ordem de chegada poderia ajudar a identificar quem escreveu.
  const shuffled = useMemo(
    () => Object.fromEntries(summary.filter((s) => s.kind === 'aberta' || s.kind === 'multipla').map((s) => [s.question.id, shuffle(s.kind === 'aberta' ? s.texts : s.kind === 'multipla' ? s.outros : [])])),
    [summary]
  )

  const total = responses.length
  const days = responses.map((r) => r.submittedOn).sort()
  const likert = summary.filter((s): s is EscalaSummary => s.kind === 'escala')
  const others = summary.filter((s) => s.kind !== 'escala')

  if (total === 0) {
    return (
      <Panel>
        <EmptyState icon={<Users className="h-6 w-6" />} title="Nenhuma resposta ainda" description="Os resultados aparecem aqui depois que as pessoas responderem pelo link." />
      </Panel>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-[var(--color-brand-700)]">
          <Users className="h-4 w-4" aria-hidden />
          <span>
            <strong className="text-[var(--color-brand-900)]">{pluralize(total, 'resposta', 'respostas')}</strong>
            {days.length > 0 && ` · de ${formatDayBR(days[0])} a ${formatDayBR(days[days.length - 1])}`}
          </span>
        </p>
        {onDeleteAll && (
          <Button type="button" variant="ghost" size="sm" onClick={onDeleteAll}>
            <Trash2 />
            Apagar respostas
          </Button>
        )}
      </div>

      {total < minResponses ? (
        <Panel>
          <EmptyState
            icon={<Lock className="h-6 w-6" />}
            title={`${total} de ${minResponses} respostas necessárias`}
            description={`Os resultados aparecem a partir de ${minResponses} respostas. Com menos que isso, seria possível deduzir quem respondeu o quê.`}
          />
        </Panel>
      ) : (
        <>
          {likert.length > 0 && (
            <Panel
              title="Escalas de 1 a 5"
              description="Barras centradas no 3: à esquerda quem discorda, à direita quem concorda. “Prefiro não responder” fica fora da barra e da média."
              actions={
                <Button type="button" variant="outline" size="sm" onClick={() => setShowTable((v) => !v)} aria-pressed={showTable}>
                  <Table2 />
                  {showTable ? 'Ver gráfico' : 'Ver tabela'}
                </Button>
              }
            >
              {showTable ? <LikertTable rows={likert} questions={questions} /> : <LikertChart rows={likert} questions={questions} />}
            </Panel>
          )}

          {others.map((s) => {
            const n = questions.findIndex((q) => q.id === s.question.id) + 1
            if (s.kind === 'opcoes') {
              return (
                <QuestionPanel key={s.question.id} n={n} text={s.question.text}>
                  <BarList items={getAnswerOptions(s.question).map((o) => ({ label: o.label, count: s.counts[o.key] ?? 0 }))} total={s.total} />
                </QuestionPanel>
              )
            }
            if (s.kind === 'multipla') {
              const outros = shuffled[s.question.id] ?? []
              return (
                <QuestionPanel key={s.question.id} n={n} text={s.question.text} note={`Até ${s.question.maxSelections ?? 1} por pessoa · percentuais sobre ${pluralize(s.respondents, 'pessoa', 'pessoas')}.`}>
                  <BarList
                    items={getAnswerOptions(s.question)
                      .map((o) => ({ label: o.label, count: s.counts[o.key] ?? 0 }))
                      .sort((a, b) => b.count - a.count)}
                    total={s.respondents}
                  />
                  {outros.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-sm font-medium text-[var(--color-brand-900)]">Escritos em “Outros”</p>
                      <TextList texts={outros} />
                    </div>
                  )}
                </QuestionPanel>
              )
            }
            if (s.kind === 'aberta') {
              const texts = shuffled[s.question.id] ?? []
              return (
                <QuestionPanel key={s.question.id} n={n} text={s.question.text} note={`${texts.length} de ${pluralize(total, 'pessoa respondeu', 'pessoas responderam')}. Ordem aleatória.`}>
                  {texts.length === 0 ? <p className="text-sm text-[var(--color-brand-700)]">Nenhuma resposta escrita.</p> : <TextList texts={texts} />}
                </QuestionPanel>
              )
            }
            return null
          })}
        </>
      )}
    </div>
  )
}

function QuestionPanel({ n, text, note, children }: { n: number; text: string; note?: string; children: React.ReactNode }) {
  return (
    <Panel>
      <p className="flex items-start gap-3 font-medium leading-snug text-[var(--color-brand-900)]">
        <span className="brand-icon-tile h-7 w-7 shrink-0 rounded-md text-sm font-bold">{n}</span>
        <span className="pt-0.5">{text}</span>
      </p>
      {note && <p className="mt-2 text-xs text-[var(--color-brand-600)]">{note}</p>}
      <div className="mt-4">{children}</div>
    </Panel>
  )
}

/** Barras na escala do total (100% = todas as pessoas), para o comprimento bater com o percentual ao lado. */
function BarList({ items, total }: { items: { label: string; count: number }[]; total: number }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-[var(--color-brand-800)]">{item.label}</span>
            <span className="shrink-0 tabular-nums text-[var(--color-brand-600)]">
              {item.count} · <span className="font-semibold text-[var(--color-brand-900)]">{pct(item.count, total)}</span>
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--color-brand-100)]">
            <div className="h-full rounded-full bg-[var(--color-brand-600)]" style={{ width: `${total ? (item.count / total) * 100 : 0}%`, minWidth: item.count > 0 ? '6px' : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function TextList({ texts }: { texts: string[] }) {
  return (
    <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
      {texts.map((t, i) => (
        <li key={i} className="flex gap-3 rounded-lg bg-[var(--color-brand-50)] p-3 text-sm text-[var(--color-brand-900)]">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-500)]" aria-hidden />
          <span className="max-w-[75ch] whitespace-pre-wrap leading-relaxed">{t}</span>
        </li>
      ))}
    </ul>
  )
}

function LikertChart({ rows, questions }: { rows: EscalaSummary[]; questions: SurveyQuestion[] }) {
  const [hover, setHover] = useState<{ id: string; key: string } | null>(null)
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-brand-700)]">
        {ESCALA_OPTIONS.map((o) => (
          <span key={o.key} className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px]" style={{ background: LIKERT_COLORS[o.key] }} aria-hidden />
            {LIKERT_LABELS[o.key]}
          </span>
        ))}
      </div>
      <ul className="space-y-6">
        {rows.map((row) => {
          const n = questions.findIndex((q) => q.id === row.question.id) + 1
          const valid = ESCALA_OPTIONS.reduce((acc, o) => acc + (row.counts[o.key] ?? 0), 0)
          const nr = row.counts[NR_OPTION.key] ?? 0
          const share = (key: string) => (valid ? (row.counts[key] ?? 0) / valid : 0)
          // Centro da barra no meio do neutro (3); cada lado do eixo vale 100% das respostas.
          let offset = 50 - (share('1') + share('2') + share('3') / 2) * 50
          const segments = ESCALA_OPTIONS.map((o) => {
            const seg = { key: o.key, left: offset, width: share(o.key) * 50 }
            offset += seg.width
            return seg
          })
          const hovered = hover?.id === row.question.id ? segments.find((s) => s.key === hover.key) : null
          return (
            <li key={row.question.id}>
              <p className="mb-2 text-sm leading-snug text-[var(--color-brand-800)]">
                <span className="mr-1.5 font-semibold text-[var(--color-brand-900)]">{n}.</span>
                {row.question.text}
              </p>
              <div className="relative h-7" onMouseLeave={() => setHover(null)}>
                <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--color-brand-300)]" aria-hidden />
                {segments.map(
                  (s) =>
                    s.width > 0 && (
                      <button
                        key={s.key}
                        type="button"
                        aria-label={`${LIKERT_LABELS[s.key]}: ${row.counts[s.key]} respostas (${pct(row.counts[s.key] ?? 0, valid)})`}
                        onMouseEnter={() => setHover({ id: row.question.id, key: s.key })}
                        onFocus={() => setHover({ id: row.question.id, key: s.key })}
                        onBlur={() => setHover(null)}
                        className="absolute inset-y-1 rounded-[4px] border-x border-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)]"
                        style={{ left: `${s.left}%`, width: `${s.width}%`, background: LIKERT_COLORS[s.key] }}
                      />
                    )
                )}
                {hovered && (
                  <div
                    className="pointer-events-none absolute bottom-full z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-brand-900)] px-2.5 py-1.5 text-xs text-white shadow-[var(--shadow-sm)]"
                    style={{ left: `${hovered.left + hovered.width / 2}%` }}
                    role="tooltip"
                  >
                    {LIKERT_LABELS[hovered.key]}: <strong>{row.counts[hovered.key]}</strong> ({pct(row.counts[hovered.key] ?? 0, valid)})
                  </div>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-[var(--color-brand-600)]">
                <span>
                  Discordam (1–2): <strong className="text-[var(--color-brand-900)]">{pct((row.counts['1'] ?? 0) + (row.counts['2'] ?? 0), valid)}</strong>
                </span>
                <span>
                  Média <strong className="text-[var(--color-brand-900)]">{formatMean(row.mean)}</strong>
                  {nr > 0 && ` · ${nr} ${nr > 1 ? 'preferiram' : 'preferiu'} não responder`}
                </span>
                <span>
                  Concordam (4–5): <strong className="text-[var(--color-brand-900)]">{pct((row.counts['4'] ?? 0) + (row.counts['5'] ?? 0), valid)}</strong>
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LikertTable({ rows, questions }: { rows: EscalaSummary[]; questions: SurveyQuestion[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-xs text-[var(--color-brand-600)]">
            <th scope="col" className="py-2 pr-3 font-medium">Pergunta</th>
            {ESCALA_OPTIONS.map((o) => (
              <th key={o.key} scope="col" className="px-2 py-2 text-right font-medium" title={o.hint}>
                {o.label}
              </th>
            ))}
            <th scope="col" className="px-2 py-2 text-right font-medium">Não resp.</th>
            <th scope="col" className="py-2 pl-2 text-right font-medium">Média</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.question.id} className="border-b border-[var(--border)] align-top last:border-0">
              <td className="py-2.5 pr-3 text-[var(--color-brand-800)]">
                <span className="mr-1.5 font-semibold">{questions.findIndex((q) => q.id === row.question.id) + 1}.</span>
                {row.question.text}
              </td>
              {ESCALA_OPTIONS.map((o) => (
                <td key={o.key} className="px-2 py-2.5 text-right tabular-nums text-[var(--color-brand-800)]">
                  {row.counts[o.key] ?? 0}
                </td>
              ))}
              <td className="px-2 py-2.5 text-right tabular-nums text-[var(--color-brand-600)]">{row.counts[NR_OPTION.key] ?? 0}</td>
              <td className={cn('py-2.5 pl-2 text-right font-semibold tabular-nums text-[var(--color-brand-900)]')}>{formatMean(row.mean)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-[var(--color-brand-600)]">1 = Discordo totalmente · 5 = Concordo totalmente. A média não considera “Prefiro não responder”.</p>
    </div>
  )
}
