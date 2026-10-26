import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Inbox, Link2, ShieldAlert } from 'lucide-react'
import {
  getWhistleblowerReports,
  markWhistleblowerReportRead,
  updateWhistleblowerStatus,
  type EvidencePathEntry,
  type WhistleblowerReport,
  type WhistleblowerStatus,
} from '@/types/whistleblower'
import { logAdminAuditAction } from '@/services/api/audit'
import { buildDenunciaUrl } from '@/lib/routes'
import { feedback } from '@/lib/feedback'
import { cn } from '@/lib/utils'
import { WhistleblowerEvidenceLinks } from '@/components/WhistleblowerEvidenceLinks'
import { usePainel, companyName } from '../PainelContext'
import { paths, setSearchParam, useSearchParam } from '../router'
import { SharePanel } from '../SharePanel'
import { Button, EmptyState, PageHeader, PainelLink, Panel, Skeleton, StatusPill, formatDateTimeBR, inputCls, type Tone } from '../ui'

const STATUS: { key: WhistleblowerStatus; label: string; tone: Tone }[] = [
  { key: 'recebida', label: 'Recebida', tone: 'warning' },
  { key: 'em_analise', label: 'Em análise', tone: 'info' },
  { key: 'concluida', label: 'Concluída', tone: 'success' },
  { key: 'arquivada', label: 'Arquivada', tone: 'neutral' },
]

const statusInfo = (s: WhistleblowerStatus | null | undefined) => STATUS.find((x) => x.key === (s ?? 'recebida')) ?? STATUS[0]

function formatIncidentDate(value: string | null | undefined): string | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR')
}

function evidence(raw: WhistleblowerReport['evidence_paths']): EvidencePathEntry[] {
  return Array.isArray(raw) ? raw.filter((x): x is EvidencePathEntry => Boolean(x) && typeof x?.path === 'string') : []
}

/** Caixa de denúncias. Com `slug`, mostra só a empresa; sem, consolida todas. */
export function DenunciasPage({ slug }: { slug?: string }) {
  const { companyBySlug, companies, reloadUnread } = usePainel()
  const [reports, setReports] = useState<WhistleblowerReport[] | null>(null)
  const [statusFilter, setStatusFilter] = useState<WhistleblowerStatus | 'todas'>('todas')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [companyFilter, setCompanyFilter] = useState('')
  const casoId = useSearchParam('caso')
  const showShare = useSearchParam('compartilhar') === '1'
  const company = slug ? companyBySlug(slug) : undefined

  useEffect(() => {
    setReports(null)
    getWhistleblowerReports(slug).then(setReports)
  }, [slug])

  const filtered = useMemo(
    () =>
      (reports ?? []).filter(
        (r) =>
          (statusFilter === 'todas' || (r.status ?? 'recebida') === statusFilter) &&
          (!onlyUnread || !r.read_at) &&
          (!companyFilter || r.tenant_id === companyFilter)
      ),
    [reports, statusFilter, onlyUnread, companyFilter]
  )
  const selected = reports?.find((r) => r.id === casoId) ?? null

  // Abrir o caso marca como lido.
  useEffect(() => {
    if (!selected || selected.read_at) return
    const readAt = new Date().toISOString()
    markWhistleblowerReportRead(selected.id).then(() => {
      setReports((prev) => prev?.map((r) => (r.id === selected.id ? { ...r, read_at: readAt } : r)) ?? prev)
      reloadUnread()
    })
  }, [selected, reloadUnread])

  const changeStatus = async (r: WhistleblowerReport, status: WhistleblowerStatus) => {
    await updateWhistleblowerStatus(r.id, status)
    logAdminAuditAction({ action: 'whistleblower_status_changed', tenantId: r.tenant_id, details: { protocol: r.protocol_id, status } })
    setReports((prev) => prev?.map((x) => (x.id === r.id ? { ...x, status } : x)) ?? prev)
    feedback.success(`Status alterado para “${statusInfo(status).label}”.`)
  }

  const countBy = (s: WhistleblowerStatus) => (reports ?? []).filter((r) => (r.status ?? 'recebida') === s).length
  const name = company ? companyName(company, slug!) : null
  const unreadCount = (reports ?? []).filter((r) => !r.read_at).length

  return (
    <>
      <PageHeader
        breadcrumbs={slug ? [{ label: 'Empresas', to: paths.empresas() }, { label: name ?? slug, to: paths.empresa(slug) }, { label: 'Denúncias' }] : undefined}
        title={slug ? 'Denúncias' : 'Todas as denúncias'}
        meta={company && <StatusPill tone={company.whistleblower_enabled ? 'success' : 'neutral'}>{company.whistleblower_enabled ? 'Canal ativo' : 'Canal desativado'}</StatusPill>}
        description={slug ? 'Relatos recebidos pelo canal desta empresa. Abrir um caso marca como lido.' : 'Relatos de todas as empresas em uma caixa só. Abrir um caso marca como lido.'}
        actions={
          slug && (
            <Button type="button" variant="outline" onClick={() => setSearchParam('compartilhar', showShare ? null : '1', { replace: true })} aria-expanded={showShare}>
              <Link2 />
              {showShare ? 'Ocultar link do canal' : 'Link e QR do canal'}
            </Button>
          )
        }
      />

      {slug && showShare && company && (
        <div className="mb-6">
          <SharePanel
            title="Link do canal de denúncias"
            description="Divulgue na intranet, murais e e-mails. O relato pode ser anônimo e é acompanhado por protocolo."
            url={buildDenunciaUrl(`${window.location.origin}/`, slug, 'hub')}
            fileName={`qrcode-canal-${slug}`}
            emailSubject={`Canal de denúncias — ${name}`}
            emailIntro="Este é o canal de denúncias da empresa. Você pode relatar de forma anônima e acompanhar pelo protocolo:"
            unavailableReason={company.whistleblower_enabled ? null : 'O canal está desativado: quem abrir o link verá “Canal indisponível”. Ative em Configurações.'}
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterChip active={statusFilter === 'todas'} onClick={() => setStatusFilter('todas')} label="Todas" count={reports?.length} />
        {STATUS.map((s) => (
          <FilterChip key={s.key} active={statusFilter === s.key} onClick={() => setStatusFilter(s.key)} label={s.label} count={reports ? countBy(s.key) : undefined} />
        ))}
        <span className="mx-1 hidden h-5 w-px bg-[var(--border)] sm:block" aria-hidden />
        <FilterChip active={onlyUnread} onClick={() => setOnlyUnread((v) => !v)} label="Não lidas" count={reports ? unreadCount : undefined} />
        {!slug && (companies?.length ?? 0) > 1 && (
          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} aria-label="Filtrar por empresa" className={cn(inputCls, 'ml-auto w-auto min-w-[12rem]')}>
            <option value="">Todas as empresas</option>
            {companies?.map((c) => (
              <option key={c.tenant_id} value={c.tenant_id}>
                {companyName(c, c.tenant_id)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Panel padded={false} className={cn(selected && 'hidden lg:block')}>
          {reports === null ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title={reports.length === 0 ? 'Nenhuma denúncia recebida' : 'Nada com esses filtros'}
              description={reports.length === 0 ? 'Quando alguém usar o canal, o relato aparece aqui com protocolo e status.' : 'Ajuste os filtros acima para ver outros casos.'}
            />
          ) : (
            <ul className="max-h-[70vh] divide-y divide-[var(--border)] overflow-y-auto">
              {filtered.map((r) => {
                const st = statusInfo(r.status)
                const isSel = r.id === casoId
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setSearchParam('caso', r.id)}
                      aria-current={isSel ? 'true' : undefined}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]',
                        isSel ? 'bg-[var(--color-brand-100)]' : 'hover:bg-[var(--color-brand-50)]'
                      )}
                    >
                      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', r.read_at ? 'bg-transparent' : 'bg-[var(--color-info-500)]')} aria-label={r.read_at ? undefined : 'Não lida'} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={cn('truncate text-sm', r.read_at ? 'text-[var(--color-brand-800)]' : 'font-semibold text-[var(--color-brand-900)]')}>
                            {r.subject?.trim() || r.complaint_category || r.category || 'Sem assunto'}
                          </span>
                          <StatusPill tone={st.tone}>{st.label}</StatusPill>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-[var(--color-brand-600)]">
                          <span className="font-mono">{r.protocol_id ?? '—'}</span> · {formatDateTimeBR(r.created_at)}
                          {!slug && ` · ${companyName(companyBySlug(r.tenant_id), r.tenant_id)}`}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <div className={cn(!selected && 'hidden lg:block')}>
          {selected ? (
            <CaseDetail report={selected} showCompany={!slug} onStatus={(s) => changeStatus(selected, s)} />
          ) : (
            <Panel className="h-full">
              <EmptyState icon={<ShieldAlert className="h-6 w-6" />} title="Selecione um caso" description="O relato completo, as evidências e o status aparecem aqui." />
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        active
          ? 'border-[var(--color-brand-700)] bg-[var(--color-brand-700)] text-white'
          : 'border-[var(--border)] bg-white text-[var(--color-brand-800)] hover:border-[var(--color-brand-300)]'
      )}
    >
      {label}
      {count != null && <span className={cn('tabular-nums', active ? 'text-[var(--color-brand-200)]' : 'text-[var(--color-brand-600)]')}>{count}</span>}
    </button>
  )
}

function CaseDetail({ report: r, showCompany, onStatus }: { report: WhistleblowerReport; showCompany: boolean; onStatus: (s: WhistleblowerStatus) => void }) {
  const { companyBySlug } = usePainel()
  const anon = r.is_anonymous !== false
  const fields: [string, string | null | undefined][] = [
    ['Categoria', r.complaint_category ?? r.category],
    ['Relação com o denunciado', r.accused_relationship],
    ['Gênero declarado', r.complainant_gender],
    ['Data da ocorrência', formatIncidentDate(r.incident_date)],
    ['Local com câmera', r.location_has_camera === 'sim' ? 'Sim' : r.location_has_camera === 'nao' ? 'Não' : r.location_has_camera],
  ]
  return (
    <Panel padded={false}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="min-w-0">
          <Button type="button" variant="ghost" size="sm" className="-ml-2 mb-1 lg:hidden" onClick={() => setSearchParam('caso', null)}>
            <ArrowLeft />
            Voltar à lista
          </Button>
          <p className="font-mono text-sm font-bold tracking-wider text-[var(--color-brand-900)]">{r.protocol_id ?? 'Sem protocolo'}</p>
          <h2 className="mt-1 font-sans text-lg font-semibold text-[var(--color-brand-900)]">{r.subject?.trim() || 'Sem assunto'}</h2>
          <p className="mt-1 text-sm text-[var(--color-brand-700)]">
            Recebida em {formatDateTimeBR(r.created_at)}
            {showCompany && (
              <>
                {' · '}
                <PainelLink to={paths.empresa(r.tenant_id, 'denuncias')} className="font-medium underline-offset-2 hover:underline">
                  {companyName(companyBySlug(r.tenant_id), r.tenant_id)}
                </PainelLink>
              </>
            )}
          </p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-[var(--color-brand-600)]">Status</span>
          <select value={r.status ?? 'recebida'} onChange={(e) => onStatus(e.target.value as WhistleblowerStatus)} className={cn(inputCls, 'w-auto')}>
            {STATUS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="space-y-5 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone={anon ? 'neutral' : 'info'}>{anon ? 'Anônima' : 'Identificada'}</StatusPill>
          {r.read_at && <span className="text-xs text-[var(--color-brand-600)]">Lida em {formatDateTimeBR(r.read_at)}</span>}
        </div>
        {!anon && (r.reporter_name || r.reporter_contact) && (
          <div className="rounded-lg bg-[var(--color-info-50)] px-4 py-3 text-sm">
            <p className="text-xs font-medium text-[var(--color-info-700)]">Denunciante</p>
            {r.reporter_name && <p className="mt-0.5 text-[var(--color-brand-900)]">{r.reporter_name}</p>}
            {r.reporter_contact && <p className="text-[var(--color-brand-700)]">{r.reporter_contact}</p>}
          </div>
        )}
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {fields
            .filter(([, v]) => v && String(v).trim())
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-[var(--color-brand-600)]">{k}</dt>
                <dd className="mt-0.5 text-[var(--color-brand-900)]">{v}</dd>
              </div>
            ))}
        </dl>
        <div>
          <p className="mb-1.5 text-xs text-[var(--color-brand-600)]">Relato</p>
          <p className="max-w-[75ch] whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-brand-900)]">{r.body}</p>
        </div>
        <WhistleblowerEvidenceLinks items={evidence(r.evidence_paths)} />
      </div>
    </Panel>
  )
}
