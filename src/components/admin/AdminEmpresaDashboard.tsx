import { useState, useEffect } from 'react'
import { ArrowLeft, Building2, Copy, Check, Link2, Calendar, Loader2, Trash2, Shield, BarChart3, Users, Briefcase, Ban, RotateCcw, Eye } from 'lucide-react'
import {
  getTenantRegistry,
  updateTenantRegistry,
  deleteTenantFromRegistry,
  deleteSubmission,
  getSubmissions,
  type TenantRegistryItem,
  type Submission
} from '@/types/submission'
import {
  getWhistleblowerReports,
  markWhistleblowerReportRead,
  updateWhistleblowerStatus,
  type WhistleblowerReport,
  type WhistleblowerStatus,
  type EvidencePathEntry,
} from '@/types/whistleblower'
import { WhistleblowerEvidenceLinks } from '../WhistleblowerEvidenceLinks'
import { computeDimensionScores, aggregateDimensionScores } from '@/data/hseIt'
import { GraficosResultados } from '../GraficosResultados'
import { Resultados } from '../Resultados'
import { RelatorioConclusao } from '../RelatorioConclusao'
import { formatCnpjDisplay } from '@/lib/masks'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type Props = {
  tenantId: string
  onBack: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatIncidentDateOnly(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function normalizeEvidencePaths(raw: WhistleblowerReport['evidence_paths']): EvidencePathEntry[] {
  if (!raw || !Array.isArray(raw)) return []
  return raw.filter(
    (x): x is EvidencePathEntry =>
      Boolean(x) &&
      typeof x === 'object' &&
      'path' in x &&
      typeof (x as EvidencePathEntry).path === 'string'
  )
}

function cameraLabel(v: string | null | undefined): string {
  if (v === 'sim') return 'Sim'
  if (v === 'nao') return 'Não'
  return v?.trim() || '—'
}

function whistleblowerStatusVariant(status: WhistleblowerStatus | null | undefined): 'pending' | 'resolved' | 'critical' {
  if (status === 'concluida') return 'resolved'
  if (status === 'arquivada') return 'critical'
  return 'pending'
}

/** Agrupa envios pelo mesmo setor e função (uma linha no painel por combinação). */
function groupSubmissionsBySetorFuncao(submissions: Submission[]): Submission[][] {
  const map = new Map<string, Submission[]>()
  for (const s of submissions) {
    const func = (s.funcao ?? '').trim()
    const key = `${s.setor.trim()}|||${func}`
    const list = map.get(key)
    if (list) list.push(s)
    else map.set(key, [s])
  }
  const groups = [...map.values()].map((items) =>
    [...items].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  )
  groups.sort((a, b) => {
    const sa = a[0].setor.localeCompare(b[0].setor, 'pt-BR')
    if (sa !== 0) return sa
    return (a[0].funcao ?? '').localeCompare(b[0].funcao ?? '', 'pt-BR')
  })
  return groups
}

type Tab = 'diagnostico' | 'denuncias' | 'configuracoes'

export function AdminEmpresaDashboard({ tenantId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('diagnostico')
  const [registry, setRegistry] = useState<TenantRegistryItem | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Diagnóstico
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Submission[] | null>(null)

  // Denúncias
  const [reports, setReports] = useState<WhistleblowerReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)

  // Configurações
  const [linkCopied, setLinkCopied] = useState<'diagnostico' | 'denuncia' | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : ''
  const linkDiagnostico = `${baseUrl}?org=${encodeURIComponent(tenantId)}`
  const linkDenuncia = `${baseUrl}?org=${encodeURIComponent(tenantId)}&channel=denuncia`

  const loadBaseData = () => {
    return Promise.all([getTenantRegistry()]).then(([regList]) => {
      const r = regList.find((x) => x.tenant_id === tenantId) ?? null
      setRegistry(r)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadBaseData()
  }, [tenantId])

  useEffect(() => {
    if (activeTab === 'diagnostico') {
      setLoadingSubmissions(true)
      getSubmissions(tenantId).then((data) => {
        setSubmissions(data)
        setLoadingSubmissions(false)
      }).catch(() => {
        setSubmissions([])
        setLoadingSubmissions(false)
      })
    } else if (activeTab === 'denuncias') {
      setReportsLoading(true)
      getWhistleblowerReports(tenantId).then((data) => {
        setReports(data)
        setReportsLoading(false)
      })
    }
  }, [activeTab, tenantId])

  const copyLink = async (url: string, type: 'diagnostico' | 'denuncia') => {
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(type)
      setTimeout(() => setLinkCopied(null), 2000)
    } catch {
      alert('Não foi possível copiar.')
    }
  }

  const handleToggleActive = async () => {
    if (!registry) return
    setToggling(true)
    try {
      await updateTenantRegistry(tenantId, { active: !registry.active })
      await loadBaseData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível atualizar.')
    } finally {
      setToggling(false)
    }
  }

  const handleExcluir = async () => {
    if (!registry) return
    if (!window.confirm(`Excluir "${displayName}" do registro? Os envios já feitos continuam no sistema.`)) return
    setDeleting(true)
    try {
      await deleteTenantFromRegistry(tenantId)
      onBack()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível excluir.')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteGroup = async (e: React.MouseEvent, group: Submission[]) => {
    e.preventDefault()
    e.stopPropagation()
    const label = group[0].funcao?.trim()
      ? `${group[0].setor} · ${group[0].funcao.trim()}`
      : group[0].setor
    const msg =
      group.length === 1
        ? `Excluir esta resposta de "${label}"? Esta ação não pode ser desfeita.`
        : `Excluir as ${group.length} respostas agrupadas em "${label}"? Esta ação não pode ser desfeita.`
    if (!window.confirm(msg)) return
    try {
      for (const s of group) {
        await deleteSubmission(s.id, tenantId)
      }
      const ids = new Set(group.map((s) => s.id))
      setSubmissions((prev) => prev.filter((x) => !ids.has(x.id)))
      setSelectedGroup((g) => (g?.some((s) => ids.has(s.id)) ? null : g))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível excluir.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" aria-label="Carregando" />
      </div>
    )
  }

  const displayName = registry?.display_name?.trim() || tenantId
  const hasRegistry = registry != null
  const isActive = registry?.active ?? true

  if (selectedGroup && selectedGroup.length > 0) {
    const first = selectedGroup[0]
    const setorBase = first.funcao?.trim()
      ? `${first.setor} · ${first.funcao.trim()}`
      : first.setor
    const setorLabel =
      selectedGroup.length > 1
        ? `${setorBase} (média de ${selectedGroup.length} respostas)`
        : setorBase
    const scoresSetor = aggregateDimensionScores(
      selectedGroup.map((s) => computeDimensionScores(s.answers))
    )
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedGroup(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-brand-700)] shadow-[var(--shadow-xs)] transition hover:bg-[var(--color-brand-50)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao dashboard da empresa
          </button>
        </div>
        <GraficosResultados scores={scoresSetor} showCopyChart />
        <Resultados
          answers={{}}
          setor={setorLabel}
          onVoltar={() => setSelectedGroup(null)}
          isAdmin
          scoresOverride={scoresSetor}
        />
        <RelatorioConclusao
          scores={scoresSetor}
          setor={setorBase}
          showCopy
          meta={{
            empresaNome: displayName,
            totalRespostas: selectedGroup.length,
            dataRelatorio: new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
          }}
        />
      </div>
    )
  }

  const scoresPorEnvio = submissions.map((s) => computeDimensionScores(s.answers))
  const scoresEmpresa = aggregateDimensionScores(scoresPorEnvio)
  const submissionGroups = groupSubmissionsBySetorFuncao(submissions)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-brand-700)] shadow-[var(--shadow-xs)] transition hover:bg-[var(--color-brand-50)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
        {!isActive && (
          <Badge variant="pending">Coleta encerrada</Badge>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Header Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-700)] text-white shadow-[var(--shadow-sm)]">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-900)]">{displayName}</h2>
            <p className="text-sm font-mono text-[var(--muted-foreground)]">{tenantId}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl self-start overflow-x-auto bg-[var(--color-brand-100)] p-1">
          <button
            onClick={() => setActiveTab('diagnostico')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === 'diagnostico' ? "bg-white text-[var(--color-brand-900)] shadow-[var(--shadow-xs)]" : "text-[var(--muted-foreground)] hover:text-[var(--color-brand-900)] hover:bg-white/60"
            )}
          >
            <BarChart3 className="h-4 w-4" /> Diagnóstico
          </button>
          <button
            onClick={() => setActiveTab('denuncias')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === 'denuncias' ? "bg-white text-[var(--color-brand-900)] shadow-[var(--shadow-xs)]" : "text-[var(--muted-foreground)] hover:text-[var(--color-brand-900)] hover:bg-white/60"
            )}
          >
            <Shield className="h-4 w-4" /> Denúncias
          </button>
          <button
            onClick={() => setActiveTab('configuracoes')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === 'configuracoes' ? "bg-white text-[var(--color-brand-900)] shadow-[var(--shadow-xs)]" : "text-[var(--muted-foreground)] hover:text-[var(--color-brand-900)] hover:bg-white/60"
            )}
          >
            <Building2 className="h-4 w-4" /> Configurações
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'diagnostico' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {loadingSubmissions ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
            ) : submissions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 font-medium text-slate-900">Nenhum envio ainda para esta empresa</p>
                <p className="mt-1 text-sm text-slate-500">
                  Envie o link de diagnóstico para receber respostas.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{submissions.length}</p>
                        <p className="text-sm text-slate-500">total de respostas</p>
                      </div>
                    </div>
                  </div>
                </div>

                <GraficosResultados scores={scoresEmpresa} showCopyChart />

                <Resultados
                  answers={{}}
                  setor="Empresa (agregado)"
                  onVoltar={() => {}}
                  isAdmin
                  scoresOverride={scoresEmpresa}
                />

                <RelatorioConclusao
                  scores={scoresEmpresa}
                  setor="Empresa (agregado)"
                  showCopy
                  meta={{
                    empresaNome: displayName,
                    totalRespostas: submissions.length,
                    dataRelatorio: new Date().toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }),
                  }}
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-1 text-lg font-semibold text-slate-900">
                    Envios por setor e função
                  </h3>
                  <p className="mb-4 text-sm text-slate-500">
                    Respostas do mesmo setor e função aparecem em um único item; ao abrir, você vê a média agregada.
                  </p>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {submissionGroups.map((group) => {
                      const s = group[0]
                      const count = group.length
                      const groupKey = `${s.setor}|||${(s.funcao ?? '').trim()}`
                      return (
                        <li key={groupKey}>
                          <div className="flex items-stretch gap-2 rounded-xl border border-slate-200 bg-slate-50/80 transition hover:border-slate-300 hover:bg-slate-50">
                            <button
                              type="button"
                              onClick={() => setSelectedGroup(group)}
                              className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200/90 text-slate-700">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900">{s.setor}</p>
                                {s.funcao?.trim() && (
                                  <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                                    {s.funcao.trim()}
                                  </p>
                                )}
                                {count > 1 && (
                                  <p className="mt-1 text-xs font-medium text-violet-700">
                                    {count} respostas · média agregada ao abrir
                                  </p>
                                )}
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                                  {count > 1
                                    ? `Última: ${formatDate(s.submittedAt)}`
                                    : formatDate(s.submittedAt)}
                                </p>
                              </div>
                              <BarChart3 className="h-5 w-5 shrink-0 text-slate-500" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteGroup(e, group)}
                              className="flex shrink-0 items-center rounded-r-xl px-3 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              title={count > 1 ? `Excluir as ${count} respostas deste grupo` : 'Excluir envio'}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'denuncias' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Shield className="h-5 w-5 text-slate-500" />
                Canal de denúncias
              </h3>
              <p className="mb-6 text-sm text-slate-600">
                Acompanhe as denúncias registradas para esta empresa (anônimas ou com identificação).
              </p>
              
              {reportsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
              ) : reports.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Shield className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-900">Nenhuma denúncia registrada.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {reports.map((r) => (
                    <li key={r.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            {r.protocol_id && <span className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{r.protocol_id}</span>}
                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(r.created_at)}</span>
                            {(r.is_anonymous !== false) ? (
                              <Badge variant="neutral">Anônima</Badge>
                            ) : (
                              <Badge variant="pending">Identificada</Badge>
                            )}
                            <Badge variant={whistleblowerStatusVariant(r.status ?? 'recebida')}>
                              {(r.status ?? 'recebida').replace('_', ' ')}
                            </Badge>
                          </div>
                          {r.is_anonymous === false && (r.reporter_name || r.reporter_contact) && (
                            <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2 text-sm text-slate-800">
                              <p className="font-semibold text-slate-900">Denunciante</p>
                              {r.reporter_name && <p className="mt-0.5">{r.reporter_name}</p>}
                              {r.reporter_contact && <p className="text-slate-600">{r.reporter_contact}</p>}
                            </div>
                          )}
                          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                            {(r.subject ?? '').trim() !== '' && (
                              <>
                                <dt className="font-medium text-slate-500">Assunto</dt>
                                <dd className="text-slate-900">{r.subject}</dd>
                              </>
                            )}
                            {(r.complaint_category ?? r.category) && (
                              <>
                                <dt className="font-medium text-slate-500">Categoria</dt>
                                <dd className="text-slate-900">{r.complaint_category ?? r.category}</dd>
                              </>
                            )}
                            {r.accused_relationship && (
                              <>
                                <dt className="font-medium text-slate-500">Relação com o denunciado</dt>
                                <dd className="text-slate-900">{r.accused_relationship}</dd>
                              </>
                            )}
                            {r.complainant_gender && (
                              <>
                                <dt className="font-medium text-slate-500">Gênero (declarado)</dt>
                                <dd className="text-slate-900">{r.complainant_gender}</dd>
                              </>
                            )}
                            {r.incident_date && (
                              <>
                                <dt className="font-medium text-slate-500">Data da ocorrência</dt>
                                <dd className="text-slate-900">{formatIncidentDateOnly(r.incident_date)}</dd>
                              </>
                            )}
                            {r.location_has_camera && (
                              <>
                                <dt className="font-medium text-slate-500">Local com câmera</dt>
                                <dd className="text-slate-900">{cameraLabel(r.location_has_camera)}</dd>
                              </>
                            )}
                          </dl>
                          <div className="mt-2 rounded-lg bg-white border border-slate-100 p-4">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Descrição</p>
                            <p className="whitespace-pre-wrap text-sm text-slate-700">{r.body}</p>
                          </div>
                          <WhistleblowerEvidenceLinks items={normalizeEvidencePaths(r.evidence_paths)} />
                          
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <label className="text-sm font-medium text-slate-700">Status da denúncia:</label>
                            <select
                              value={r.status ?? 'recebida'}
                              onChange={(e) => {
                                const s = e.target.value as WhistleblowerStatus
                                updateWhistleblowerStatus(r.id, s).then(() => {
                                  setReports(reports.map(rep => rep.id === r.id ? { ...rep, status: s } : rep))
                                })
                              }}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                              <option value="recebida">Recebida</option>
                              <option value="em_analise">Em análise</option>
                              <option value="concluida">Concluída</option>
                              <option value="arquivada">Arquivada</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {!r.read_at ? (
                            <button
                              type="button"
                              onClick={() => {
                                markWhistleblowerReportRead(r.id).then(() => {
                                  setReports(reports.map(rep => rep.id === r.id ? { ...rep, read_at: new Date().toISOString() } : rep))
                                })
                              }}
                              className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
                            >
                              <Eye className="h-4 w-4" /> Marcar como lida
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                              <Check className="h-3.5 w-3.5" /> Lida em {formatDate(r.read_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'configuracoes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-semibold text-slate-900">Dados da Empresa</h3>
              <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Nome de exibição</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{displayName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Identificador (slug)</dt>
                  <dd className="mt-1 font-mono text-sm bg-slate-50 px-2 py-1 rounded inline-block text-slate-900">{tenantId}</dd>
                </div>
                {hasRegistry && registry.cnpj && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">CNPJ principal</dt>
                    <dd className="mt-1 font-mono text-sm bg-slate-50 px-2 py-1 rounded inline-block text-slate-900">
                      {registry.cnpj.replace(/\D/g, '').length === 14 ? formatCnpjDisplay(registry.cnpj) : registry.cnpj}
                    </dd>
                  </div>
                )}
                {hasRegistry && registry.cnpjs && registry.cnpjs.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Outros CNPJs</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {registry.cnpjs.map((c, i) => (
                        <span key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-sm text-slate-700">
                          {c.replace(/\D/g, '').length === 14 ? formatCnpjDisplay(c) : c}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {hasRegistry && registry.nicho && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Nicho</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded-full inline-block">{registry.nicho}</dd>
                  </div>
                )}
                {hasRegistry && registry.setores && registry.setores.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Setores (formulário de diagnóstico)</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {registry.setores.map((s, i) => (
                        <span key={i} className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Link2 className="h-5 w-5 text-slate-500" />
                Links para o cliente
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-slate-900">Diagnóstico de riscos psicossociais</p>
                    <div className="flex flex-col gap-2">
                      <code className="text-xs text-slate-600 break-all bg-white p-2 rounded border border-slate-200">{linkDiagnostico}</code>
                      <button
                        type="button"
                        onClick={() => copyLink(linkDiagnostico, 'diagnostico')}
                        className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        {linkCopied === 'diagnostico' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {linkCopied === 'diagnostico' ? 'Copiado!' : 'Copiar link'}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-slate-900">Canal de Denúncias</p>
                    <div className="flex flex-col gap-2">
                      <code className="text-xs text-slate-600 break-all bg-white p-2 rounded border border-slate-200">{linkDenuncia}</code>
                      <button
                        type="button"
                        onClick={() => copyLink(linkDenuncia, 'denuncia')}
                        className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        {linkCopied === 'denuncia' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {linkCopied === 'denuncia' ? 'Copiado!' : 'Copiar link'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {hasRegistry && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Ações</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={handleToggleActive}
                    disabled={toggling}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50",
                      isActive 
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" 
                        : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    )}
                  >
                    {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                    {isActive ? 'Encerrar coleta de dados' : 'Reabrir coleta de dados'}
                  </button>

                  <button
                    type="button"
                    onClick={handleExcluir}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Excluir empresa do registro
                  </button>
                </div>
                <p className="mt-3 text-sm text-slate-500 max-w-2xl">
                  Ao excluir do registro, a empresa não aparecerá mais nas listas do painel. Os diagnósticos e denúncias já enviados <strong>permanecem no banco de dados</strong>.
                </p>
              </div>
            )}

            {!hasRegistry && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
                Esta empresa ainda não está no registro. Use a página <strong>Empresas</strong> para cadastrá-la e definir CNPJ, nicho e setores.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
