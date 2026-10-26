import { useEffect, useState } from 'react'
import { BookOpen, ChevronRight, Lock, Loader2, Plus } from 'lucide-react'
import { QUESTIONS } from '@/data/hseIt'
import { DEFAULT_INTRO } from '@/data/pesquisas'
import { createSurveyTemplate, getSurveyTemplates, type SurveyTemplate } from '@/types/pesquisas'
import { logAdminAuditAction } from '@/services/api/audit'
import { feedback } from '@/lib/feedback'
import { navigate, paths } from '../router'
import { Button, EmptyState, Notice, PageHeader, PainelLink, Panel, Skeleton, StatusPill, formatDateBR, pluralize } from '../ui'

export function ModelosPage() {
  const [templates, setTemplates] = useState<SurveyTemplate[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    getSurveyTemplates()
      .then(setTemplates)
      .catch((err) => {
        setTemplates([])
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os modelos.')
      })
  }, [])

  const novoModelo = async () => {
    setCreating(true)
    try {
      const t = await createSurveyTemplate({ name: 'Novo modelo', intro: DEFAULT_INTRO, questions: [] })
      logAdminAuditAction({ action: 'survey_template_created', details: { template: t.id } })
      navigate(paths.modelo(t.id))
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível criar o modelo.')
      setCreating(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Modelos de pesquisa"
        description="Pontos de partida para as pesquisas das empresas. Editar um modelo vale para as próximas pesquisas; as já criadas não mudam."
        actions={
          <Button type="button" onClick={novoModelo} disabled={creating}>
            {creating ? <Loader2 className="animate-spin" /> : <Plus />}
            Novo modelo
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      )}

      <Panel padded={false}>
        <ul className="divide-y divide-[var(--border)]">
          <li className="flex flex-wrap items-center gap-4 px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)]" aria-hidden>
              <Lock className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-[var(--color-brand-900)]">
                Diagnóstico NR-1 (HSE-IT)
                <StatusPill tone="neutral">Metodologia travada</StatusPill>
              </p>
              <p className="mt-0.5 text-sm text-[var(--color-brand-700)]">
                {QUESTIONS.length} perguntas em 7 dimensões. Já vem em todas as empresas, com coleta contínua; não é editável.
              </p>
            </div>
          </li>
          {templates === null &&
            [0, 1].map((i) => (
              <li key={i} className="px-5 py-4">
                <Skeleton className="h-10 w-full" />
              </li>
            ))}
          {templates?.map((t) => (
            <li key={t.id} onClick={() => navigate(paths.modelo(t.id))} className="flex cursor-pointer flex-wrap items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-[var(--color-brand-50)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)]" aria-hidden>
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <PainelLink to={paths.modelo(t.id)} onClick={(e) => e.stopPropagation()} className="flex flex-wrap items-center gap-2 font-semibold text-[var(--color-brand-900)] hover:underline">
                  {t.name}
                  {t.builtin && <StatusPill tone="info">Do sistema</StatusPill>}
                </PainelLink>
                <p className="mt-0.5 text-sm text-[var(--color-brand-700)]">
                  {t.description ? `${t.description} · ` : ''}
                  {t.questions.length ? pluralize(t.questions.length, 'pergunta', 'perguntas') : 'Sem perguntas'} · editado em {formatDateBR(t.updatedAt)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--color-brand-400)]" aria-hidden />
            </li>
          ))}
        </ul>
        {templates !== null && templates.length === 0 && !error && (
          <EmptyState icon={<BookOpen className="h-6 w-6" />} title="Nenhum modelo ainda" description="Crie um modelo para reaproveitar perguntas entre empresas." />
        )}
      </Panel>
    </>
  )
}
