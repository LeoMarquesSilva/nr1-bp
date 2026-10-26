import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { deleteSurveyTemplate, getSurveyTemplate, updateSurveyTemplate, type SurveyTemplate } from '@/types/pesquisas'
import type { SurveyQuestion } from '@/data/pesquisas'
import { logAdminAuditAction } from '@/services/api/audit'
import { feedback } from '@/lib/feedback'
import { navigate, paths } from '../router'
import { QuestionEditor } from '../survey/QuestionEditor'
import { autosaveLabel, useAutosave } from '../survey/useAutosave'
import { Button, EmptyState, Field, Notice, PageHeader, PageSkeleton, PainelLink, Panel, StatusPill, inputCls } from '../ui'

type Draft = { name: string; description: string; intro: string; questions: SurveyQuestion[] }

export function ModeloPage({ id }: { id: string }) {
  const [template, setTemplate] = useState<SurveyTemplate | null | undefined>(undefined)

  useEffect(() => {
    setTemplate(undefined)
    getSurveyTemplate(id)
      .then(setTemplate)
      .catch(() => setTemplate(null))
  }, [id])

  if (template === undefined) return <PageSkeleton />
  if (template === null) {
    return (
      <EmptyState
        title="Modelo não encontrado"
        action={
          <Button asChild variant="outline">
            <PainelLink to={paths.modelos()}>Ver modelos</PainelLink>
          </Button>
        }
      />
    )
  }
  return <ModeloEditor key={template.id} template={template} />
}

function ModeloEditor({ template }: { template: SurveyTemplate }) {
  const [draft, setDraft] = useState<Draft>({
    name: template.name,
    description: template.description ?? '',
    intro: template.intro ?? '',
    questions: template.questions,
  })
  const autosave = useAutosave(draft, (d) => updateSurveyTemplate(template.id, { ...d, name: d.name.trim() || template.name }))

  const excluir = async () => {
    const ok = await feedback.confirm({
      title: 'Excluir modelo',
      message: `Excluir “${draft.name}”? As pesquisas já criadas a partir dele não mudam.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
    })
    if (!ok) return
    try {
      await deleteSurveyTemplate(template.id)
      logAdminAuditAction({ action: 'survey_template_deleted', details: { template: template.id } })
      feedback.success('Modelo excluído.')
      navigate(paths.modelos(), { replace: true })
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível excluir.')
    }
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Modelos de pesquisa', to: paths.modelos() }, { label: draft.name || 'Sem nome' }]}
        title={draft.name || 'Sem nome'}
        meta={
          <>
            {template.builtin && <StatusPill tone="info">Do sistema</StatusPill>}
            <span className={autosave.status === 'error' ? 'text-xs text-[var(--color-error-700)]' : 'text-xs text-[var(--color-brand-600)]'} aria-live="polite">
              {autosave.status === 'error' ? autosave.error : autosaveLabel(autosave.status)}
            </span>
          </>
        }
        description="Alterações valem para as próximas pesquisas criadas a partir deste modelo. Pesquisas já criadas não mudam."
        actions={
          !template.builtin && (
            <Button type="button" variant="outline" onClick={excluir}>
              <Trash2 />
              Excluir modelo
            </Button>
          )
        }
      />

      <div className="space-y-6">
        {template.builtin && <Notice tone="info">Modelo do sistema: pode ser editado, mas não excluído.</Notice>}
        <Panel title="Sobre o modelo">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Nome" htmlFor="modelo-nome">
              <input id="modelo-nome" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value.slice(0, 120) }))} className={inputCls} />
            </Field>
            <Field label="Descrição" htmlFor="modelo-descricao" hint="Ajuda a equipe a escolher o modelo ao criar uma pesquisa.">
              <input id="modelo-descricao" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value.slice(0, 240) }))} className={inputCls} />
            </Field>
            <Field label="Texto de abertura" htmlFor="modelo-intro" className="lg:col-span-2" hint="Pode ser ajustado em cada pesquisa. Linha em branco separa parágrafos; *entre asteriscos* fica em negrito.">
              <textarea id="modelo-intro" value={draft.intro} onChange={(e) => setDraft((d) => ({ ...d, intro: e.target.value.slice(0, 1500) }))} rows={3} className={cn(inputCls, 'resize-y')} />
            </Field>
          </div>
        </Panel>
        <QuestionEditor questions={draft.questions} onChange={(questions) => setDraft((d) => ({ ...d, questions }))} />
      </div>
    </>
  )
}
