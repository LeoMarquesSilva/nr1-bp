import { useState, useEffect } from 'react'
import { ArrowLeft, LogOut, Building2, Trash2, Loader2, Link2, Copy, RefreshCw, Mail, Ban, RotateCcw, Pencil, Shield, QrCode, Download } from 'lucide-react'
import { getTenantRegistry, getTenantOverview, addTenantToRegistry, updateTenantRegistry, deleteTenantFromRegistry, type TenantOverviewItem, type TenantRegistryItem } from '../types/submission'
import { logoutAdmin } from '../lib/adminAuth'
import { getSupabase } from '../lib/supabase'
import { QRCodeCanvas } from 'qrcode.react'

type Props = {
  onClose: () => void
  onLogout: () => void
  /** Quando true (ex.: dentro do AdminLayout), não exibe os botões Voltar ao site e Sair no topo */
  hideHeaderActions?: boolean
  /** Filtro de pesquisa (nome ou slug da empresa) */
  searchQuery?: string
  /** Ação de "Ver" empresa */
  onSelectTenant?: (tenantId: string) => void
}

export function AdminDashboard({ onClose, onLogout, hideHeaderActions, searchQuery = '', onSelectTenant }: Props) {
  const qrLogoSrc = '/logos/elemento-logo-azul.png'
  const qrExportSize = 640
  const qrPreviewSize = 120
  const [overviewList, setOverviewList] = useState<TenantOverviewItem[]>([])
  const [registryList, setRegistryList] = useState<TenantRegistryItem[]>([])
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [togglingTenant, setTogglingTenant] = useState<string | null>(null)
  const [removingTenant, setRemovingTenant] = useState<string | null>(null)
  const [qrTenantId, setQrTenantId] = useState<string | null>(null)
  const [qrMode, setQrMode] = useState<'diagnostico' | 'denuncia'>('diagnostico')

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : ''

  const copyLink = async (url?: string) => {
    const toCopy = url
    if (!toCopy) return
    try {
      await navigator.clipboard.writeText(toCopy)
    } catch {
      alert('Não foi possível copiar. Copie o link manualmente.')
    }
  }

  const loadOverview = () => {
    setOverviewLoading(true)
    return Promise.all([getTenantRegistry(), getTenantOverview()]).then(([registry, overview]) => {
      setRegistryList(registry)
      setOverviewList(overview)
      setOverviewLoading(false)
    })
  }

  // Visão geral: só empresas do registro (ao excluir, some da lista).
  const registryTenantIds = registryList.map((r) => r.tenant_id).sort()
  const overviewByTenant = Object.fromEntries(overviewList.map((o) => [o.tenant_id, o]))
  const registryByTenant = Object.fromEntries(registryList.map((r) => [r.tenant_id, r]))
  const q = searchQuery.trim().toLowerCase()
  const allTenantIds = q
    ? registryTenantIds.filter((tid) => {
        const name = (registryByTenant[tid]?.display_name ?? tid).toLowerCase()
        return name.includes(q) || tid.toLowerCase().includes(q)
      })
    : registryTenantIds
  const overviewOnlyIds = overviewList.map((o) => o.tenant_id).filter((tid) => !registryByTenant[tid]).sort()
  const linkForSlug = (slug: string) => `${baseUrl}?org=${encodeURIComponent(slug)}`
  const denunciaLinkForSlug = (slug: string) => `${baseUrl}?org=${encodeURIComponent(slug)}&channel=denuncia`
  const displayNameFor = (tid: string) => registryByTenant[tid]?.display_name?.trim() || tid

  const emailBody = (slug: string, isDenuncia: boolean) => {
    const link = isDenuncia ? denunciaLinkForSlug(slug) : linkForSlug(slug)
    const tipo = isDenuncia ? 'Canal de denúncias (anônimo)' : 'Diagnóstico de riscos psicossociais'
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
      await loadOverview()
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

  const getQrCanvas = (tid: string): HTMLCanvasElement | null => {
    const el = document.getElementById(`qr-canvas-${tid}`)
    return el instanceof HTMLCanvasElement ? el : null
  }

  const downloadQrImage = (tid: string) => {
    const canvas = getQrCanvas(tid)
    if (!canvas) return
    const href = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = href
    a.download = `qrcode-${tid}-${qrMode}.png`
    a.click()
  }

  const copyQrImage = async (tid: string) => {
    const canvas = getQrCanvas(tid)
    if (!canvas) return
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      alert('Seu navegador não suporta copiar imagem. Use o botão de baixar.')
      return
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) {
      alert('Não foi possível gerar a imagem do QR Code.')
      return
    }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      alert('QR Code copiado como imagem.')
    } catch {
      alert('Não foi possível copiar a imagem. Use o botão de baixar.')
    }
  }

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

  const handleLogout = async () => {
    try {
      await getSupabase().auth.signOut()
    } finally {
      logoutAdmin()
      onLogout()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-900)]">
            Painel de Clientes
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Gerencie as empresas, crie links de acesso e visualize os dashboards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!hideHeaderActions && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 font-medium text-[var(--color-brand-700)] shadow-[var(--shadow-xs)] transition hover:bg-[var(--color-brand-50)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao site
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 font-medium text-[var(--color-brand-700)] shadow-[var(--shadow-xs)] transition hover:bg-[var(--color-brand-50)]"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visão geral: todas as empresas e links */}
      <div className="rounded-2xl border border-[var(--color-brand-200)] bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Building2 className="h-5 w-5 text-slate-500" />
            Empresas
          </h3>
          <button
            type="button"
            onClick={loadOverview}
            disabled={overviewLoading}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            title="Atualizar listagem"
          >
            <RefreshCw className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          Gerencie suas empresas cadastradas. Clique em Ver para acessar o dashboard completo.
        </p>
        
        {overviewLoading && allTenantIds.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : allTenantIds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900">Nenhuma empresa na lista</p>
            <p className="mt-1 text-sm text-slate-500">Use "Adicionar à lista" para incluir novas empresas.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {allTenantIds.map((tid) => {
              const overview = overviewByTenant[tid]
              const registry = registryByTenant[tid]
              const link = linkForSlug(tid)
              const isActive = registry?.active ?? true
              return (
                <li
                  key={tid}
                  className={`flex flex-wrap items-center gap-4 rounded-xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)]/50 p-4 transition-colors hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)] ${!isActive ? 'opacity-85' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900 text-lg">{displayNameFor(tid)}</p>
                      {registry && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditDisplayName(tid)}
                            className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-900"
                            title="Editar nome"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {!isActive && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                              Encerrada
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500 font-mono">{link}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 px-4 border-l border-r border-slate-200">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{overview?.submission_count || 0}</p>
                      <p className="text-xs text-slate-500">Respostas</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copyLink(link)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                      title="Gerar/Copiar link diagnóstico"
                    >
                      <Link2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEmail(tid, false)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                      title="Enviar por e-mail (diagnóstico)"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyLink(denunciaLinkForSlug(tid))}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                      title="Copiar link do canal de denúncias"
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQrTenantId((current) => (current === tid ? null : tid))
                        setQrMode('diagnostico')
                      }}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                      title="Gerar QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                    {registry && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(tid)}
                          disabled={togglingTenant === tid}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:opacity-50"
                          title={isActive ? 'Encerrar coleta' : 'Reabrir coleta'}
                        >
                          {togglingTenant === tid ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromList(tid)}
                          disabled={removingTenant === tid}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                          title="Excluir empresa da lista"
                        >
                          {removingTenant === tid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectTenant && onSelectTenant(tid)}
                      className="ml-2 rounded-xl bg-[var(--color-brand-700)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-800)]"
                    >
                      Ver
                    </button>
                  </div>
                  {qrTenantId === tid && (
                    <div className="basis-full rounded-xl border border-[var(--color-brand-200)] bg-white p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--color-brand-900)]">QR Code da empresa</p>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setQrMode('diagnostico')}
                            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                              qrMode === 'diagnostico'
                                ? 'bg-[var(--color-brand-700)] text-white'
                                : 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                            }`}
                          >
                            Diagnóstico
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrMode('denuncia')}
                            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                              qrMode === 'denuncia'
                                ? 'bg-[var(--color-brand-700)] text-white'
                                : 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                            }`}
                          >
                            Denúncia
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-[var(--color-brand-200)] bg-white p-2">
                          <QRCodeCanvas
                            id={`qr-canvas-${tid}`}
                            value={qrMode === 'denuncia' ? denunciaLinkForSlug(tid) : linkForSlug(tid)}
                            size={qrExportSize}
                            style={{ width: qrPreviewSize, height: qrPreviewSize }}
                            level="H"
                            imageSettings={{
                              src: qrLogoSrc,
                              height: 138,
                              width: 138,
                              excavate: true,
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Compartilhe este QR Code com a empresa para acesso rápido no celular.
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => copyQrImage(tid)}
                              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] px-2 py-1 text-[11px] font-semibold text-[var(--color-brand-700)] transition hover:bg-[var(--color-brand-100)]"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copiar imagem
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadQrImage(tid)}
                              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] px-2 py-1 text-[11px] font-semibold text-[var(--color-brand-700)] transition hover:bg-[var(--color-brand-100)]"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Baixar PNG
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {overviewOnlyIds.length > 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Outras empresas com respostas</h4>
            <p className="mb-4 text-xs text-slate-500">Estas empresas possuem dados no sistema mas não foram adicionadas à lista de gestão. Adicione para gerenciar.</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {overviewOnlyIds.map((tid) => {
                const overview = overviewByTenant[tid]
                return (
                  <li key={tid} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div>
                      <p className="font-mono text-sm font-medium text-slate-900">{tid}</p>
                      {overview && (
                        <p className="text-xs text-slate-500 mt-0.5">{overview.submission_count} resposta(s)</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await addTenantToRegistry(tid)
                          await loadOverview()
                        } catch (e) {
                          alert(e instanceof Error ? e.message : 'Erro ao adicionar.')
                        }
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Adicionar
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
