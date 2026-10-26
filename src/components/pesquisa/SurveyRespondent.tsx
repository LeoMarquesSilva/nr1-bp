import { useEffect, useMemo, useState } from 'react'
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, ExternalLink, EyeOff, Lock, Send, Users } from 'lucide-react'
import {
  NR_OPTION,
  OTHER_KEY,
  TEXT_MAX_LENGTH,
  getAnswerOptions,
  isPageComplete,
  isQuestionAnswered,
  paginateQuestions,
  type AnswerValue,
  type MultiAnswer,
  type SurveyAnswers,
  type SurveyOption,
  type SurveyQuestion,
} from '@/data/pesquisas'
import { assertClientRateLimit, isLikelyBotHoneyPot } from '@/lib/antiAbuse'
import { feedback } from '@/lib/feedback'
import { trackEvent } from '@/lib/telemetry'
import { cn } from '@/lib/utils'

type Stage = 'ja-respondeu' | 'intro' | 'form' | 'obrigado'

export type RespondentSurvey = {
  id: string
  title: string
  intro: string | null
  questions: SurveyQuestion[]
  orgName: string | null
  minResponses: number
}

type Props = {
  survey: RespondentSurvey
  /** Link do canal de denúncias da empresa, quando ativo. */
  canalHref?: string | null
  /** Pré-visualização no painel: nada é guardado no navegador e nada é enviado. */
  preview?: boolean
  onSubmit: (answers: SurveyAnswers) => Promise<void>
}

type Rascunho = { answers: SurveyAnswers; page: number }

/** Card de superfície alinhado ao PageShell (faixa accent + gradiente claro). */
const surfaceCardCls =
  'rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white via-white to-[color-mix(in_srgb,var(--color-brand-50)_55%,white)] p-6 shadow-[inset_0_3px_0_0_var(--color-brand-400),var(--shadow-sm)] sm:p-8'

const optionBaseCls =
  'block rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)] peer-focus-visible:ring-offset-2'
const optionIdleCls =
  'border-[var(--border)] bg-white text-[var(--color-brand-800)] hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)]'
const optionSelectedCls =
  'border-[var(--color-brand-600)] bg-[color-mix(in_srgb,var(--color-brand-cream)_40%,white)] text-[var(--color-brand-900)] shadow-[var(--shadow-sm)]'

// Rascunho em sessionStorage (some ao fechar a aba): em computador compartilhado, a próxima pessoa não vê as respostas.
const rascunhoKey = (id: string) => `confiara:pesquisa:${id}:rascunho`
const enviadaKey = (id: string) => `confiara:pesquisa:${id}:enviada`

function readRascunho(id: string, preview?: boolean): Rascunho | null {
  if (preview) return null
  try {
    const raw = window.sessionStorage.getItem(rascunhoKey(id))
    return raw ? (JSON.parse(raw) as Rascunho) : null
  } catch {
    return null
  }
}

function hasSent(id: string, preview?: boolean): boolean {
  if (preview) return false
  try {
    return window.localStorage.getItem(enviadaKey(id)) === '1'
  } catch {
    return false
  }
}

/** Fluxo de quem responde: abertura, perguntas em partes, envio e agradecimento. */
export function SurveyRespondent({ survey, canalHref, preview, onSubmit }: Props) {
  const pages = useMemo(() => paginateQuestions(survey.questions), [survey.questions])
  const [stage, setStage] = useState<Stage>(() => (hasSent(survey.id, preview) ? 'ja-respondeu' : 'intro'))
  const [answers, setAnswers] = useState<SurveyAnswers>(() => readRascunho(survey.id, preview)?.answers ?? {})
  const [page, setPage] = useState(() => Math.min(Math.max(readRascunho(survey.id, preview)?.page ?? 0, 0), Math.max(pages.length - 1, 0)))
  const [submitting, setSubmitting] = useState(false)
  const [websiteField, setWebsiteField] = useState('')

  const required = survey.questions.filter((q) => q.required)
  const requiredAnswered = required.filter((q) => isQuestionAnswered(q, answers[q.id])).length
  const progressPercent = required.length ? Math.round((requiredAnswered / required.length) * 100) : 100
  const pageQuestions = pages[page] ?? []
  const pageComplete = isPageComplete(pageQuestions, answers)
  const isLastPage = page === pages.length - 1
  const hasDraft = Object.keys(answers).length > 0
  const minutes = Math.max(2, Math.ceil((survey.questions.length * 25) / 60))

  useEffect(() => {
    if (preview || stage !== 'form' || submitting || !hasDraft) return
    try {
      window.sessionStorage.setItem(rascunhoKey(survey.id), JSON.stringify({ answers, page } satisfies Rascunho))
    } catch {
      // private mode / quota
    }
  }, [answers, page, stage, submitting, hasDraft, survey.id, preview])

  useEffect(() => {
    if (!preview) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page, stage, preview])

  useEffect(() => {
    if (preview || stage !== 'form') return
    trackEvent({ name: 'pesquisa_step_view', flow: 'pesquisa', step: `parte_${page + 1}`, meta: { survey: survey.id } })
  }, [page, stage, preview, survey.id])

  useEffect(() => {
    if (preview || stage !== 'form' || !hasDraft || submitting) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [stage, hasDraft, submitting, preview])

  const setAnswer = (id: string, value: AnswerValue) => setAnswers((prev) => ({ ...prev, [id]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || !pages.every((p) => isPageComplete(p, answers))) return
    if (preview) {
      setStage('obrigado')
      return
    }
    if (isLikelyBotHoneyPot(websiteField)) {
      feedback.error('Não foi possível enviar no momento.')
      return
    }
    try {
      assertClientRateLimit({
        action: `pesquisa_submit_${survey.id}`,
        tenantId: 'pesquisa',
        maxAttempts: 3,
        windowMs: 10 * 60 * 1000,
        message: 'Muitas tentativas de envio em pouco tempo. Aguarde alguns minutos.',
      })
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Muitas tentativas. Aguarde e tente novamente.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(answers)
      try {
        window.sessionStorage.removeItem(rascunhoKey(survey.id))
        window.localStorage.setItem(enviadaKey(survey.id), '1')
      } catch {
        // ignore storage errors
      }
      trackEvent({ name: 'pesquisa_submit_success', flow: 'pesquisa', step: 'submit', meta: { survey: survey.id } })
      setAnswers({})
      setPage(0)
      setStage('obrigado')
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível enviar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (stage === 'obrigado') {
    return (
      <StatusCard icon={<CheckCircle2 className="h-10 w-10" />} title={preview ? 'Fim da pré-visualização' : 'Obrigado por participar'} tone="success">
        {preview
          ? 'Esta é a tela que a pessoa vê depois de enviar. Na pré-visualização nada foi enviado.'
          : 'Sua resposta foi registrada de forma anônima. Você pode fechar esta página.'}
        {preview && (
          <button type="button" onClick={() => { setAnswers({}); setPage(0); setStage('intro') }} className="mt-6 block w-full text-sm font-semibold text-[var(--color-brand-700)] underline-offset-2 hover:underline">
            Recomeçar a pré-visualização
          </button>
        )}
      </StatusCard>
    )
  }

  if (stage === 'ja-respondeu') {
    return (
      <StatusCard icon={<CheckCircle2 className="h-10 w-10" />} title="Este navegador já enviou uma resposta" tone="success">
        <span className="block">Cada pessoa deve responder uma única vez.</span>
        <span className="mt-2 block">Se outra pessoa está usando este computador, ela pode responder normalmente.</span>
        <button
          type="button"
          onClick={() => setStage('intro')}
          className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-brand-300)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-brand-800)] transition hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)]"
        >
          Sou outra pessoa e quero responder
        </button>
      </StatusCard>
    )
  }

  if (stage === 'intro') {
    return (
      <div className="mx-auto max-w-2xl font-reading text-[var(--color-brand-900)]">
        <div className={surfaceCardCls}>
          {survey.orgName && <p className="text-sm font-semibold text-[var(--color-brand-600)]">{survey.orgName}</p>}
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight [text-wrap:balance] sm:text-3xl">{survey.title}</h1>
          {survey.intro && <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-[var(--color-brand-800)]">{survey.intro}</p>}
          <ul className="mt-6 space-y-3">
            <IntroItem icon={<EyeOff className="h-4 w-4" />}>
              <strong>Anônima:</strong> não pedimos nome, e-mail, cargo nem setor.
            </IntroItem>
            <IntroItem icon={<Clock className="h-4 w-4" />}>
              <strong>{survey.questions.length} {survey.questions.length === 1 ? 'pergunta' : 'perguntas'}</strong>, cerca de {minutes} minutos.
            </IntroItem>
            <IntroItem icon={<Users className="h-4 w-4" />}>Os resultados só são vistos em conjunto, a partir de {survey.minResponses} respostas.</IntroItem>
          </ul>
          {canalHref && (
            <p className="mt-6 rounded-xl border border-[var(--border)] bg-white/80 p-4 text-sm leading-relaxed text-[var(--color-brand-700)]">
              Quer relatar uma situação específica? Esta pesquisa não é lida caso a caso. Use o{' '}
              <a href={canalHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[var(--color-brand-700)] underline-offset-2 hover:underline">
                Canal de Denúncias <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              , que também é anônimo.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              if (!preview) trackEvent({ name: 'pesquisa_start', flow: 'pesquisa', step: 'intro', meta: { survey: survey.id } })
              setStage('form')
            }}
            className="btn-escritorio mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 sm:w-auto"
          >
            {hasDraft ? 'Continuar de onde parei' : 'Começar'}
            <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
          </button>
        </div>
      </div>
    )
  }

  const offset = pages.slice(0, page).reduce((acc, p) => acc + p.length, 0)

  return (
    <div className="mx-auto max-w-2xl font-reading text-base leading-relaxed text-[var(--color-brand-900)]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={surfaceCardCls}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">
              Parte {page + 1} de {pages.length}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Respostas anônimas
            </span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-brand-100)] ring-1 ring-[color-mix(in_srgb,var(--color-brand-300)_40%,transparent)]"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso da pesquisa"
          >
            <div className="progress-fill h-full rounded-full bg-gradient-to-r from-[var(--color-brand-800)] via-[var(--color-brand-600)] to-[var(--color-brand-400)]" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {pageQuestions.map((q, i) => {
          const value = answers[q.id]
          const firstKey = getAnswerOptions(q)[0]?.key
          const showCanal = Boolean(canalHref && q.canalHint && typeof value === 'string' && value !== firstKey && value !== NR_OPTION.key)
          return (
            <fieldset key={q.id} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-xs)] sm:p-6">
              <legend className="sr-only">Pergunta {offset + i + 1}</legend>
              <p className="mb-4 flex items-start gap-3 font-medium leading-relaxed">
                <span className="brand-icon-tile flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold" aria-hidden>
                  {offset + i + 1}
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  {q.text}
                  {!q.required && <span className="ml-2 text-sm font-normal text-[var(--color-brand-600)]">(opcional)</span>}
                </span>
              </p>
              <QuestionInput question={q} value={value} onChange={(v) => setAnswer(q.id, v)} />
              {showCanal && (
                <p className="mt-4 rounded-xl bg-[var(--color-brand-50)] p-3 text-sm leading-relaxed text-[var(--color-brand-800)]">
                  Se quiser relatar o que aconteceu, o{' '}
                  <a href={canalHref!} target="_blank" rel="noreferrer" className="font-semibold underline-offset-2 hover:underline">
                    Canal de Denúncias
                  </a>{' '}
                  é anônimo e abre em outra aba, sem perder estas respostas.
                </p>
              )}
            </fieldset>
          )
        })}

        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={websiteField} onChange={(e) => setWebsiteField(e.target.value)} className="hidden" aria-hidden />

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => (page === 0 ? setStage('intro') : setPage((p) => p - 1))}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-brand-300)] bg-white px-5 py-3 font-semibold text-[var(--color-brand-700)] shadow-[var(--shadow-xs)] transition hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-900)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
              Anterior
            </button>
            {isLastPage ? (
              <button
                type="submit"
                disabled={!pageComplete || submitting}
                className="btn-escritorio inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
              >
                {submitting ? 'Enviando...' : 'Enviar respostas'}
                <Send className="h-5 w-5 shrink-0" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pageComplete}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-cream)] px-6 py-3 font-semibold text-[var(--color-brand-900)] shadow-[var(--shadow-md)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-700)] focus-visible:ring-offset-2"
              >
                Próxima
                <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
              </button>
            )}
          </div>
          {!pageComplete && (
            <p className="text-right text-sm text-[var(--muted-foreground)]" aria-live="polite">
              Responda as perguntas obrigatórias desta parte para continuar.
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

function QuestionInput({ question: q, value, onChange }: { question: SurveyQuestion; value: AnswerValue | undefined; onChange: (value: AnswerValue) => void }) {
  if (q.type === 'aberta') {
    const text = typeof value === 'string' ? value : ''
    return (
      <div>
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value.slice(0, TEXT_MAX_LENGTH))}
          rows={4}
          maxLength={TEXT_MAX_LENGTH}
          aria-label={q.text}
          className="input-escritorio w-full rounded-xl px-4 py-3 text-base"
          placeholder={q.required ? 'Escreva sua resposta' : 'Escreva sua resposta (opcional)'}
        />
        <div className="mt-1.5 flex flex-wrap justify-between gap-2 text-xs text-[var(--muted-foreground)]">
          <span>Não inclua nomes ou detalhes que permitam identificar você ou outras pessoas.</span>
          <span aria-hidden>
            {text.length}/{TEXT_MAX_LENGTH}
          </span>
        </div>
      </div>
    )
  }

  if (q.type === 'multipla') {
    const current: MultiAnswer = value && typeof value === 'object' ? value : { selected: [] }
    const max = Math.max(1, q.maxSelections ?? 1)
    const options = getAnswerOptions(q)

    if (max === 1) {
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((opt) => {
            const checked = current.selected[0] === opt.key
            return (
              <div key={opt.key} className={opt.key === OTHER_KEY && checked ? 'sm:col-span-2' : undefined}>
                <label className="cursor-pointer">
                  <input type="radio" name={`q-${q.id}`} checked={checked} onChange={() => onChange({ selected: [opt.key], outro: opt.key === OTHER_KEY ? current.outro : undefined })} className="peer sr-only" />
                  <span className={cn(optionBaseCls, 'text-left font-medium', checked ? optionSelectedCls : optionIdleCls)}>{opt.label}</span>
                </label>
                {opt.key === OTHER_KEY && checked && <OutroInput value={current.outro ?? ''} onChange={(outro) => onChange({ ...current, outro })} />}
              </div>
            )
          })}
        </div>
      )
    }

    const atLimit = current.selected.length >= max
    const toggle = (key: string) => {
      const selected = current.selected.includes(key) ? current.selected.filter((k) => k !== key) : [...current.selected, key]
      onChange({ selected, outro: selected.includes(OTHER_KEY) ? current.outro : undefined })
    }
    return (
      <div>
        <p className="mb-3 text-sm text-[var(--muted-foreground)]" aria-live="polite">
          Selecione até {max} opções · {current.selected.length} de {max} selecionadas
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((opt) => {
            const checked = current.selected.includes(opt.key)
            const disabled = !checked && atLimit
            return (
              <label key={opt.key} className={cn('relative', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(opt.key)} className="peer sr-only" />
                <span className={cn(optionBaseCls, 'flex items-center gap-3 text-left font-medium', checked ? optionSelectedCls : optionIdleCls, disabled && 'opacity-50 hover:border-[var(--border)] hover:bg-white')}>
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2',
                      checked ? 'border-[var(--color-brand-700)] bg-[var(--color-brand-700)] text-white' : 'border-[var(--color-brand-300)]'
                    )}
                    aria-hidden
                  >
                    {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  {opt.label}
                </span>
              </label>
            )
          })}
        </div>
        {current.selected.includes(OTHER_KEY) && <OutroInput value={current.outro ?? ''} onChange={(outro) => onChange({ ...current, outro })} />}
      </div>
    )
  }

  const options = getAnswerOptions(q)
  const main = options.filter((o) => o.key !== NR_OPTION.key)
  const temNaoResponder = options.length !== main.length
  const name = `q-${q.id}`

  return (
    <div>
      <div className={cn('grid gap-2', q.type === 'escala' && 'grid-cols-5', q.type === 'frequencia' && 'grid-cols-2 sm:grid-cols-4', q.type === 'sim_nao' && 'grid-cols-2')}>
        {main.map((opt) => (
          <RadioOption key={opt.key} name={name} option={opt} checked={value === opt.key} onSelect={() => onChange(opt.key)} />
        ))}
      </div>
      {q.type === 'escala' && (
        <div className="mt-2 flex justify-between gap-4 text-xs font-medium text-[var(--muted-foreground)]" aria-hidden>
          <span>{main[0].hint}</span>
          <span className="text-right">{main[main.length - 1].hint}</span>
        </div>
      )}
      {temNaoResponder && (
        <label className="mt-3 inline-flex cursor-pointer">
          <input type="radio" name={name} checked={value === NR_OPTION.key} onChange={() => onChange(NR_OPTION.key)} className="peer sr-only" />
          <span
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)] peer-focus-visible:ring-offset-2',
              value === NR_OPTION.key
                ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-100)] text-[var(--color-brand-900)]'
                : 'border-dashed border-[var(--color-brand-300)] text-[var(--muted-foreground)] hover:border-[var(--color-brand-400)] hover:text-[var(--color-brand-800)]'
            )}
          >
            {NR_OPTION.label}
          </span>
        </label>
      )}
    </div>
  )
}

function OutroInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, TEXT_MAX_LENGTH))}
      maxLength={TEXT_MAX_LENGTH}
      aria-label="Escreva qual"
      placeholder="Escreva qual"
      className="input-escritorio mt-3 w-full rounded-xl px-4 py-3 text-base"
      autoFocus
    />
  )
}

function RadioOption({ name, option, checked, onSelect }: { name: string; option: SurveyOption; checked: boolean; onSelect: () => void }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={option.key} checked={checked} onChange={onSelect} className="peer sr-only" aria-label={option.hint ? `${option.label} (${option.hint})` : option.label} />
      <span className={cn(optionBaseCls, checked ? optionSelectedCls : optionIdleCls)}>{option.label}</span>
    </label>
  )
}

function IntroItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-brand-800)] sm:text-base">
      <span className="brand-icon-tile mt-0.5 h-7 w-7 rounded-lg" aria-hidden>
        {icon}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  )
}

export function StatusCard({ icon, title, tone = 'neutral', children }: { icon: React.ReactNode; title: string; tone?: 'neutral' | 'success'; children: React.ReactNode }) {
  return (
    <div className="bg-card-escritorio mx-auto max-w-2xl rounded-2xl p-8 text-center sm:p-12">
      <div className={cn('mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full', tone === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600')}>{icon}</div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      <div className="mx-auto mt-4 max-w-md text-slate-600">{children}</div>
    </div>
  )
}
