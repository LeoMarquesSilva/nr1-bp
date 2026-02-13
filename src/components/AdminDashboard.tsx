import { useState, useEffect } from 'react'
import { ArrowLeft, LogOut, BarChart3, Calendar, Building2, Users, Briefcase, Trash2, Loader2, Building, Link2, Copy, Check, List, RefreshCw, Mail, Ban, RotateCcw, Pencil, Shield, Eye } from 'lucide-react'
import { getSubmissions, getTenantList, getTenantRegistry, getTenantOverview, addTenantToRegistry, updateTenantRegistry, deleteTenantFromRegistry, deleteSubmission, type Submission, type TenantOverviewItem, type TenantRegistryItem } from '../types/submission'
import { getWhistleblowerReports, markWhistleblowerReportRead, type WhistleblowerReport } from '../types/whistleblower'
import { logoutAdmin } from '../lib/adminAuth'
import { computeDimensionScores, aggregateDimensionScores } from '../data/hseIt'
import { GraficosResultados } from './GraficosResultados'
import { Resultados } from './Resultados'

type Props = {
  onClose: () => void
  onLogout: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminDashboard({ onClose, onLogout }: Props) {
  const [tenantList, setTenantList] = useState<string[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Submission | null>(null)
  const [linkSlug, setLinkSlug] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [overviewList, setOverviewList] = useState<TenantOverviewItem[]>([])
  const [registryList, setRegistryList] = useState<TenantRegistryItem[]>([])
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [addingSlug, setAddingSlug] = useState<string | null>(null)
  const [togglingTenant, setTogglingTenant] = useState<string | null>(null)
  const [removingTenant, setRemovingTenant] = useState<string | null>(null)
  const [reports, setReports] = useState<WhistleblowerReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [adminTab, setAdminTab] = useState<'diagnostico' | 'denuncias'>('diagnostico')

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname || '/'}`.replace(/\?.*$/, '') : ''
  const generatedLink = linkSlug.trim() ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}org=${encodeURIComponent(linkSlug.trim().toLowerCase())}` : ''

  const copyLink = async (url?: string) => {
    const toCopy = url ?? generatedLink
    if (!toCopy) return
    try {
      await navigator.clipboard.writeText(toCopy)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      alert('Não foi possível copiar. Copie o link manualmente.')
    }
  }

  const loadOverview = () => {
    setOverviewLoading(true)
    Promise.all([getTenantRegistry(), getTenantOverview()]).then(([registry, overview]) => {
      setRegistryList(registry)
      setOverviewList(overview)
      setOverviewLoading(false)
    })
  }

  const handleAddToList = async () => {
    const slug = linkSlug.trim().toLowerCase()
    if (!slug) return
    setAddingSlug(slug)
    try {
      await addTenantToRegistry(slug)
      loadOverview()
      setLinkSlug(slug)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível adicionar.')
    } finally {
      setAddingSlug(null)
    }
  }

  const allTenantIds = Array.from(new Set([...registryList.map((r) => r.tenant_id), ...overviewList.map((o) => o.tenant_id)])).sort()
  const overviewByTenant = Object.fromEntries(overviewList.map((o) => [o.tenant_id, o]))
  const registryByTenant = Object.fromEntries(registryList.map((r) => [r.tenant_id, r]))
  const linkForSlug = (slug: string) => `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}org=${encodeURIComponent(slug)}`
  const denunciaLinkForSlug = (slug: string) => `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}org=${encodeURIComponent(slug)}&channel=denuncia`
  const displayNameFor = (tid: string) => registryByTenant[tid]?.display_name?.trim() || tid

  const emailBody = (slug: string, isDenuncia: boolean) => {
    const link = isDenuncia ? denunciaLinkForSlug(slug) : linkForSlug(slug)
    const tipo = isDenuncia ? 'Canal de denúncias (anônimo)' : 'Diagnóstico HSE-IT'
    return encodeURIComponent(
      `Prezado(a),\n\nSegue o link para ${tipo}:\n\n${link}\n\nAtenciosamente.`
    )
  }

  const openEmail = (slug: string, isDenuncia = false) => {
    const body = emailBody(slug, isDenuncia)
    window.location.href = `mailto:?subject=${encodeURIComponent('Link - Diagnóstico')}&body=${body}`
  }

  const handleToggleActive = async (tid: string) => {
    const item = registryByTenant[tid]
    if (!item) return
    setTogglingTenant(tid)
    try {
      await updateTenantRegistry(tid, { active: !item.active })
      loadOverview()
      if (selectedTenantId === tid) loadSubmissions(tid)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível atualizar.')
    } finally {
      setTogglingTenant(null)
    }
  }

  const handleRemoveFromList = async (tid: string) => {
    if (!window.confirm('Remover esta empresa da lista? Os dados já enviados continuarão disponíveis.')) return
    setRemovingTenant(tid)
    try {
      await deleteTenantFromRegistry(tid)
      loadOverview()
      if (selectedTenantId === tid) setSelectedTenantId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível remover.')
    } finally {
      setRemovingTenant(null)
    }
  }

  const handleEditDisplayName = async (tid: string) => {
    const current = registryByTenant[tid]?.display_name ?? tid
    const newName = window.prompt('Nome amigável da empresa:', current)
    if (newName === null) return
    try {
      await updateTenantRegistry(tid, { display_name: newName.trim() || null })
      loadOverview()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível atualizar.')
    }
  }

  const loadReports = (tenantId: string | null) => {
    setReportsLoading(true)
    getWhistleblowerReports(tenantId ?? undefined).then((data) => {
      setReports(data)
      setReportsLoading(false)
    })
  }

  useEffect(() => {
    if (adminTab === 'denuncias') loadReports(selectedTenantId)
  }, [adminTab, selectedTenantId])

  useEffect(() => {
    getTenantList().then((list) => {
      setTenantList(list)
      if (list.length === 1) setSelectedTenantId(list[0])
    })
  }, [])

  const selectableTenantIds = allTenantIds.length > 0 ? allTenantIds : tenantList

  useEffect(() => {
    loadOverview()
  }, [])

  useEffect(() => {
    const interval = setInterval(loadOverview, 30000)
    const onFocus = () => loadOverview()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    if (selectedTenantId && !linkSlug) setLinkSlug(selectedTenantId)
  }, [selectedTenantId])

  const loadSubmissions = (tenantId: string | null) => {
    if (!tenantId) {
      setSubmissions([])
      setLoading(false)
      return
    }
    setLoading(true)
    getSubmissions(tenantId)
      .then((data) => {
        setSubmissions(data)
        setLoading(false)
      })
      .catch(() => {
        setSubmissions([])
        setLoading(false)
      })
  }

  useEffect(() => {
    loadSubmissions(selectedTenantId)
  }, [selectedTenantId])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedTenantId) return
    if (!window.confirm('Excluir este envio? Esta ação não pode ser desfeita.')) return
    try {
      await deleteSubmission(id, selectedTenantId)
      if (selected?.id === id) setSelected(null)
      loadSubmissions(selectedTenantId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível excluir.')
    }
  }

  const handleLogout = () => {
    logoutAdmin()
    onLogout()
  }

  // Dashboard da empresa: agregar todos os envios
  const scoresPorEnvio = submissions.map((s) => computeDimensionScores(s.answers))
  const scoresEmpresa = aggregateDimensionScores(scoresPorEnvio)

  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-2 rounded-xl border bg-card-escritorio px-4 py-2.5 font-semibold text-escritorio shadow-sm transition hover:opacity-90"
            style={{ borderColor: 'rgba(16,31,46,0.2)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao dashboard
          </button>
        </div>
        <Resultados
          answers={selected.answers}
          setor={selected.funcao ? `${selected.setor} · ${selected.funcao}` : selected.setor}
          onVoltar={() => setSelected(null)}
          isAdmin
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-escritorio">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-escritorio opacity-80">
            Selecione a empresa para ver os diagnósticos e gráficos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(selectableTenantIds.length > 0 || tenantList.length > 0) && (
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-escritorio opacity-70" />
              <select
                value={selectedTenantId ?? ''}
                onChange={(e) => setSelectedTenantId(e.target.value || null)}
                className="rounded-xl border border-[rgba(16,31,46,0.2)] bg-white px-4 py-2.5 text-sm font-medium text-escritorio shadow-sm focus:border-[var(--escritorio-dourado)] focus:outline-none focus:ring-2 focus:ring-[var(--escritorio-dourado)]/20"
              >
                <option value="">
                  {selectableTenantIds.length > 1 ? '— Selecione a empresa —' : '— Empresa —'}
                </option>
                {(selectableTenantIds.length ? selectableTenantIds : tenantList).map((tid) => (
                  <option key={tid} value={tid}>
                    {displayNameFor(tid)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-1 rounded-lg border border-[rgba(16,31,46,0.15)] p-0.5">
            <button
              type="button"
              onClick={() => setAdminTab('diagnostico')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${adminTab === 'diagnostico' ? 'bg-[var(--escritorio-dourado)]/20 text-escritorio' : 'text-escritorio/70 hover:bg-white/50'}`}
            >
              Diagnóstico
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('denuncias')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${adminTab === 'denuncias' ? 'bg-[var(--escritorio-dourado)]/20 text-escritorio' : 'text-escritorio/70 hover:bg-white/50'}`}
            >
              Denúncias
            </button>
          </div>
          <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border bg-card-escritorio px-4 py-2.5 font-semibold text-escritorio shadow-sm transition hover:opacity-90"
            style={{ borderColor: 'rgba(16,31,46,0.2)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border bg-card-escritorio px-4 py-2.5 font-semibold text-escritorio shadow-sm transition hover:opacity-90"
            style={{ borderColor: 'rgba(16,31,46,0.2)' }}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          </div>
        </div>
      </div>

      {adminTab === 'diagnostico' && (
        <>
      {/* Gerar link para cliente */}
      <div className="bg-card-escritorio rounded-2xl border border-[rgba(16,31,46,0.08)] p-6 shadow-sm">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-escritorio">
          <Link2 className="h-5 w-5 text-[var(--escritorio-dourado)]" />
          Gerar link para cliente
        </h3>
        <p className="mb-4 text-sm text-escritorio opacity-75">
          Informe o identificador da empresa (ex.: nome ou código). Quem abrir o link não precisará preencher a empresa — as respostas ficarão vinculadas a ela.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={linkSlug}
            onChange={(e) => setLinkSlug(e.target.value)}
            placeholder="ex: empresa-alpha"
            className="rounded-xl border border-[rgba(16,31,46,0.2)] bg-white px-4 py-2.5 text-sm text-escritorio placeholder:opacity-50 focus:border-[var(--escritorio-dourado)] focus:outline-none focus:ring-2 focus:ring-[var(--escritorio-dourado)]/20"
          />
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[rgba(16,31,46,0.1)] bg-[var(--branco-gelo)] px-3 py-2.5">
            <span className="truncate text-sm text-escritorio opacity-90">{generatedLink || '—'}</span>
          </div>
          <button
            type="button"
            onClick={copyLink}
            disabled={!generatedLink}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--escritorio-dourado)] px-4 py-2.5 text-sm font-semibold text-[var(--escritorio-escuro)] transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          >
            {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {linkCopied ? 'Copiado!' : 'Copiar link'}
          </button>
          <button
            type="button"
            onClick={handleAddToList}
            disabled={!linkSlug.trim() || addingSlug !== null}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-[var(--escritorio-dourado)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--escritorio-escuro)] transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--escritorio-dourado)]/10"
          >
            {addingSlug ? <Loader2 className="h-4 w-4 animate-spin" /> : <List className="h-4 w-4" />}
            {addingSlug ? 'Adicionando...' : 'Adicionar à lista'}
          </button>
        </div>
      </div>

      {/* Visão geral: todas as empresas e links */}
      <div className="bg-card-escritorio rounded-2xl border border-[rgba(16,31,46,0.08)] p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-escritorio">
            <List className="h-5 w-5 text-[var(--escritorio-dourado)]" />
            Visão geral
          </h3>
          <button
            type="button"
            onClick={loadOverview}
            disabled={overviewLoading}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-escritorio opacity-80 transition hover:opacity-100 disabled:opacity-50"
            title="Atualizar listagem"
          >
            <RefreshCw className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
        <p className="mb-4 text-sm text-escritorio opacity-75">
          Empresas na lista e respostas recebidas. A listagem atualiza ao receber novas respostas (ou ao clicar em Atualizar).
        </p>
        {overviewLoading && allTenantIds.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--escritorio-dourado)]" />
          </div>
        ) : allTenantIds.length === 0 ? (
          <p className="py-6 text-center text-sm text-escritorio opacity-70">
            Nenhuma empresa na lista. Use &quot;Adicionar à lista&quot; ao gerar um link para aparecer aqui.
          </p>
        ) : (
          <ul className="space-y-2">
            {allTenantIds.map((tid) => {
              const overview = overviewByTenant[tid]
              const registry = registryByTenant[tid]
              const link = linkForSlug(tid)
              const isActive = registry?.active ?? true
              return (
                <li
                  key={tid}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border border-[rgba(16,31,46,0.08)] bg-[var(--branco-gelo)] p-3 sm:gap-4 ${!isActive ? 'opacity-85' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-escritorio">{displayNameFor(tid)}</p>
                      {registry && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditDisplayName(tid)}
                            className="rounded p-1 text-escritorio opacity-50 hover:opacity-100"
                            title="Editar nome"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {!isActive && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Encerrada
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <p className="truncate text-xs text-escritorio opacity-60">{link}</p>
                  </div>
                  {overview ? (
                    <div className="flex items-center gap-3 text-sm text-escritorio opacity-80">
                      <span className="whitespace-nowrap">{overview.submission_count} resposta{overview.submission_count !== 1 ? 's' : ''}</span>
                      {overview.last_submitted_at && (
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(overview.last_submitted_at)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-escritorio opacity-50">Nenhuma resposta ainda</span>
                  )}
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyLink(link)}
                      className="rounded-lg p-2 text-escritorio opacity-70 transition hover:bg-white hover:opacity-100"
                      title="Copiar link diagnóstico"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEmail(tid, false)}
                      className="rounded-lg p-2 text-escritorio opacity-70 transition hover:bg-white hover:opacity-100"
                      title="Enviar por e-mail (diagnóstico)"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyLink(denunciaLinkForSlug(tid))}
                      className="rounded-lg p-2 text-escritorio opacity-70 transition hover:bg-white hover:opacity-100"
                      title="Copiar link do canal de denúncias"
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                    {registry && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(tid)}
                          disabled={togglingTenant === tid}
                          className="rounded-lg p-2 text-escritorio opacity-70 transition hover:bg-white hover:opacity-100 disabled:opacity-50"
                          title={isActive ? 'Encerrar coleta' : 'Reabrir coleta'}
                        >
                          {togglingTenant === tid ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromList(tid)}
                          disabled={removingTenant === tid}
                          className="rounded-lg p-2 text-red-600 opacity-70 transition hover:bg-red-50 hover:opacity-100 disabled:opacity-50"
                          title="Remover da lista"
                        >
                          {removingTenant === tid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => { setSelectedTenantId(tid); setLinkSlug(tid) }}
                      className="rounded-lg bg-[var(--escritorio-dourado)] px-3 py-2 text-sm font-semibold text-[var(--escritorio-escuro)] transition hover:opacity-90"
                    >
                      Ver
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {tenantList.length === 0 && !loading ? (
        <div className="bg-card-escritorio rounded-2xl p-12 text-center shadow-sm">
          <Building className="mx-auto h-12 w-12 text-escritorio opacity-40" />
          <p className="mt-4 font-medium text-escritorio">Nenhuma empresa com dados ainda</p>
          <p className="mt-1 text-sm text-escritorio opacity-75">
            Quando um cliente responder pelo link com <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">?org=nome-da-empresa</code>, ela aparecerá aqui.
          </p>
        </div>
      ) : !selectedTenantId ? (
        <div className="bg-card-escritorio rounded-2xl p-12 text-center shadow-sm">
          <Building className="mx-auto h-12 w-12 text-escritorio opacity-40" />
          <p className="mt-4 font-medium text-escritorio">Selecione uma empresa</p>
          <p className="mt-1 text-sm text-escritorio opacity-75">
            Use o menu acima para escolher qual empresa ver no dashboard.
          </p>
        </div>
      ) : loading ? (
        <div className="bg-card-escritorio flex min-h-[200px] items-center justify-center rounded-2xl p-12 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--escritorio-dourado)]" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-card-escritorio rounded-2xl p-12 text-center shadow-sm">
          <BarChart3 className="mx-auto h-12 w-12 text-escritorio opacity-40" />
          <p className="mt-4 font-medium text-escritorio">Nenhum envio ainda para esta empresa</p>
          <p className="mt-1 text-sm text-escritorio opacity-75">
            Envie ao cliente o link com <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">?org={selectedTenantId}</code> para que as respostas apareçam aqui.
          </p>
        </div>
      ) : (
        <>
          {/* Resumo */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-card-escritorio rounded-xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dourado-light" style={{ color: 'var(--escritorio-dourado)' }}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-escritorio">{submissions.length}</p>
                  <p className="text-sm text-escritorio opacity-75">total de respostas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos da empresa (agregado) */}
          <GraficosResultados scores={scoresEmpresa} />

          {/* Cards de resultado por dimensão (empresa) - opcional, já está nos gráficos */}
          <Resultados
            answers={{}}
            setor="Empresa (agregado)"
            onVoltar={() => {}}
            isAdmin
            scoresOverride={scoresEmpresa}
          />

          {/* Lista de envios (drill-down por setor/função) */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-escritorio">
              Envios por setor e função
            </h3>
            <p className="mb-4 text-sm text-escritorio opacity-80">
              Clique em um envio para ver o mapeamento individual.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {submissions.map((s) => (
                <li key={s.id}>
                  <div className="flex items-stretch gap-2 rounded-xl border bg-card-escritorio shadow-sm transition hover:opacity-95" style={{ borderColor: 'rgba(16,31,46,0.12)' }}>
                    <button
                      type="button"
                      onClick={() => setSelected(s)}
                      className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left transition hover:bg-dourado-light/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dourado-light" style={{ color: 'var(--escritorio-dourado)' }}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-escritorio">{s.setor}</p>
                        {s.funcao ? (
                          <p className="flex items-center gap-1.5 text-xs text-escritorio opacity-80">
                            <Briefcase className="h-3.5 w-3.5" />
                            {s.funcao}
                          </p>
                        ) : null}
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-escritorio opacity-60">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(s.submittedAt)}
                        </p>
                      </div>
                      <BarChart3 className="h-5 w-5 shrink-0 text-escritorio opacity-50" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, s.id)}
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
        </>
      )}

      {adminTab === 'denuncias' && (
        <div className="bg-card-escritorio rounded-2xl border border-[rgba(16,31,46,0.08)] p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-escritorio">
            <Shield className="h-5 w-5 text-[var(--escritorio-dourado)]" />
            Canal de denúncias
          </h3>
          <p className="mb-4 text-sm text-escritorio opacity-75">
            Selecione a empresa para ver as denúncias recebidas (formulário anônimo). Link do canal: <code className="rounded bg-black/5 px-1 py-0.5 text-xs">?org=slug&channel=denuncia</code>
          </p>
          {(selectableTenantIds.length > 0 || tenantList.length > 0) && (
            <select
              value={selectedTenantId ?? ''}
              onChange={(e) => { const v = e.target.value || null; setSelectedTenantId(v); loadReports(v) }}
              className="mb-4 rounded-xl border border-[rgba(16,31,46,0.2)] bg-white px-4 py-2.5 text-sm text-escritorio"
            >
              <option value="">Todas as empresas</option>
              {(selectableTenantIds.length ? selectableTenantIds : tenantList).map((tid) => (
                <option key={tid} value={tid}>{displayNameFor(tid)}</option>
              ))}
            </select>
          )}
          {reportsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[var(--escritorio-dourado)]" /></div>
          ) : reports.length === 0 ? (
            <p className="py-6 text-center text-sm text-escritorio opacity-70">Nenhuma denúncia registrada.</p>
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => (
                <li key={r.id} className="rounded-xl border border-[rgba(16,31,46,0.08)] bg-[var(--branco-gelo)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-escritorio opacity-60">{displayNameFor(r.tenant_id)} · {formatDate(r.created_at)}</p>
                      {r.category && <p className="mt-1 text-sm font-medium text-escritorio">{r.category}</p>}
                      <p className="mt-2 whitespace-pre-wrap text-sm text-escritorio/90">{r.body}</p>
                    </div>
                    {!r.read_at ? (
                      <button
                        type="button"
                        onClick={() => markWhistleblowerReportRead(r.id).then(() => loadReports(selectedTenantId))}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[rgba(16,31,46,0.2)] px-2 py-1.5 text-xs font-medium text-escritorio"
                      >
                        <Eye className="h-3.5 w-3.5" /> Marcar como lida
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs text-escritorio opacity-50">Lida em {formatDate(r.read_at)}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
