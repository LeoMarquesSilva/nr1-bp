import { useEffect, useState } from 'react'
import { Check, FilePlus2, Loader2 } from 'lucide-react'
import { createSurvey, getSurveyTemplates, type SurveyTemplate } from '@/types/pesquisas'
import { DEFAULT_INTRO } from '@/data/pesquisas'
import { logAdminAuditAction } from '@/services/api/audit'
import { feedback } from '@/lib/feedback'
import { cn } from '@/lib/utils'
import { usePainel, companyName } from '../PainelContext'
import { navigate, paths } from '../router'
import { Button, Field, Notice, PageHeader, PainelLink, Panel, Skeleton, inputCls, pluralize } from '../ui'

function suggestedTitle(t: SurveyTemplate): string {
  return t.key === 'em-branco' ? '' : `${t.name} ${new Date().getFullYear()}`
}

export function NovaPesquisaPage({ slug }: { slug: string }) {
  const { companyBySlug } = usePainel()
  const company = companyBySlug(slug)
  const [templates, setTemplates] = useState<SurveyTemplate[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    getSurveyTemplates()
      .then((list) => {
        setTemplates(list)
        const first = list.find((t) => t.key === 'diversidade-inclusao') ?? list[0]
        if (first) {
          setSelectedId(first.id)
          setTitle(suggestedTitle(first))
        }
      })
      .catch((err) => {
        setTemplates([])
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os modelos.')
      })
  }, [])

  if (!company) return null
  const name = companyName(company, slug)
  const selected = templates?.find((t) => t.id === selectedId)

  const choose = (t: SurveyTemplate) => {
    setSelectedId(t.id)
    if (!titleTouched) setTitle(suggestedTitle(t))
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !title.trim()) return
    setCreating(true)
    try {
      const survey = await createSurvey({
        tenantId: slug,
        title,
        intro: selected.intro ?? DEFAULT_INTRO,
        questions: selected.questions,
        templateId: selected.id,
      })
      logAdminAuditAction({ action: 'survey_created', tenantId: slug, details: { survey: survey.id, template: selected.key ?? selected.id } })
      navigate(paths.pesquisa(slug, survey.id), { replace: true })
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível criar a pesquisa.')
      setCreating(false)
    }
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Empresas', to: paths.empresas() },
          { label: name, to: paths.empresa(slug) },
          { label: 'Pesquisas', to: paths.empresa(slug, 'pesquisas') },
          { label: 'Nova pesquisa' },
        ]}
        title="Nova pesquisa"
        description="Escolha um modelo. A pesquisa começa como rascunho: você revisa e ajusta as perguntas antes de abrir para respostas."
      />

      {error && (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      )}

      <form onSubmit={create} className="space-y-6">
        <Panel title="Modelo" description={<>Modelos são mantidos em <PainelLink to={paths.modelos()} className="font-medium underline underline-offset-2">Modelos de pesquisa</PainelLink>.</>}>
          {templates === null ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div role="radiogroup" aria-label="Modelo da pesquisa" className="grid gap-3 sm:grid-cols-2">
              {templates.map((t) => {
                const active = t.id === selectedId
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => choose(t)}
                    className={cn(
                      'relative rounded-xl border p-4 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                      active ? 'border-[var(--color-brand-700)] bg-[var(--color-brand-50)] ring-1 ring-[var(--color-brand-700)]' : 'border-[var(--border)] hover:border-[var(--color-brand-300)]'
                    )}
                  >
                    {active && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-700)] text-white" aria-hidden>
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                    <span className="flex items-center gap-2 pr-6">
                      {t.key === 'em-branco' && <FilePlus2 className="h-4 w-4 text-[var(--color-brand-600)]" aria-hidden />}
                      <span className="font-semibold text-[var(--color-brand-900)]">{t.name}</span>
                    </span>
                    {t.description && <span className="mt-1 block text-sm leading-relaxed text-[var(--color-brand-700)]">{t.description}</span>}
                    <span className="mt-2 block text-xs text-[var(--color-brand-600)]">{t.questions.length ? pluralize(t.questions.length, 'pergunta', 'perguntas') : 'Sem perguntas'}</span>
                  </button>
                )
              })}
            </div>
          )}
        </Panel>

        <Panel title="Nome">
          <Field label="Nome da pesquisa" htmlFor="pesquisa-titulo" hint="Aparece para quem responde. Inclua o ano ou o ciclo para diferenciar das próximas edições.">
            <input
              id="pesquisa-titulo"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value.slice(0, 120))
                setTitleTouched(true)
              }}
              placeholder="Clima organizacional 2026"
              required
              className={cn(inputCls, 'max-w-lg')}
            />
          </Field>
        </Panel>

        <div className="flex flex-wrap justify-end gap-2">
          <Button asChild variant="ghost">
            <PainelLink to={paths.empresa(slug, 'pesquisas')}>Cancelar</PainelLink>
          </Button>
          <Button type="submit" disabled={!selected || !title.trim() || creating}>
            {creating && <Loader2 className="animate-spin" />}
            Criar rascunho
          </Button>
        </div>
      </form>
    </>
  )
}
