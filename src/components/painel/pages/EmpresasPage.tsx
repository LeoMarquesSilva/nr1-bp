import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Building2, ChevronRight, Plus, Search } from 'lucide-react'
import { TenantLogoAvatar } from '@/components/TenantLogoAvatar'
import { getSurveys, type Survey } from '@/types/pesquisas'
import { usePainel, companyName } from '../PainelContext'
import { navigate, paths } from '../router'
import { Button, EmptyState, Notice, PageHeader, PainelLink, Panel, Skeleton, StatusPill, formatDateBR, inputCls, pluralize } from '../ui'

export function EmpresasPage() {
  const { companies, overview, unread } = usePainel()
  const [query, setQuery] = useState('')
  const [surveys, setSurveys] = useState<Survey[] | null>(null)

  useEffect(() => {
    getSurveys()
      .then(setSurveys)
      .catch(() => setSurveys([]))
  }, [])

  const surveysBySlug = useMemo(() => {
    const map: Record<string, { abertas: number; total: number }> = {}
    for (const s of surveys ?? []) {
      const m = (map[s.tenantId] ??= { abertas: 0, total: 0 })
      m.total++
      if (s.status === 'aberta') m.abertas++
    }
    return map
  }, [surveys])

  const q = query.trim().toLowerCase()
  const list = (companies ?? []).filter((c) => !q || (c.display_name ?? '').toLowerCase().includes(q) || c.tenant_id.includes(q))
  const unregistered = Object.keys(overview).filter((slug) => companies && !companies.some((c) => c.tenant_id === slug))

  return (
    <>
      <PageHeader
        title="Empresas"
        description="Carteira de clientes do escritório. Abra uma empresa para ver o diagnóstico NR-1, as pesquisas, as denúncias e as configurações."
        actions={
          <Button asChild>
            <PainelLink to={paths.empresaNova()}>
              <Plus />
              Nova empresa
            </PainelLink>
          </Button>
        }
      />

      {unregistered.length > 0 && (
        <div className="mb-4">
          <Notice tone="warning">
            {unregistered.length === 1 ? 'Há respostas de diagnóstico de uma empresa sem cadastro: ' : 'Há respostas de diagnóstico de empresas sem cadastro: '}
            {unregistered.map((slug, i) => (
              <span key={slug}>
                {i > 0 && ', '}
                <PainelLink to={`${paths.empresaNova()}?slug=${encodeURIComponent(slug)}`} className="font-semibold underline underline-offset-2">
                  {slug}
                </PainelLink>
              </span>
            ))}
            . Cadastre para gerenciar.
          </Notice>
        </div>
      )}

      <Panel padded={false}>
        <div className="border-b border-[var(--border)] p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand-500)]" aria-hidden />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome ou identificador" aria-label="Buscar empresa" className={cn(inputCls, 'pl-9')} />
          </div>
        </div>

        {companies === null ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="Cadastre a primeira empresa"
            description="Cada empresa ganha seu link de diagnóstico NR-1, canal de denúncias e pesquisas internas."
            action={
              <Button asChild>
                <PainelLink to={paths.empresaNova()}>
                  <Plus />
                  Nova empresa
                </PainelLink>
              </Button>
            }
          />
        ) : list.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[var(--color-brand-700)]">Nenhuma empresa encontrada para “{query}”.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs font-medium text-[var(--color-brand-600)]">
                  <th scope="col" className="px-5 py-2.5 font-medium">Empresa</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Diagnóstico NR-1</th>
                  <th scope="col" className="hidden whitespace-nowrap px-3 py-2.5 font-medium lg:table-cell">Canal de denúncias</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Pesquisas</th>
                  <th scope="col" className="w-10 px-3 py-2.5">
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const name = companyName(c, c.tenant_id)
                  const ov = overview[c.tenant_id]
                  const naoLidas = unread[c.tenant_id] ?? 0
                  const sv = surveysBySlug[c.tenant_id]
                  const to = paths.empresa(c.tenant_id)
                  return (
                    <tr
                      key={c.tenant_id}
                      onClick={() => navigate(to)}
                      className="cursor-pointer border-b border-[var(--border)] transition-colors duration-150 last:border-0 hover:bg-[var(--color-brand-50)]"
                    >
                      <td className="w-full max-w-0 px-5 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <TenantLogoAvatar logoUrl={c.logo_url} label={name} size="md" rounded="lg" />
                          <div className="min-w-0">
                            <PainelLink to={to} className="block truncate font-semibold text-[var(--color-brand-900)] hover:underline" onClick={(e) => e.stopPropagation()}>
                              {name}
                            </PainelLink>
                            <span className="block truncate font-mono text-xs text-[var(--color-brand-600)]">{c.tenant_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <StatusPill tone={c.active ? 'success' : 'neutral'}>{c.active ? 'Coleta aberta' : 'Coleta encerrada'}</StatusPill>
                        <span className="mt-1 block text-xs text-[var(--color-brand-700)]">
                          {pluralize(ov?.submission_count ?? 0, 'resposta', 'respostas')}
                          {ov?.last_submitted_at ? ` · última em ${formatDateBR(ov.last_submitted_at)}` : ''}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3 lg:table-cell">
                        <StatusPill tone={c.whistleblower_enabled ? 'success' : 'neutral'}>{c.whistleblower_enabled ? 'Ativo' : 'Desativado'}</StatusPill>
                        {naoLidas > 0 && <span className="mt-1 block text-xs font-semibold text-[var(--color-brand-900)]">{pluralize(naoLidas, 'não lida', 'não lidas')}</span>}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-[var(--color-brand-700)] xl:table-cell">
                        {surveys === null ? (
                          <Skeleton className="h-4 w-20" />
                        ) : sv ? (
                          <>
                            {pluralize(sv.total, 'pesquisa', 'pesquisas')}
                            {sv.abertas > 0 && <span className="block text-xs font-semibold text-[var(--color-success-700)]">{pluralize(sv.abertas, 'aberta', 'abertas')}</span>}
                          </>
                        ) : (
                          <span className="text-[var(--color-brand-500)]">Nenhuma</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[var(--color-brand-400)]">
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
