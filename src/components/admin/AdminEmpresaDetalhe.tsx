import { useState, useEffect } from 'react'
import { ArrowLeft, Building2, Copy, Check, Link2, Calendar, Loader2, Trash2 } from 'lucide-react'
import { getTenantRegistry, getTenantOverview, deleteTenantFromRegistry, type TenantRegistryItem, type TenantOverviewItem } from '@/types/submission'
import { formatCnpjDisplay } from '@/lib/masks'

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

export function AdminEmpresaDetalhe({ tenantId, onBack }: Props) {
  const [registry, setRegistry] = useState<TenantRegistryItem | null>(null)
  const [overview, setOverview] = useState<TenantOverviewItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [linkCopied, setLinkCopied] = useState<'diagnostico' | 'denuncia' | null>(null)
  const [deleting, setDeleting] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname || '/'}`.replace(/\?.*$/, '') : ''
  const linkDiagnostico = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}org=${encodeURIComponent(tenantId)}`
  const linkDenuncia = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}org=${encodeURIComponent(tenantId)}&channel=denuncia`

  useEffect(() => {
    let cancelled = false
    Promise.all([getTenantRegistry(), getTenantOverview()]).then(([regList, overList]) => {
      if (cancelled) return
      const r = regList.find((x) => x.tenant_id === tenantId) ?? null
      const o = overList.find((x) => x.tenant_id === tenantId) ?? null
      setRegistry(r)
      setOverview(o)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [tenantId])

  const copyLink = async (url: string, type: 'diagnostico' | 'denuncia') => {
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(type)
      setTimeout(() => setLinkCopied(null), 2000)
    } catch {
      alert('Não foi possível copiar.')
    }
  }

  const handleExcluir = async () => {
    if (!hasRegistry) return
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

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" aria-label="Carregando" />
      </div>
    )
  }

  const displayName = registry?.display_name?.trim() || tenantId
  const hasRegistry = registry != null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{displayName}</h2>
            <p className="text-sm text-slate-500 font-mono">{tenantId}</p>
          </div>
          {hasRegistry && !registry.active && (
            <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              Coleta encerrada
            </span>
          )}
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Nome de exibição</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900">{displayName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Identificador (slug)</dt>
            <dd className="mt-0.5 font-mono text-sm text-slate-900">{tenantId}</dd>
          </div>
          {hasRegistry && registry.cnpj && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">CNPJ principal</dt>
              <dd className="mt-0.5 font-mono text-sm text-slate-900">
                {registry.cnpj.replace(/\D/g, '').length === 14 ? formatCnpjDisplay(registry.cnpj) : registry.cnpj}
              </dd>
            </div>
          )}
          {hasRegistry && registry.cnpjs && registry.cnpjs.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Outros CNPJs</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {registry.cnpjs.map((c, i) => (
                  <span key={i} className="rounded-lg bg-slate-50 px-2 py-1 font-mono text-sm text-slate-700">
                    {c.replace(/\D/g, '').length === 14 ? formatCnpjDisplay(c) : c}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {hasRegistry && registry.nicho && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Nicho</dt>
              <dd className="mt-0.5 text-sm text-slate-900">{registry.nicho}</dd>
            </div>
          )}
          {hasRegistry && registry.setores && registry.setores.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Setores (formulário diagnóstico)</dt>
              <dd className="mt-1">
                <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-700">
                  {registry.setores.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {overview && (
            <>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total de respostas (diagnóstico)</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                  <span>{overview.submission_count}</span>
                </dd>
              </div>
              {overview.last_submitted_at && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Último envio</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {formatDate(overview.last_submitted_at)}
                  </dd>
                </div>
              )}
            </>
          )}
        </dl>

        <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Link2 className="h-4 w-4 text-slate-500" />
            Links para o cliente
          </h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 sm:min-w-[280px]">
              <span className="truncate text-sm text-slate-700">{linkDiagnostico}</span>
              <button
                type="button"
                onClick={() => copyLink(linkDiagnostico, 'diagnostico')}
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
                title="Copiar link diagnóstico"
              >
                {linkCopied === 'diagnostico' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 sm:min-w-[280px]">
              <span className="truncate text-sm text-slate-700">{linkDenuncia}</span>
              <button
                type="button"
                onClick={() => copyLink(linkDenuncia, 'denuncia')}
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
                title="Copiar link canal de denúncias"
              >
                {linkCopied === 'denuncia' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Diagnóstico: formulário HSE-IT. Canal de denúncias: relatos anônimos.
          </p>
        </div>
      </div>

      {hasRegistry && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6">
          <h3 className="text-sm font-semibold text-red-900">Excluir do registro</h3>
          <p className="mt-1 text-sm text-red-800">
            Remove a empresa da lista do painel. Os diagnósticos e denúncias já enviados permanecem no sistema.
          </p>
          <button
            type="button"
            onClick={handleExcluir}
            disabled={deleting}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? 'Excluindo…' : 'Excluir empresa do registro'}
          </button>
        </div>
      )}

      {!hasRegistry && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
          Esta empresa ainda não está no registro. Use a página <strong>Empresas</strong> para cadastrá-la e definir CNPJ, nicho e setores.
        </div>
      )}
    </div>
  )
}
