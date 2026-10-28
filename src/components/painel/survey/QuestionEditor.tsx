import { useEffect, useRef, useState, type ComponentType } from 'react'
import { AlignLeft, ArrowDown, ArrowUp, CheckSquare, Copy, Gauge, Hash, ListChecks, Plus, ToggleLeft, Trash2, X } from 'lucide-react'
import {
  NR_OPTION,
  OTHER_LABEL,
  QUESTION_MAX_LENGTH,
  QUESTION_TYPES,
  SCALE_PRESETS,
  changeQuestionType,
  createQuestion,
  describeGate,
  endIfLabels,
  getAnswerOptions,
  getQuestionTypeLabel,
  newOptionKey,
  newQuestionId,
  type QuestionType,
  type SurveyQuestion,
} from '@/data/pesquisas'
import { cn } from '@/lib/utils'
import { Button, Switch, inputCls } from '../ui'

const TYPE_ICON: Record<QuestionType, ComponentType<{ className?: string }>> = {
  escala: Gauge,
  frequencia: ListChecks,
  sim_nao: ToggleLeft,
  multipla: CheckSquare,
  nota: Hash,
  aberta: AlignLeft,
}

type Props = {
  questions: SurveyQuestion[]
  onChange: (questions: SurveyQuestion[]) => void
}

/** Editor da lista de perguntas (pesquisas em rascunho e modelos). */
export function QuestionEditor({ questions, onChange }: Props) {
  const [focusId, setFocusId] = useState<string | null>(null)

  const update = (id: string, patch: Partial<SurveyQuestion> | ((q: SurveyQuestion) => SurveyQuestion)) =>
    onChange(questions.map((q) => (q.id === id ? (typeof patch === 'function' ? patch(q) : { ...q, ...patch }) : q)))

  const add = (type: QuestionType, index = questions.length) => {
    const q = createQuestion(type)
    const next = [...questions]
    next.splice(index, 0, q)
    onChange(next)
    setFocusId(q.id)
  }

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= questions.length) return
    const next = [...questions]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const duplicate = (index: number) => {
    const src = questions[index]
    const copy: SurveyQuestion = {
      ...src,
      id: newQuestionId(),
      options: src.options?.map((o) => ({ ...o, key: newOptionKey() })),
    }
    const next = [...questions]
    next.splice(index + 1, 0, copy)
    onChange(next)
    setFocusId(copy.id)
  }

  return (
    <div className="space-y-4">
      {questions.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--color-brand-300)] bg-white px-6 py-10 text-center">
          <p className="font-sans text-base font-semibold text-[var(--color-brand-900)]">Adicione a primeira pergunta</p>
          <p className="mt-1 text-sm text-[var(--color-brand-700)]">Escolha um tipo abaixo. Você pode reordenar e trocar o tipo depois.</p>
        </div>
      )}
      <ol className="space-y-4">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            total={questions.length}
            question={q}
            gate={describeGate(questions, i)}
            autoFocus={focusId === q.id}
            onFocused={() => setFocusId(null)}
            onChange={(patch) => update(q.id, patch)}
            onMove={(delta) => move(i, delta)}
            onDuplicate={() => duplicate(i)}
            onRemove={() => onChange(questions.filter((x) => x.id !== q.id))}
          />
        ))}
      </ol>
      <AddQuestionBar onAdd={(type) => add(type)} />
    </div>
  )
}

function AddQuestionBar({ onAdd }: { onAdd: (type: QuestionType) => void }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--color-brand-900)]">
        <Plus className="h-4 w-4" aria-hidden />
        Adicionar pergunta
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {QUESTION_TYPES.map((t) => {
          const Icon = TYPE_ICON[t.type]
          return (
            <button
              key={t.type}
              type="button"
              onClick={() => onAdd(t.type)}
              className="flex items-start gap-2.5 rounded-lg border border-[var(--border)] px-3 py-2.5 text-left transition-colors duration-150 hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-600)]" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[var(--color-brand-900)]">{t.label}</span>
                <span className="block text-xs leading-snug text-[var(--color-brand-600)]">{t.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function IconAction({ label, onClick, disabled, children, danger }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-brand-600)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-30',
        danger ? 'hover:bg-[var(--color-error-50)] hover:text-[var(--color-error-700)]' : 'hover:bg-[var(--color-brand-100)] hover:text-[var(--color-brand-900)]'
      )}
    >
      {children}
    </button>
  )
}

function QuestionCard({
  index,
  total,
  question: q,
  gate,
  autoFocus,
  onFocused,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: {
  index: number
  total: number
  question: SurveyQuestion
  gate: string | null
  autoFocus: boolean
  onFocused: () => void
  onChange: (patch: Partial<SurveyQuestion> | ((q: SurveyQuestion) => SurveyQuestion)) => void
  onMove: (delta: number) => void
  onDuplicate: () => void
  onRemove: () => void
}) {
  const textRef = useRef<HTMLTextAreaElement>(null)
  const textId = `pergunta-${q.id}`

  useEffect(() => {
    if (!autoFocus) return
    textRef.current?.focus()
    textRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    onFocused()
  }, [autoFocus, onFocused])

  return (
    <li className="rounded-xl border border-[var(--border)] bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
        <span className="brand-icon-tile h-7 w-7 rounded-md text-sm font-bold" aria-hidden>
          {index + 1}
        </span>
        <label className="sr-only" htmlFor={`${textId}-tipo`}>
          Tipo da pergunta {index + 1}
        </label>
        <select
          id={`${textId}-tipo`}
          value={q.type}
          onChange={(e) => onChange((cur) => changeQuestionType(cur, e.target.value as QuestionType))}
          className={cn(inputCls, 'w-auto py-1.5')}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center">
          <IconAction label="Mover para cima" onClick={() => onMove(-1)} disabled={index === 0}>
            <ArrowUp className="h-4 w-4" />
          </IconAction>
          <IconAction label="Mover para baixo" onClick={() => onMove(1)} disabled={index === total - 1}>
            <ArrowDown className="h-4 w-4" />
          </IconAction>
          <IconAction label="Duplicar pergunta" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </IconAction>
          <IconAction label="Excluir pergunta" onClick={onRemove} danger>
            <Trash2 className="h-4 w-4" />
          </IconAction>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        {gate && <p className="rounded-md bg-[var(--color-brand-50)] px-3 py-2 text-xs text-[var(--color-brand-700)]">{gate}</p>}
        <div>
          <label htmlFor={textId} className="sr-only">
            Texto da pergunta {index + 1}
          </label>
          <textarea
            id={textId}
            ref={textRef}
            value={q.text}
            onChange={(e) => onChange({ text: e.target.value.slice(0, QUESTION_MAX_LENGTH) })}
            rows={2}
            placeholder="Escreva a pergunta"
            className={cn(inputCls, 'resize-y text-base')}
          />
        </div>

        {(q.type === 'escala' || q.type === 'frequencia' || q.type === 'sim_nao' || q.type === 'nota') && <OptionsPreview question={q} />}
        {q.type === 'escala' && <ScaleLabelsEditor question={q} onChange={onChange} id={`${textId}-rotulos`} />}
        {q.type === 'multipla' && <MultipleOptionsEditor question={q} onChange={onChange} />}
        {q.type === 'aberta' && (
          <p className="text-sm text-[var(--color-brand-700)]">Texto livre de até 1.000 caracteres. Quem responde vê um aviso para não citar nomes.</p>
        )}

        <div className="space-y-3 border-t border-[var(--border)] pt-4">
          <Switch id={`${textId}-obrigatoria`} checked={q.required} onChange={(v) => onChange({ required: v })} label="Obrigatória" />
          {(q.type === 'escala' || q.type === 'frequencia') && (
            <Switch
              id={`${textId}-nr`}
              checked={Boolean(q.allowNR)}
              onChange={(v) => onChange({ allowNR: v })}
              label="Oferecer “Prefiro não responder”"
              description="Recomendado em temas sensíveis: a pessoa não abandona a pesquisa por causa de uma pergunta."
            />
          )}
          {q.type === 'frequencia' && (
            <Switch
              id={`${textId}-canal`}
              checked={Boolean(q.canalHint)}
              onChange={(v) => onChange({ canalHint: v })}
              label="Sugerir o Canal de Denúncias"
              description="Se a resposta indicar ocorrência, mostra um aviso discreto com o link do canal."
            />
          )}
          {q.type !== 'aberta' && (
            <div>
              <p className="text-sm font-medium text-[var(--color-brand-900)]">Agrupar nos resultados</p>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-brand-700)]">Opcional. Perguntas da mesma dimensão aparecem juntas, com o % favorável do grupo.</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <input
                  value={q.section ?? ''}
                  onChange={(e) => onChange({ section: e.target.value.slice(0, 60) || undefined })}
                  placeholder="Dimensão (ex.: Credibilidade)"
                  aria-label={`Dimensão da pergunta ${index + 1}`}
                  className={cn(inputCls, 'py-1.5')}
                />
                <input
                  value={q.theme ?? ''}
                  onChange={(e) => onChange({ theme: e.target.value.slice(0, 60) || undefined })}
                  placeholder="Tema (ex.: Comunicação da liderança)"
                  aria-label={`Tema da pergunta ${index + 1}`}
                  className={cn(inputCls, 'py-1.5')}
                />
              </div>
            </div>
          )}
          {q.type === 'sim_nao' && index < total - 1 && (
            <div>
              <label htmlFor={`${textId}-encerra`} className="text-sm font-medium text-[var(--color-brand-900)]">
                Depois desta pergunta
              </label>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-brand-700)]">
                Ramificação: as próximas perguntas só aparecem depois da resposta escolhida; com a outra, a pesquisa termina.
              </p>
              <select
                id={`${textId}-encerra`}
                value={q.endIf ?? ''}
                onChange={(e) => onChange({ endIf: (e.target.value || undefined) as SurveyQuestion['endIf'] })}
                className={cn(inputCls, 'mt-2 sm:w-auto')}
              >
                <option value="">Mostrar as próximas perguntas para todos</option>
                <option value="nao">Só continuar se responder “Sim”</option>
                <option value="sim">Só continuar se responder “Não”</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

function OptionsPreview({ question: q }: { question: SurveyQuestion }) {
  const opts = getAnswerOptions(q).filter((o) => o.key !== NR_OPTION.key)
  return (
    <div>
      <p className="mb-2 text-xs text-[var(--color-brand-600)]">Opções de resposta</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {opts.map((o) => (
          <span key={o.key} className="rounded-md border border-[var(--border)] bg-[var(--color-brand-50)] px-2.5 py-1 text-sm text-[var(--color-brand-800)]">
            {o.label}
          </span>
        ))}
        {(q.type === 'escala' || q.type === 'frequencia') && q.allowNR && (
          <span className="rounded-md border border-dashed border-[var(--color-brand-300)] px-2.5 py-1 text-sm text-[var(--color-brand-600)]">Prefiro não responder</span>
        )}
      </div>
      {q.type === 'escala' && !q.labels && <p className="mt-1.5 text-xs text-[var(--color-brand-600)]">1 = Discordo totalmente · 5 = Concordo totalmente</p>}
      {q.type === 'nota' && <p className="mt-1.5 text-xs text-[var(--color-brand-600)]">Nos resultados aparecem a média e a distribuição das notas.</p>}
    </div>
  )
}

/** Rótulos dos 5 pontos da escala: números, um dos prontos ou personalizados (do pior para o melhor). */
function ScaleLabelsEditor({ question: q, onChange, id }: { question: SurveyQuestion; onChange: (patch: Partial<SurveyQuestion>) => void; id: string }) {
  const current = q.labels ?? null
  const preset = SCALE_PRESETS.find((p) => (p.labels === null ? current === null : current !== null && p.labels.join('|') === current.join('|')))
  const value = preset?.id ?? 'personalizado'
  const choose = (v: string) => {
    if (v === 'personalizado') return onChange({ labels: current ? [...current] : ['', '', '', '', ''] })
    const labels = SCALE_PRESETS.find((p) => p.id === v)?.labels
    onChange({ labels: labels ? [...labels] : undefined })
  }
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-[var(--color-brand-600)]">
        Rótulos da escala
      </label>
      <select id={id} value={value} onChange={(e) => choose(e.target.value)} className={cn(inputCls, 'py-1.5 sm:w-auto')}>
        {SCALE_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
        <option value="personalizado">Personalizados</option>
      </select>
      {value === 'personalizado' && (
        <div className="mt-2 grid gap-2 sm:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <input
              key={i}
              value={current?.[i] ?? ''}
              onChange={(e) => onChange({ labels: (current ?? ['', '', '', '', '']).map((l, k) => (k === i ? e.target.value.slice(0, 40) : l)) })}
              placeholder={i === 0 ? '1 (pior)' : i === 4 ? '5 (melhor)' : String(i + 1)}
              aria-label={`Rótulo do ponto ${i + 1}`}
              className={cn(inputCls, 'py-1.5')}
            />
          ))}
        </div>
      )}
      <p className="mt-1.5 text-xs text-[var(--color-brand-600)]">Do pior para o melhor. Nos resultados, os pontos 4 e 5 contam como favoráveis.</p>
    </div>
  )
}

function MultipleOptionsEditor({ question: q, onChange }: { question: SurveyQuestion; onChange: (patch: Partial<SurveyQuestion>) => void }) {
  const options = q.options ?? []
  const totalAnswerOptions = getAnswerOptions(q).length
  const max = Math.min(q.maxSelections ?? 1, Math.max(1, totalAnswerOptions))
  const setOptions = (next: typeof options) => onChange({ options: next, maxSelections: Math.min(q.maxSelections ?? 1, Math.max(1, next.length + (q.allowOther ? 1 : 0))) })

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs text-[var(--color-brand-600)]">Opções</p>
        <ul className="space-y-2">
          {options.map((o, i) => (
            <li key={o.key} className="flex items-center gap-2">
              <span className="h-4 w-4 shrink-0 rounded-[4px] border-2 border-[var(--color-brand-300)]" aria-hidden />
              <input
                value={o.label}
                onChange={(e) => setOptions(options.map((x) => (x.key === o.key ? { ...x, label: e.target.value.slice(0, 120) } : x)))}
                placeholder={`Opção ${i + 1}`}
                aria-label={`Opção ${i + 1}`}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setOptions(options.filter((x) => x.key !== o.key))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-brand-600)] hover:bg-[var(--color-error-50)] hover:text-[var(--color-error-700)] disabled:opacity-30"
                aria-label={`Remover opção ${i + 1}`}
                disabled={options.length <= 1}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
          {q.allowOther && (
            <li className="flex items-center gap-2 text-sm text-[var(--color-brand-700)]">
              <span className="h-4 w-4 shrink-0 rounded-[4px] border-2 border-dashed border-[var(--color-brand-300)]" aria-hidden />
              {OTHER_LABEL} (com campo de texto)
            </li>
          )}
        </ul>
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setOptions([...options, { key: newOptionKey(), label: '' }])}>
          <Plus />
          Adicionar opção
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--border)] pt-4">
        <label className="flex items-center gap-2 text-sm text-[var(--color-brand-900)]">
          Seleções permitidas
          <select value={max} onChange={(e) => onChange({ maxSelections: Number(e.target.value) })} className={cn(inputCls, 'w-auto py-1.5')}>
            {Array.from({ length: Math.max(1, totalAnswerOptions) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? 'Só 1 (escolha única)' : `Até ${n}`}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Switch
        id={`outros-${q.id}`}
        checked={Boolean(q.allowOther)}
        onChange={(v) => onChange({ allowOther: v })}
        label={`Incluir “${OTHER_LABEL}”`}
        description="Quem marcar escreve o tema em um campo de texto."
      />
    </div>
  )
}

/** Lista somente leitura (pesquisa já aberta ou encerrada). */
export function QuestionList({ questions }: { questions: SurveyQuestion[] }) {
  return (
    <ol className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
      {questions.map((q, i) => {
        const opts = getAnswerOptions(q)
        const ends = endIfLabels(q)
        const gate = describeGate(questions, i)
        return (
          <li key={q.id} className="flex gap-4 px-5 py-4">
            <span className="w-6 shrink-0 text-right font-mono text-sm text-[var(--color-brand-600)]">{i + 1}</span>
            <div className="min-w-0">
              <p className="text-sm leading-relaxed text-[var(--color-brand-900)]">{q.text}</p>
              <p className="mt-1 text-xs text-[var(--color-brand-600)]">
                {getQuestionTypeLabel(q.type)}
                {q.required ? ' · obrigatória' : ' · opcional'}
                {q.type === 'multipla' && ` · até ${q.maxSelections ?? 1}`}
                {opts.length > 0 && q.type === 'multipla' && `: ${opts.map((o) => o.label).join(', ')}`}
                {ends && i < questions.length - 1 && ` · só continua com “${ends.continues}”`}
              </p>
              {gate && <p className="mt-1 text-xs text-[var(--color-brand-600)]">{gate}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
