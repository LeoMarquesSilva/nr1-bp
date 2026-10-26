import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { CheckCircle2, Circle, ClipboardList, Lock, Settings, ShieldAlert, Stethoscope } from 'lucide-react'
import { TenantLogoAvatar } from '@/components/TenantLogoAvatar'
import { getSurveys, type Survey } from '@/types/pesquisas'
import { getWhistleblowerReports, type WhistleblowerReport } from '@/types/whistleblower'
import { cn } from '@/lib/utils'
import { usePainel, companyName } from '../PainelContext'
import { paths } from '../router'
import { Button, PageHeader, PainelLink, Panel, Skeleton, StatusPill, formatDateBR, pluralize } from '../ui'

export function EmpresaVisaoGeralPage({ slug }: { slug: string }) {
  const { companyBySlug, overview, unread } = usePainel()
  const company = companyBySlug(slug)
  const [surveys, setSurveys] = useState<Survey[] | null>(null)
  const [surveysError, setSurveysError] = useState(false)
  const [reports, setReports] = useState<WhistleblowerReport[] | null>(null)

  useEffect(() => {
    setSurveys(null)
    setReports(null)
    getSurveys(slug)
      .then(setSurveys)
      .catch(() => {
        setSurveys([])
        setSurveysError(true)
      })
    getWhistleblowerReports(slug).then(setReports)
  }, [slug])

  if (!company) return null
  const name = companyName(company, slug)
  const diag = overview[slug]
  const respostasDiag = diag?.submission_count ?? 0
  const naoLidas = unread[slug] ?? 0
  const abertas = surveys?.filter((s) => s.status === 'aberta') ?? []
  const rascunhos = surveys?.filter((s) => s.status === 'rascunho') ?? []

  const steps = [
    { done: respostasDiag > 0, label: 'Envie o link do diagnóstico NR-1 aos colaboradores', to: paths.diagnostico(slug, 'compartilhar') },
    { done: company.whistleblower_enabled, label: 'Ative e divulgue o canal de denúncias', to: `${paths.empresa(slug, 'denuncias')}?compartilhar=1` },
    { done: (surveys?.length ?? 0) > 0, label: 'Crie a primeira pesquisa interna', to: paths.pesquisaNova(slug) },
  ]
  const showSteps = surveys !== null && respostasDiag === 0 && surveys.length === 0

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Empresas', to: paths.empresas() }, { label: name }]}
        title={
          <span className="flex items-center gap-3">
            <TenantLogoAvatar logoUrl={company.logo_url} label={name} size="lg" rounded="xl" />
            <span className="min-w-0">{name}</span>
          </span>
        }
        description={<span className="font-mono text-xs">{slug}</span>}
        actions={
          <Button asChild variant="outline">
            <PainelLink to={paths.empresa(slug, 'configuracoes')}>
              <Settings />
              Configurações
            </PainelLink>
          </Button>
        }
      />

      <div className="space-y-6">
        {showSteps && (
          <Panel title="Primeiros passos" description="Três ações para colocar a empresa em funcionamento.">
            <ol className="space-y-1">
              {steps.map((s) => (
                <li key={s.label}>
                  <PainelLink to={s.to} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-[var(--color-brand-50)]">
                    {s.done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-success-500)]" aria-label="Concluído" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-[var(--color-brand-300)]" aria-label="Pendente" />
                    )}
                    <span className={cn(s.done ? 'text-[var(--color-brand-600)] line-through' : 'font-medium text-[var(--color-brand-900)]')}>{s.label}</span>
                  </PainelLink>
                </li>
              ))}
            </ol>
          </Panel>
        )}

        <Panel padded={false}>
          <ul className="divide-y divide-[var(--border)]">
            <ModuleRow
              icon={Stethoscope}
              title="Diagnóstico NR-1"
              badge={
                <>
                  <StatusPill tone={company.active ? 'success' : 'neutral'}>{company.active ? 'Coleta aberta' : 'Coleta encerrada'}</StatusPill>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--color-brand-600)]">
                    <Lock className="h-3 w-3" aria-hidden />
                    HSE-IT
                  </span>
                </>
              }
              summary={`${pluralize(respostasDiag, 'resposta', 'respostas')}${diag?.last_submitted_at ? ` · última em ${formatDateBR(diag.last_submitted_at)}` : ''}`}
              actions={
                <>
                  <Button asChild variant="outline" size="sm">
                    <PainelLink to={paths.diagnostico(slug, 'compartilhar')}>Link e QR</PainelLink>
                  </Button>
                  <Button asChild size="sm">
                    <PainelLink to={paths.diagnostico(slug)}>Ver resultados</PainelLink>
                  </Button>
                </>
              }
            />
            <ModuleRow
              icon={ShieldAlert}
              title="Canal de denúncias"
              badge={<StatusPill tone={company.whistleblower_enabled ? 'success' : 'neutral'}>{company.whistleblower_enabled ? 'Ativo' : 'Desativado'}</StatusPill>}
              summary={
                reports === null ? (
                  <Skeleton className="h-4 w-40" />
                ) : naoLidas > 0 ? (
                  <span className="font-semibold text-[var(--color-brand-900)]">
                    {pluralize(naoLidas, 'denúncia não lida', 'denúncias não lidas')} de {reports.length}
                  </span>
                ) : (
                  `${pluralize(reports.length, 'denúncia', 'denúncias')}, nenhuma pendente de leitura`
                )
              }
              actions={
                <>
                  <Button asChild variant="outline" size="sm">
                    <PainelLink to={`${paths.empresa(slug, 'denuncias')}?compartilhar=1`}>Link e QR</PainelLink>
                  </Button>
                  <Button asChild size="sm">
                    <PainelLink to={paths.empresa(slug, 'denuncias')}>Abrir caixa</PainelLink>
                  </Button>
                </>
              }
            />
            <ModuleRow
              icon={ClipboardList}
              title="Pesquisas internas"
              badge={abertas.length > 0 ? <StatusPill tone="success">{pluralize(abertas.length, 'aberta', 'abertas')}</StatusPill> : undefined}
              summary={
                surveys === null ? (
                  <Skeleton className="h-4 w-40" />
                ) : surveysError ? (
                  'Pesquisas indisponíveis: confira se a migração 026 foi aplicada.'
                ) : surveys.length === 0 ? (
                  'Nenhuma pesquisa criada'
                ) : (
                  [
                    pluralize(surveys.length, 'pesquisa', 'pesquisas'),
                    rascunhos.length > 0 ? pluralize(rascunhos.length, 'rascunho', 'rascunhos') : null,
                    `mais recente: ${surveys[0].title}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                )
              }
              actions={
                <>
                  <Button asChild variant="outline" size="sm">
                    <PainelLink to={paths.pesquisaNova(slug)}>Nova pesquisa</PainelLink>
                  </Button>
                  <Button asChild size="sm">
                    <PainelLink to={paths.empresa(slug, 'pesquisas')}>Ver pesquisas</PainelLink>
                  </Button>
                </>
              }
            />
          </ul>
        </Panel>

        <Panel title="Dados da empresa" actions={<PainelLink to={paths.empresa(slug, 'configuracoes')} className="text-sm font-semibold text-[var(--color-brand-700)] hover:underline">Editar</PainelLink>}>
          <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            <Info label="CNPJ principal" value={company.cnpj} mono />
            <Info label="Nicho" value={company.nicho} />
            <Info label="Setores do diagnóstico" value={company.setores?.length ? pluralize(company.setores.length, 'setor', 'setores') : 'Lista padrão'} />
            {company.cnpjs && company.cnpjs.length > 0 && <Info label="Outros CNPJs" value={pluralize(company.cnpjs.length, 'CNPJ', 'CNPJs')} />}
          </dl>
        </Panel>
      </div>
    </>
  )
}

function ModuleRow({
  icon: Icon,
  title,
  badge,
  summary,
  actions,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  badge?: ReactNode
  summary: ReactNode
  actions: ReactNode
}) {
  return (
    <li className="flex flex-wrap items-center gap-4 px-5 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)]" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-[12rem] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-sans text-base font-semibold text-[var(--color-brand-900)]">{title}</h2>
          {badge}
        </div>
        <div className="mt-0.5 text-sm text-[var(--color-brand-700)]">{summary}</div>
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </li>
  )
}

function Info({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-brand-600)]">{label}</dt>
      <dd className={cn('mt-0.5 text-[var(--color-brand-900)]', mono && 'font-mono')}>{value?.trim() || 'Não informado'}</dd>
    </div>
  )
}
