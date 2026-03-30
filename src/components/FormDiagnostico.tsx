import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, Send, Shuffle } from 'lucide-react'
import { QUESTIONS, OPTIONS, DIMENSION_DESCRIPTIONS, type OptionKey, type Question } from '../data/hseIt'

const OPTION_KEYS: OptionKey[] = ['nunca', 'raramente', 'as_vezes', 'frequentemente', 'sempre']

function preencherAleatorio(): { answers: Record<number, OptionKey> } {
  const answers: Record<number, OptionKey> = {}
  for (const q of QUESTIONS) {
    answers[q.id] = OPTION_KEYS[Math.floor(Math.random() * OPTION_KEYS.length)]
  }
  return { answers }
}

type Props = {
  setor: string
  onSubmit: (answers: Record<number, OptionKey>, setor: string) => void | Promise<void>
  initialAnswers?: Record<number, OptionKey>
}

/** Card de superfície alinhado ao PageShell (faixa accent + gradiente claro). */
const surfaceCardCls =
  'rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white via-white to-[color-mix(in_srgb,var(--color-brand-50)_55%,white)] p-6 shadow-[inset_0_3px_0_0_var(--color-brand-400),var(--shadow-sm)] sm:p-8'

export function FormDiagnostico({ setor, onSubmit, initialAnswers = {} }: Props) {
  const [answers, setAnswers] = useState<Record<number, OptionKey>>(initialAnswers)
  const [currentGroup, setCurrentGroup] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const groups = QUESTIONS.reduce<Question[][]>((acc, q) => {
    const last = acc[acc.length - 1]
    if (last && last[0].dimensionId === q.dimensionId) {
      last.push(q)
    } else {
      acc.push([q])
    }
    return acc
  }, [])

  const answeredInGroup = groups[currentGroup].every((q) => answers[q.id] != null)
  const totalAnswered = Object.keys(answers).length
  const allAnswered = totalAnswered === QUESTIONS.length
  const progressPercent = Math.round((totalAnswered / QUESTIONS.length) * 100)

  const handleOption = (questionId: number, option: OptionKey) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allAnswered || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(answers, setor)
    } finally {
      setSubmitting(false)
    }
  }

  const goNext = () => {
    if (currentGroup < groups.length - 1) setCurrentGroup((i) => i + 1)
  }

  const goPrev = () => {
    if (currentGroup > 0) setCurrentGroup((i) => i - 1)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentGroup])

  const handlePreencherAleatorio = () => {
    const { answers: randomAnswers } = preencherAleatorio()
    setAnswers(randomAnswers)
    setCurrentGroup(groups.length - 1)
  }

  const questionsInGroup = groups[currentGroup]
  const dimensionLabel = questionsInGroup[0].dimensionLabel

  return (
    <div className="font-reading text-base leading-relaxed text-[var(--color-brand-900)]">
      <form onSubmit={handleSubmit} className="space-y-8">
        {currentGroup === 0 && (
          <div className={surfaceCardCls}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-brand-900)]">
                Setor: <span className="text-[var(--color-brand-700)]">{setor}</span>
              </p>
              <button
                type="button"
                onClick={handlePreencherAleatorio}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--color-brand-300)] bg-[color-mix(in_srgb,var(--color-brand-cream)_35%,white)] px-3 py-2 text-sm font-semibold text-[var(--color-brand-800)] transition hover:border-[var(--color-brand-400)] hover:bg-[color-mix(in_srgb,var(--color-brand-cream)_50%,white)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
              >
                <Shuffle className="h-4 w-4 shrink-0" aria-hidden />
                Preencher aleatório (teste)
              </button>
            </div>
          </div>
        )}

        <div className={surfaceCardCls}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-brand-900)]">
              <ClipboardList className="h-4 w-4 shrink-0 text-[var(--color-brand-600)]" aria-hidden />
              Dimensão {currentGroup + 1} de {groups.length}
            </span>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--color-brand-cream)_45%,white)] px-3 py-1 text-sm font-semibold text-[var(--color-brand-800)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-brand-400)_30%,transparent)]">
              {totalAnswered} / {QUESTIONS.length} respostas
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-brand-100)] ring-1 ring-[color-mix(in_srgb,var(--color-brand-300)_40%,transparent)]">
            <div
              className="progress-fill h-full rounded-full bg-gradient-to-r from-[var(--color-brand-800)] via-[var(--color-brand-600)] to-[var(--color-brand-400)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-lg font-semibold leading-snug text-[var(--color-brand-900)]">{dimensionLabel}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {DIMENSION_DESCRIPTIONS[questionsInGroup[0].dimensionId]}
          </p>
        </div>

        <div ref={sectionRef} className={surfaceCardCls}>
          <fieldset className="space-y-8 border-0 p-0">
            <legend className="sr-only">{dimensionLabel}</legend>
            {questionsInGroup.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-xs)] transition hover:border-[var(--color-brand-300)] hover:shadow-[var(--shadow-sm)]"
              >
                <p className="mb-4 flex flex-wrap items-start gap-3 text-base font-medium leading-relaxed text-[var(--color-brand-900)]">
                  <span className="brand-icon-tile flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                    {q.id}
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">{q.text}</span>
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label={`Resposta para pergunta ${q.id}`}
                >
                  {OPTIONS.map((opt) => {
                    const isSelected = answers[q.id] === opt.key
                    return (
                      <label
                        key={opt.key}
                        className="option-card min-w-[7.5rem] flex-1 cursor-pointer focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:ring-offset-2 sm:min-w-[8rem]"
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.key}
                          checked={isSelected}
                          onChange={() => handleOption(q.id, opt.key)}
                          className="sr-only"
                        />
                        <span
                          className={`block rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition sm:px-4 ${
                            isSelected
                              ? 'border-[var(--color-brand-600)] bg-[color-mix(in_srgb,var(--color-brand-cream)_40%,white)] text-[var(--color-brand-900)] shadow-[var(--shadow-sm)] ring-1 ring-[color-mix(in_srgb,var(--color-brand-400)_35%,transparent)]'
                              : 'border-[var(--border)] bg-white text-[var(--color-brand-800)] hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)]'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </fieldset>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentGroup === 0}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-brand-300)] bg-white px-5 py-3 font-semibold text-[var(--color-brand-700)] shadow-[var(--shadow-xs)] transition hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-900)] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
          >
            <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
            Anterior
          </button>
          {currentGroup < groups.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!answeredInGroup}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-cream)] px-6 py-3 font-semibold text-[var(--color-brand-900)] shadow-[var(--shadow-md)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-700)] focus-visible:ring-offset-2"
            >
              Próxima dimensão
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!allAnswered || submitting}
              className="btn-escritorio inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold shadow-[var(--shadow-sm)] transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              {submitting ? 'Enviando...' : 'Enviar diagnóstico'}
              <Send className="h-5 w-5 shrink-0" aria-hidden />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
