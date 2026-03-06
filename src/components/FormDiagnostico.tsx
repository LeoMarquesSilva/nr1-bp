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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Identificação (só na primeira etapa) + botão teste */}
      {currentGroup === 0 && (
        <div className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">
              Setor: <span>{setor}</span>
            </p>
            <button
              type="button"
              onClick={handlePreencherAleatorio}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-violet-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-violet-100"
            >
              <Shuffle className="h-4 w-4" />
              Preencher aleatório (teste)
            </button>
          </div>
        </div>
      )}

      {/* Progress (hero: slate + violet bar) */}
      <div className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <ClipboardList className="h-4 w-4 text-violet-600" />
            Dimensão {currentGroup + 1} de {groups.length}
          </span>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
            {totalAnswered} / {QUESTIONS.length} respostas
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="progress-fill h-full rounded-full bg-violet-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-lg font-semibold text-slate-900">{dimensionLabel}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {DIMENSION_DESCRIPTIONS[questionsInGroup[0].dimensionId]}
        </p>
      </div>

      {/* Perguntas da dimensão atual (hero: cards slate, opção selecionada violet) */}
      <div ref={sectionRef} className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-6 shadow-sm sm:p-8">
        <fieldset className="space-y-8 border-0 p-0">
          <legend className="sr-only">{dimensionLabel}</legend>
          {questionsInGroup.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-slate-50"
            >
              <p className="mb-4 text-base font-medium leading-snug text-slate-900">
                <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">
                  {q.id}
                </span>
                {q.text}
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
                      className="option-card min-w-[7.5rem] flex-1 cursor-pointer focus-within:ring-2 focus-within:ring-violet-400 focus-within:ring-offset-2 sm:min-w-[8rem]"
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
                        className={`block rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition whitespace-nowrap ${
                          isSelected
                            ? 'border-violet-500 bg-violet-50 text-slate-900 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
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

      {/* Navegação (hero: secundário outline slate, primário slate-900) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentGroup === 0}
          className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
          Anterior
        </button>
        {currentGroup < groups.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!answeredInGroup}
            className="btn-escritorio inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima dimensão
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!allAnswered || submitting}
            className="btn-escritorio inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Enviar diagnóstico'}
            <Send className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  )
}
