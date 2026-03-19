import { useState, useCallback, useEffect } from 'react'
import { Search, Building2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { searchOrganizations } from '../types/submission'

type Props = {
  onVoltar: () => void
}

function buildCanalUrl(tenantId: string, form?: boolean, consultar?: boolean): string {
  const base = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname || '/'}` : ''
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
    <div className="mx-auto max-w-xl space-y-6">
      <button
        type="button"
        onClick={onVoltar}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Encontrar minha organização
            </h2>
            <p className="text-sm text-slate-600">
              Digite o nome da empresa para acessar o canal de denúncia
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="org-search" className="sr-only">
            Buscar organização
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="org-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex.: Bismarchi Pires"
              className="input-escritorio w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400"
              autoComplete="off"
              autoFocus
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              </div>
            )}
          </div>
        </div>

        {searched && !loading && (
          <div className="mt-4 min-h-[120px]">
            {results.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                Nenhuma organização encontrada. Verifique o nome e tente novamente.
              </p>
            ) : (
              <ul className="space-y-2" role="listbox" aria-label="Resultados da busca">
                {results.map((org) => (
                  <li key={org.tenant_id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(org.tenant_id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition hover:border-violet-300 hover:bg-violet-50/50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
                      role="option"
                    >
                      <Building2 className="h-5 w-5 shrink-0 text-slate-500" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">
                          {org.display_name || org.tenant_id}
                        </p>
                        {org.display_name && org.tenant_id !== org.display_name && (
                          <p className="text-xs text-slate-500">{org.tenant_id}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
