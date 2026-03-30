import { useState, useCallback, useEffect } from 'react'
import { Search, Building2, ArrowRight, Loader2 } from 'lucide-react'
import { searchOrganizations } from '../types/submission'
import { PageShell, PageShellCard } from './layout/PageShell'

type Props = {
  onVoltar: () => void
}

function buildCanalUrl(tenantId: string, form?: boolean, consultar?: boolean): string {
  const base = typeof window !== 'undefined' ? `${window.location.origin}/` : ''
  const params = new URLSearchParams()
  params.set('org', tenantId)
  params.set('channel', 'denuncia')
  if (form) params.set('form', '1')
  if (consultar) params.set('consultar', '1')
  return `${base}?${params.toString()}`
}

export function RelatosBuscarEmpresa({ onVoltar }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ tenant_id: string; display_name: string | null }[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchOrganizations(trimmed)
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) doSearch(query)
      else {
        setResults([])
        setSearched(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query, doSearch])

  const handleSelect = (tenantId: string) => {
    window.location.href = buildCanalUrl(tenantId)
  }

  return (
    <PageShell
      onBack={onVoltar}
      title="Encontrar minha organização"
      subtitle="Digite o nome da empresa para acessar o canal de denúncia."
    >
      <PageShellCard>
        <div className="flex items-center gap-3">
          <div className="brand-icon-tile h-12 w-12 rounded-xl">
            <Building2 className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Resultados direcionam para o canal de denúncias da organização escolhida.
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor="org-search" className="mb-2 block text-sm font-semibold text-[var(--color-brand-900)]">
            Buscar organização
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-brand-400)]" aria-hidden />
            <input
              id="org-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex.: Bismarchi Pires"
              className="input-escritorio w-full rounded-xl border bg-white py-3.5 pl-12 pr-12 text-[var(--color-brand-900)] placeholder:text-[var(--muted-foreground)]"
              autoComplete="off"
              autoFocus
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2" aria-live="polite">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-brand-600)]" aria-hidden />
              </div>
            )}
          </div>
        </div>

        {searched && !loading && (
          <div className="mt-4 min-h-[120px]">
            {results.length === 0 ? (
              <p className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/80 px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
                Nenhuma organização encontrada. Verifique o nome e tente novamente.
              </p>
            ) : (
              <ul className="space-y-2" role="listbox" aria-label="Resultados da busca">
                {results.map((org) => (
                  <li key={org.tenant_id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(org.tenant_id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 text-left transition hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
                      role="option"
                    >
                      <Building2 className="h-5 w-5 shrink-0 text-[var(--color-brand-500)]" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--color-brand-900)]">
                          {org.display_name || org.tenant_id}
                        </p>
                        {org.display_name && org.tenant_id !== org.display_name && (
                          <p className="text-xs text-[var(--muted-foreground)]">{org.tenant_id}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-brand-400)]" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </PageShellCard>
    </PageShell>
  )
}
