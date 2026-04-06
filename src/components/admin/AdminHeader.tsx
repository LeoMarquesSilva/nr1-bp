import { useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import type { AdminPage } from './AdminSidebar'

const PAGE_TITLES: Record<AdminPage, string> = {
  dashboard: 'Dashboard',
  perfil: 'Perfil',
  empresas: 'Empresas',
  empresa: 'Detalhes da empresa',
  usuarios: 'Usuários',
}

type SearchResult = { tenant_id: string; display_name: string }

type AdminHeaderProps = {
  page: AdminPage
  /** Valor do campo de pesquisa. */
  searchQuery?: string
  /** Callback quando o usuário altera a pesquisa. */
  onSearchChange?: (value: string) => void
  /** Resultados filtrados para exibir no dropdown (em todas as páginas). */
  searchResults?: SearchResult[]
  /** Ao clicar em um resultado, abre a página de detalhes da empresa. */
  onSelectSearchResult?: (tenantId: string) => void
  /** Conteúdo opcional (ex.: substituir o campo de pesquisa). */
  children?: React.ReactNode
}

export function AdminHeader({
  page,
  searchQuery = '',
  onSearchChange,
  searchResults = [],
  onSelectSearchResult,
  children,
}: AdminHeaderProps) {
  const title = PAGE_TITLES[page] ?? page
  const showSearch = onSearchChange != null
  const hasQuery = searchQuery.trim().length > 0
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasQuery) return
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        onSearchChange?.('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [hasQuery, onSearchChange])

  const showDropdown = showSearch && hasQuery

  return (
    <header
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--color-brand-200)] bg-[var(--color-brand-50)]/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8"
      role="banner"
    >
      <h1 className="text-lg font-semibold tracking-tight text-[var(--color-brand-900)] truncate">
        {title}
      </h1>
      {children != null ? (
        <div className="flex min-w-0 flex-1 justify-end md:max-w-xs">
          {children}
        </div>
      ) : showSearch ? (
        <div ref={searchContainerRef} className="relative flex min-w-0 flex-1 justify-end md:max-w-[260px]">
          <label htmlFor="admin-search" className="sr-only">
            Pesquisar empresas
          </label>
          <div className="flex w-full items-center gap-2 rounded-lg border border-[var(--color-brand-200)] bg-white px-3 py-2 shadow-[var(--shadow-xs)]">
            <Search className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" aria-hidden />
            <input
              id="admin-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pesquisar empresas..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
            />
          </div>
          {showDropdown && (
            <div
              className="absolute right-0 top-full z-50 mt-1 max-h-64 w-full min-w-[220px] overflow-auto rounded-lg border border-[var(--color-brand-200)] bg-white py-1 shadow-[var(--shadow-sm)]"
              role="listbox"
            >
              {searchResults.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-[var(--muted-foreground)]">
                  Nenhuma empresa encontrada
                </div>
              ) : (
                searchResults.map((c) => (
                  <button
                    key={c.tenant_id}
                    type="button"
                    role="option"
                    onClick={() => onSelectSearchResult?.(c.tenant_id)}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm transition hover:bg-[var(--color-brand-50)] focus:bg-[var(--color-brand-50)] focus:outline-none"
                  >
                    <span className="font-medium text-[var(--color-brand-900)]">{c.display_name}</span>
                    <span className="text-xs text-[var(--muted-foreground)] font-mono">{c.tenant_id}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-brand-200)] bg-white px-3 py-2 text-sm text-[var(--muted-foreground)] md:max-w-[200px]">
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">Pesquisa</span>
        </div>
      )}
    </header>
  )
}
