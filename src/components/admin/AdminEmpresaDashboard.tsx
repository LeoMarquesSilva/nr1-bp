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
  type WhistleblowerStatus
} from '@/types/whistleblower'
import { computeDimensionScores, aggregateDimensionScores } from '@/data/hseIt'
import { GraficosResultados } from '../GraficosResultados'
import { Resultados } from '../Resultados'
import { RelatorioConclusao } from '../RelatorioConclusao'
import { formatCnpjDisplay } from '@/lib/masks'
import { cn } from '@/lib/utils'

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

type Tab = 'diagnostico' | 'denuncias' | 'configuracoes'

export function AdminEmpresaDashboard({ tenantId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('diagnostico')
  const [registry, setRegistry] = useState<TenantRegistryItem | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Diagnóstico
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  // Denúncias
  const [reports, setReports] = useState<WhistleblowerReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)

  // Configurações
  const [linkCopied, setLinkCopied] = useState<'diagnostico' | 'denuncia' | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname || '/'}`.replace(/\?.*$/, '') : ''
  const linkDiagnostico = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}org=${encodeURIComponent(tenantId)}`
  const linkDenuncia = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}org=${encodeURIComponent(tenantId)}&channel=denuncia`

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

  const handleDeleteSubmission = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Excluir este envio? Esta ação não pode ser desfeita.')) return
    try {
      await deleteSubmission(id, tenantId)
      if (selectedSubmission?.id === id) setSelectedSubmission(null)
      setSubmissions(submissions.filter(s => s.id !== id))
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

  if (selectedSubmission) {
    const scoresSetor = computeDimensionScores(selectedSubmission.answers)
    const setorLabel = selectedSubmission.funcao
      ? `${selectedSubmission.setor} · ${selectedSubmission.funcao}`
      : selectedSubmission.setor
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedSubmission(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao dashboard da empresa
          </button>
        </div>
        <Resultados
          answers={selectedSubmission.answers}
          setor={setorLabel}
          onVoltar={() => setSelectedSubmission(null)}
          isAdmin
        />
        <RelatorioConclusao
          scores={scoresSetor}
          setor={setorLabel}
          showCopy
          meta={{
            empresaNome: displayName,
            totalRespostas: 1,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
        {!isActive && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
            Coleta encerrada
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Header Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{displayName}</h2>
            <p className="text-sm font-mono text-slate-500">{tenantId}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl self-start overflow-x-auto">
          <button
            onClick={() => setActiveTab('diagnostico')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === 'diagnostico' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <BarChart3 className="h-4 w-4" /> Diagnóstico
          </button>
          <button
            onClick={() => setActiveTab('denuncias')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === 'denuncias' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <Shield className="h-4 w-4" /> Denúncias
          </button>
          <button
            onClick={() => setActiveTab('configuracoes')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === 'configuracoes' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
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
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">
                    Envios por setor e função
                  </h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {submissions.map((s) => (
                      <li key={s.id}>
                        <div className="flex items-stretch gap-2 rounded-xl border border-slate-200 bg-slate-50/50 transition hover:border-slate-300 hover:bg-slate-50">
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(s)}
                            className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900">{s.setor}</p>
                              {s.funcao && (
                                <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  {s.funcao}
                                </p>
                              )}
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(s.submittedAt)}
                              </p>
                            </div>
                            <BarChart3 className="h-5 w-5 shrink-0 text-slate-400" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSubmission(e, s.id)}
                            className="flex shrink-0 items-center rounded-r-xl px-3 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Excluir envio"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    ))}
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
                Acompanhe os relatos anônimos registrados para esta empresa.
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
                          </div>
                          
                          {r.category && <p className="mt-3 text-sm font-semibold text-slate-900">{r.category}</p>}
                          <div className="mt-2 rounded-lg bg-white border border-slate-100 p-4">
                            <p className="whitespace-pre-wrap text-sm text-slate-700">{r.body}</p>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <label className="text-sm font-medium text-slate-700">Status do relato:</label>
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
                    <p className="mb-2 text-sm font-semibold text-slate-900">Diagnóstico (HSE-IT)</p>
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
