import { useEffect, useState } from 'react'
import { ChevronRight, ClipboardList, Lock, Plus } from 'lucide-react'
import { getSurveyStats, getSurveys, type Survey, type SurveyStats, type SurveyStatus } from '@/types/pesquisas'
import { usePainel, companyName } from '../PainelContext'
import { navigate, paths } from '../router'
import { Button, EmptyState, Notice, PageHeader, PainelLink, Panel, Skeleton, StatusPill, formatDateBR, formatDayBR, pluralize, type Tone } from '../ui'

export const SURVEY_STATUS: Record<SurveyStatus, { label: string; tone: Tone }> = {
  rascunho: { label: 'Rascunho', tone: 'neutral' },
  aberta: { label: 'Aberta', tone: 'success' },
  encerrada: { label: 'Encerrada', tone: 'warning' },
}

export function surveySubtitle(s: Survey): string {
  const parts = [pluralize(s.questions.length, 'pergunta', 'perguntas')]
  if (s.status === 'rascunho') parts.push(`editada em ${formatDateBR(s.updatedAt)}`)
  if (s.status === 'aberta' && s.openedAt) parts.push(`aberta em ${formatDateBR(s.openedAt)}`)
  if (s.status === 'encerrada' && s.closedAt) parts.push(`encerrada em ${formatDateBR(s.closedAt)}`)
  return parts.join(' · ')
}

export function PesquisasPage({ slug }: { slug: string }) {
  const { companyBySlug, overview } = usePainel()
  const company = companyBySlug(slug)
  const [surveys, setSurveys] = useState<Survey[] | null>(null)
  const [stats, setStats] = useState<Record<string, SurveyStats>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSurveys(null)
    setError(null)
    getSurveys(slug)
      .then(async (list) => {
        setSurveys(list)
        setStats(await getSurveyStats(list.map((s) => s.id)).catch(() => ({})))
      })
      .catch((err) => {
        setSurveys([])
        setError(err instanceof Error ? err.message : 'Não foi possível carregar as pesquisas.')
      })
  }, [slug])

  if (!company) return null
  const name = companyName(company, slug)
  const diag = overview[slug]

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Empresas', to: paths.empresas() }, { label: name, to: paths.empresa(slug) }, { label: 'Pesquisas' }]}
        title="Pesquisas"
        description="O diagnóstico NR-1 e as pesquisas internas desta empresa. Novas pesquisas partem de um modelo e começam como rascunho."
        actions={
          <Button asChild>
            <PainelLink to={paths.pesquisaNova(slug)}>
              <Plus />
              Nova pesquisa
            </PainelLink>
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      )}

      <Panel padded={false}>
        <div className="hidden grid-cols-[minmax(0,1fr)_8rem_7rem_1.5rem] gap-4 border-b border-[var(--border)] px-5 py-2.5 text-xs font-medium text-[var(--color-brand-600)] sm:grid">
          <span>Pesquisa</span>
          <span>Status</span>
          <span className="text-right">Respostas</span>
          <span />
        </div>
        <ul className="divide-y divide-[var(--border)]">
          <Row
            to={paths.diagnostico(slug)}
            title="Diagnóstico NR-1 (HSE-IT)"
            subtitle={
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3" aria-hidden />
                Metodologia travada · coleta contínua
                {diag?.last_submitted_at ? ` · última em ${formatDateBR(diag.last_submitted_at)}` : ''}
              </span>
            }
            status={<StatusPill tone={company.active ? 'success' : 'neutral'}>{company.active ? 'Aberta' : 'Encerrada'}</StatusPill>}
            responses={diag?.submission_count ?? 0}
          />
          {surveys === null &&
            [0, 1].map((i) => (
              <li key={i} className="px-5 py-4">
                <Skeleton className="h-10 w-full" />
              </li>
            ))}
          {surveys?.map((s) => {
            const st = stats[s.id]
            return (
              <Row
                key={s.id}
                to={paths.pesquisa(slug, s.id)}
                title={s.title}
                subtitle={st?.lastOn ? `${surveySubtitle(s)} · última resposta em ${formatDayBR(st.lastOn)}` : surveySubtitle(s)}
                status={<StatusPill tone={SURVEY_STATUS[s.status].tone}>{SURVEY_STATUS[s.status].label}</StatusPill>}
                responses={s.status === 'rascunho' ? null : (st?.total ?? 0)}
              />
            )
          })}
        </ul>
        {surveys !== null && surveys.length === 0 && !error && (
          <div className="border-t border-[var(--border)]">
            <EmptyState
              icon={<ClipboardList className="h-6 w-6" />}
              title="Crie a primeira pesquisa interna"
              description="Parta de um modelo pronto, como Diversidade e Inclusão, ou de uma pesquisa em branco. Você revisa as perguntas antes de abrir."
              action={
                <Button asChild>
                  <PainelLink to={paths.pesquisaNova(slug)}>
                    <Plus />
                    Nova pesquisa
                  </PainelLink>
                </Button>
              }
            />
          </div>
        )}
      </Panel>
    </>
  )
}

function Row({ to, title, subtitle, status, responses }: { to: string; title: string; subtitle: React.ReactNode; status: React.ReactNode; responses: number | null }) {
  return (
    <li onClick={() => navigate(to)} className="cursor-pointer transition-colors duration-150 hover:bg-[var(--color-brand-50)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_8rem_7rem_1.5rem]">
        <div className="min-w-0">
          <PainelLink to={to} onClick={(e) => e.stopPropagation()} className="block truncate font-semibold text-[var(--color-brand-900)] hover:underline">
            {title}
          </PainelLink>
          <span className="block truncate text-xs text-[var(--color-brand-600)]">{subtitle}</span>
        </div>
        <div>{status}</div>
        <span className="hidden text-right tabular-nums text-[var(--color-brand-800)] sm:block">{responses == null ? '—' : responses}</span>
        <ChevronRight className="hidden h-4 w-4 text-[var(--color-brand-400)] sm:block" aria-hidden />
      </div>
    </li>
  )
}
