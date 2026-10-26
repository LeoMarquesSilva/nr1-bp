import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { BookmarkPlus, CopyPlus, Eye, Loader2, Lock, LockOpen, MoreHorizontal, Play, Trash2, X } from 'lucide-react'
import {
  createSurvey,
  createSurveyTemplate,
  deleteSurvey,
  deleteSurveyResponses,
  getSurvey,
  getSurveyResponses,
  getSurveyStats,
  setSurveyStatus,
  updateSurvey,
  type Survey,
  type SurveyResponse,
} from '@/types/pesquisas'
import { MIN_RESPONSES_CHOICES, validateQuestions, type SurveyQuestion } from '@/data/pesquisas'
import { logAdminAuditAction } from '@/services/api/audit'
import { buildDenunciaUrl } from '@/lib/routes'
import { feedback } from '@/lib/feedback'
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { IntroText, SurveyRespondent } from '@/components/pesquisa/SurveyRespondent'
import { usePainel, companyName } from '../PainelContext'
import { navigate, paths, type PesquisaTab } from '../router'
import { SharePanel } from '../SharePanel'
import { QuestionEditor, QuestionList } from '../survey/QuestionEditor'
import { SurveyResults } from '../survey/SurveyResults'
import { autosaveLabel, useAutosave } from '../survey/useAutosave'
import { Button, EmptyState, Field, Notice, PageHeader, PageSkeleton, PainelLink, Panel, StatusPill, TabNav, formatDateBR, inputCls } from '../ui'
import { SURVEY_STATUS } from './PesquisasPage'

type Draft = { title: string; intro: string; minResponses: number; questions: SurveyQuestion[] }

const toDraft = (s: Survey): Draft => ({ title: s.title, intro: s.intro ?? '', minResponses: s.minResponses, questions: s.questions })

export function surveyPublicUrl(id: string): string {
  return `${window.location.origin}/pesquisa/${id}`
}

export function PesquisaPage({ slug, id, tab }: { slug: string; id: string; tab: PesquisaTab }) {
  const { companyBySlug } = usePainel()
  const company = companyBySlug(slug)
  const [survey, setSurvey] = useState<Survey | null | undefined>(undefined)
  const [responseCount, setResponseCount] = useState<number | null>(null)

  const load = useCallback(() => {
    getSurvey(id)
      .then((s) => setSurvey(s && s.tenantId === slug ? s : null))
      .catch(() => setSurvey(null))
    getSurveyStats([id])
      .then((st) => setResponseCount(st[id]?.total ?? 0))
      .catch(() => setResponseCount(0))
  }, [id, slug])

  useEffect(() => {
    setSurvey(undefined)
    load()
  }, [load])

  if (!company) return null
  if (survey === undefined) return <PageSkeleton />
  if (survey === null) {
    return (
      <EmptyState
        title="Pesquisa não encontrada"
        description="Ela pode ter sido excluída ou pertencer a outra empresa."
        action={
          <Button asChild variant="outline">
            <PainelLink to={paths.empresa(slug, 'pesquisas')}>Ver pesquisas da empresa</PainelLink>
          </Button>
        }
      />
    )
  }

  return <SurveyView key={survey.id} survey={survey} setSurvey={setSurvey} slug={slug} companyLabel={companyName(company, slug)} tab={tab} responseCount={responseCount} setResponseCount={setResponseCount} canalEnabled={company.whistleblower_enabled} />
}

function SurveyView({
  survey,
  setSurvey,
  slug,
  companyLabel,
  tab,
  responseCount,
  setResponseCount,
  canalEnabled,
}: {
  survey: Survey
  setSurvey: (s: Survey) => void
  slug: string
  companyLabel: string
  tab: PesquisaTab
  responseCount: number | null
  setResponseCount: (n: number) => void
  canalEnabled: boolean
}) {
  const isDraft = survey.status === 'rascunho'
  const [draft, setDraft] = useState<Draft>(() => toDraft(survey))
  const [problems, setProblems] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [responses, setResponses] = useState<SurveyResponse[] | null>(null)

  const autosave = useAutosave(
    draft,
    async (d) => {
      await updateSurvey(survey.id, { title: d.title.trim() || survey.title, intro: d.intro, minResponses: d.minResponses, questions: d.questions })
    },
    { enabled: isDraft }
  )

  useEffect(() => {
    if (tab !== 'resultados' || isDraft) return
    setResponses(null)
    getSurveyResponses(survey.id)
      .then(setResponses)
      .catch((err) => {
        setResponses([])
        feedback.error(err instanceof Error ? err.message : 'Não foi possível carregar as respostas.')
      })
  }, [tab, survey.id, isDraft])

  // Revalida enquanto a pessoa corrige os problemas apontados.
  useEffect(() => {
    setProblems((prev) => (prev.length > 0 ? validateQuestions(draft.questions) : prev))
  }, [draft.questions])

  const view: Draft = isDraft ? draft : toDraft(survey)

  const changeStatus = async (next: Survey['status']) => {
    setBusy(true)
    try {
      const updated = await setSurveyStatus(survey.id, next)
      setSurvey(updated)
      logAdminAuditAction({ action: `survey_${next}`, tenantId: slug, details: { survey: survey.id } })
      return updated
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível alterar o status.')
      return null
    } finally {
      setBusy(false)
    }
  }

  const abrir = async () => {
    await autosave.flush()
    const found = validateQuestions(draft.questions)
    if (!draft.title.trim()) found.unshift('Dê um nome à pesquisa.')
    setProblems(found)
    if (found.length > 0) {
      navigate(paths.pesquisa(slug, survey.id))
      return
    }
    const ok = await feedback.confirm({
      title: 'Abrir a pesquisa para respostas?',
      message: `O link passa a funcionar. A partir daqui, as perguntas e o mínimo de ${draft.minResponses} respostas ficam travados, para que todas as pessoas respondam a mesma coisa. Para mudar depois, será preciso duplicar a pesquisa.`,
      confirmLabel: 'Abrir pesquisa',
      cancelLabel: 'Revisar mais',
    })
    if (!ok) return
    if (await changeStatus('aberta')) {
      feedback.success('Pesquisa aberta. Copie o link para divulgar.')
      navigate(paths.pesquisa(slug, survey.id, 'compartilhar'))
    }
  }

  const encerrar = async () => {
    const ok = await feedback.confirm({
      title: 'Encerrar a pesquisa?',
      message: 'O link para de aceitar respostas e mostra “pesquisa encerrada”. As respostas recebidas continuam disponíveis. Você pode reabrir depois.',
      confirmLabel: 'Encerrar',
      cancelLabel: 'Cancelar',
    })
    if (ok && (await changeStatus('encerrada'))) feedback.success('Pesquisa encerrada.')
  }

  const reabrir = async () => {
    const ok = await feedback.confirm({
      title: 'Reabrir a pesquisa?',
      message: 'O mesmo link volta a aceitar respostas, com as mesmas perguntas.',
      confirmLabel: 'Reabrir',
      cancelLabel: 'Cancelar',
    })
    if (ok && (await changeStatus('aberta'))) feedback.success('Pesquisa reaberta.')
  }

  const duplicar = async () => {
    setBusy(true)
    try {
      const copy = await createSurvey({
        tenantId: slug,
        title: `${view.title} (cópia)`.slice(0, 120),
        intro: view.intro,
        questions: view.questions,
        templateId: survey.templateId,
        minResponses: view.minResponses,
      })
      logAdminAuditAction({ action: 'survey_duplicated', tenantId: slug, details: { from: survey.id, survey: copy.id } })
      feedback.success('Cópia criada como rascunho.')
      navigate(paths.pesquisa(slug, copy.id))
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível duplicar.')
    } finally {
      setBusy(false)
    }
  }

  const salvarModelo = async () => {
    const name = await feedback.promptText({
      title: 'Salvar como modelo',
      message: 'O modelo fica disponível para criar pesquisas em qualquer empresa.',
      defaultValue: view.title.replace(/\s*\d{4}$/, ''),
      placeholder: 'Nome do modelo',
      confirmLabel: 'Salvar modelo',
    })
    if (!name?.trim()) return
    try {
      const t = await createSurveyTemplate({ name, intro: view.intro, questions: view.questions })
      logAdminAuditAction({ action: 'survey_template_created', details: { template: t.id, from: survey.id } })
      feedback.success('Modelo salvo em Modelos de pesquisa.')
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível salvar o modelo.')
    }
  }

  const excluir = async () => {
    const total = responseCount ?? 0
    const ok = await feedback.confirm({
      title: 'Excluir pesquisa',
      message: total > 0 ? `Excluir “${view.title}” e as ${total} respostas recebidas? Esta ação não pode ser desfeita.` : `Excluir “${view.title}”? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
    })
    if (!ok) return
    try {
      await deleteSurvey(survey.id)
      logAdminAuditAction({ action: 'survey_deleted', tenantId: slug, details: { survey: survey.id, responses: total } })
      feedback.success('Pesquisa excluída.')
      navigate(paths.empresa(slug, 'pesquisas'), { replace: true })
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível excluir.')
    }
  }

  const apagarRespostas = async () => {
    const ok = await feedback.confirm({
      title: 'Apagar todas as respostas',
      message: `Apagar as ${responses?.length ?? 0} respostas desta pesquisa? Útil para limpar testes antes de divulgar. Esta ação não pode ser desfeita.`,
      confirmLabel: 'Apagar',
      cancelLabel: 'Cancelar',
    })
    if (!ok) return
    try {
      await deleteSurveyResponses(survey.id)
      logAdminAuditAction({ action: 'survey_responses_deleted', tenantId: slug, details: { survey: survey.id, total: responses?.length ?? 0 } })
      setResponses([])
      setResponseCount(0)
      feedback.success('Respostas apagadas.')
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível apagar.')
    }
  }

  const st = SURVEY_STATUS[survey.status]
  const tabs = [
    { label: 'Perguntas', to: paths.pesquisa(slug, survey.id), active: tab === 'perguntas', count: view.questions.length },
    { label: 'Compartilhar', to: paths.pesquisa(slug, survey.id, 'compartilhar'), active: tab === 'compartilhar' },
    { label: 'Resultados', to: paths.pesquisa(slug, survey.id, 'resultados'), active: tab === 'resultados', count: isDraft ? undefined : (responseCount ?? undefined) },
  ]

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Empresas', to: paths.empresas() },
          { label: companyLabel, to: paths.empresa(slug) },
          { label: 'Pesquisas', to: paths.empresa(slug, 'pesquisas') },
          { label: view.title || 'Sem nome' },
        ]}
        title={view.title || 'Sem nome'}
        meta={
          <>
            <StatusPill tone={st.tone}>{st.label}</StatusPill>
            {isDraft && (
              <span className={autosave.status === 'error' ? 'text-xs text-[var(--color-error-700)]' : 'text-xs text-[var(--color-brand-600)]'} aria-live="polite">
                {autosave.status === 'error' ? autosave.error : autosaveLabel(autosave.status)}
              </span>
            )}
          </>
        }
        description={
          survey.status === 'aberta' && survey.openedAt
            ? `Aberta em ${formatDateBR(survey.openedAt)}. As perguntas estão travadas.`
            : survey.status === 'encerrada' && survey.closedAt
              ? `Encerrada em ${formatDateBR(survey.closedAt)}.`
              : 'Rascunho: ajuste as perguntas e abra quando estiver pronta. Tudo é salvo automaticamente.'
        }
        actions={
          <>
            {survey.status !== 'encerrada' && (
              <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
                <Eye />
                Pré-visualizar
              </Button>
            )}
            {survey.status === 'rascunho' && (
              <Button type="button" onClick={abrir} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Play />}
                Abrir pesquisa
              </Button>
            )}
            {survey.status === 'aberta' && (
              <Button type="button" variant="outline" onClick={encerrar} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Lock />}
                Encerrar pesquisa
              </Button>
            )}
            {survey.status === 'encerrada' && (
              <Button type="button" onClick={reabrir} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <LockOpen />}
                Reabrir pesquisa
              </Button>
            )}
            <MoreMenu onDuplicate={duplicar} onSaveTemplate={salvarModelo} onDelete={excluir} />
          </>
        }
      />

      <TabNav label="Seções da pesquisa" items={tabs} />

      {tab === 'perguntas' && (
        <div className="space-y-6">
          {problems.length > 0 && (
            <Notice tone="danger">
              <p className="font-semibold">Ajuste antes de abrir:</p>
              <ul className="mt-1 list-disc pl-5">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Notice>
          )}
          {isDraft ? (
            <>
              <Panel title="Sobre a pesquisa">
                <div className="grid gap-5 lg:grid-cols-[1fr_14rem]">
                  <Field label="Nome" htmlFor="pesquisa-nome">
                    <input id="pesquisa-nome" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value.slice(0, 120) }))} className={inputCls} />
                  </Field>
                  <Field label="Mínimo para mostrar resultados" htmlFor="pesquisa-minimo" hint="Abaixo disso os resultados ficam ocultos, para proteger o anonimato.">
                    <select id="pesquisa-minimo" value={draft.minResponses} onChange={(e) => setDraft((d) => ({ ...d, minResponses: Number(e.target.value) }))} className={inputCls}>
                      {MIN_RESPONSES_CHOICES.map((n) => (
                        <option key={n} value={n}>
                          {n} respostas
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Texto de abertura" htmlFor="pesquisa-intro" className="lg:col-span-2" hint="Aparece antes da primeira pergunta. Linha em branco separa parágrafos; *entre asteriscos* fica em negrito.">
                    <textarea id="pesquisa-intro" value={draft.intro} onChange={(e) => setDraft((d) => ({ ...d, intro: e.target.value.slice(0, 1500) }))} rows={3} className={cn(inputCls, 'resize-y')} />
                  </Field>
                </div>
              </Panel>
              <QuestionEditor questions={draft.questions} onChange={(questions) => setDraft((d) => ({ ...d, questions }))} />
            </>
          ) : (
            <>
              <Notice
                tone="neutral"
                action={
                  <Button type="button" variant="outline" size="sm" onClick={duplicar} disabled={busy}>
                    <CopyPlus />
                    Duplicar
                  </Button>
                }
              >
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0" aria-hidden />
                  Perguntas travadas desde a abertura, para que todos respondam a mesma coisa. Para mudar, duplique a pesquisa.
                </span>
              </Notice>
              {view.intro && (
                <Panel title="Texto de abertura">
                  <IntroText text={view.intro} className="max-w-[75ch] text-sm text-[var(--color-brand-800)]" />
                  <p className="mt-3 text-xs text-[var(--color-brand-600)]">Resultados aparecem a partir de {view.minResponses} respostas.</p>
                </Panel>
              )}
              <QuestionList questions={view.questions} />
            </>
          )}
        </div>
      )}

      {tab === 'compartilhar' && (
        <SharePanel
          title="Link da pesquisa"
          description="Envie para os colaboradores. Ninguém precisa de login, e a resposta é anônima."
          url={surveyPublicUrl(survey.id)}
          fileName={`qrcode-pesquisa-${slug}`}
          emailSubject={view.title}
          emailIntro={`Olá! Convidamos você a responder a pesquisa “${view.title}”. É anônima e leva poucos minutos:`}
          unavailableReason={
            survey.status === 'rascunho'
              ? 'A pesquisa ainda é rascunho: o link só funciona depois que você clicar em “Abrir pesquisa”.'
              : survey.status === 'encerrada'
                ? 'A pesquisa está encerrada: quem abrir o link verá “pesquisa encerrada”.'
                : null
          }
        />
      )}

      {tab === 'resultados' &&
        (isDraft ? (
          <Panel>
            <EmptyState title="Ainda é rascunho" description="Os resultados aparecem aqui depois que a pesquisa for aberta e as pessoas responderem." />
          </Panel>
        ) : responses === null ? (
          <PageSkeleton />
        ) : (
          <SurveyResults
            questions={view.questions}
            responses={responses}
            minResponses={view.minResponses}
            status={survey.status}
            title={view.title}
            companyName={companyLabel}
            onDeleteAll={responses.length > 0 ? apagarRespostas : undefined}
            onExported={() => logAdminAuditAction({ action: 'survey_results_exported', tenantId: slug, details: { survey: survey.id, total: responses.length } })}
          />
        ))}

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="right" showCloseButton={false} className="w-full max-w-none gap-0 overflow-y-auto bg-[var(--color-brand-50)] p-0 sm:max-w-3xl">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--border)] bg-white px-6 py-4">
            <div>
              <SheetTitle className="text-base">Pré-visualização</SheetTitle>
              <p className="text-sm text-[var(--color-brand-700)]">É assim que a pessoa vê a pesquisa. Nada é enviado.</p>
            </div>
            <SheetClose asChild>
              <Button type="button" variant="outline" size="sm">
                <X />
                Fechar
              </Button>
            </SheetClose>
          </div>
          <div className="px-4 py-8 sm:px-8">
            {previewOpen && (
              <SurveyRespondent
                preview
                survey={{ id: survey.id, title: view.title || 'Sem nome', intro: view.intro || null, questions: view.questions, orgName: companyLabel, minResponses: view.minResponses }}
                canalHref={canalEnabled ? buildDenunciaUrl(`${window.location.origin}/`, slug, 'hub') : null}
                onSubmit={async () => {}}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function MoreMenu({ onDuplicate, onSaveTemplate, onDelete }: { onDuplicate: () => void; onSaveTemplate: () => void; onDelete: () => void }) {
  const item =
    'flex cursor-pointer select-none items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[var(--color-brand-900)] outline-none data-[highlighted]:bg-[var(--color-brand-50)] [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[var(--color-brand-600)]'
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Mais ações">
          <MoreHorizontal />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-[13rem] rounded-lg border border-[var(--border)] bg-white p-1 shadow-[var(--shadow-md)] motion-safe:animate-[painel-pop_150ms_ease-out]">
          <DropdownMenu.Item className={item} onSelect={onDuplicate}>
            <CopyPlus />
            Duplicar
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onSelect={onSaveTemplate}>
            <BookmarkPlus />
            Salvar como modelo
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />
          <DropdownMenu.Item className={`${item} text-[var(--color-error-700)] data-[highlighted]:bg-[var(--color-error-50)] [&_svg]:text-[var(--color-error-700)]`} onSelect={onDelete}>
            <Trash2 />
            Excluir pesquisa
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
