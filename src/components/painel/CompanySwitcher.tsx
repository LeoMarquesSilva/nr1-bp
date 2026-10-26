import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Building2, Check, ChevronsUpDown, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TenantLogoAvatar } from '@/components/TenantLogoAvatar'
import { usePainel, companyName } from './PainelContext'
import { navigate, paths, useLocationKey } from './router'

type Item = { kind: 'company'; slug: string; label: string; logo: string | null } | { kind: 'all' } | { kind: 'new' }

/** Seletor de empresa no topo da barra lateral: busca, recentes e atalhos para a carteira e cadastro. */
export function CompanySwitcher({
  currentSlug,
  collapsed = false,
  onNavigate,
  onOpenChange,
}: {
  currentSlug: string | null
  /** Barra recolhida: mostra só a logo da empresa. */
  collapsed?: boolean
  onNavigate?: () => void
  onOpenChange?: (open: boolean) => void
}) {
  const { companies, companyBySlug } = usePainel()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const locationKey = useLocationKey()

  // Fecha se a página mudar por outro caminho (voltar do navegador, link no conteúdo).
  useEffect(() => setOpen(false), [locationKey])

  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  useEffect(() => () => onOpenChange?.(false), [onOpenChange])

  const current = currentSlug ? companyBySlug(currentSlug) : undefined
  const currentLabel = currentSlug ? companyName(current, currentSlug) : null

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase()
    const list = (companies ?? [])
      .filter((c) => !q || (c.display_name ?? '').toLowerCase().includes(q) || c.tenant_id.includes(q))
      .map((c): Item => ({ kind: 'company', slug: c.tenant_id, label: companyName(c, c.tenant_id), logo: c.logo_url ?? null }))
    return q ? list : [...list, { kind: 'all' }, { kind: 'new' }]
  }, [companies, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => setActive(0), [query])

  const choose = (item: Item) => {
    setOpen(false)
    onNavigate?.()
    if (item.kind === 'company') navigate(paths.empresa(item.slug))
    else if (item.kind === 'all') navigate(paths.empresas())
    else navigate(paths.empresaNova())
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && items[active]) {
      e.preventDefault()
      choose(items[active])
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={currentLabel ? `Empresa: ${currentLabel}. Trocar empresa` : 'Selecionar empresa'}
        className="flex w-full items-center gap-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-[7px] text-left transition-colors duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        {currentSlug ? (
          <TenantLogoAvatar logoUrl={current?.logo_url} label={currentLabel ?? currentSlug} size="sm" rounded="lg" />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--color-brand-200)]" aria-hidden>
            <Building2 className="h-4 w-4" />
          </span>
        )}
        <span className={cn('min-w-0 flex-1 whitespace-nowrap transition-opacity duration-150 motion-reduce:transition-none', collapsed ? 'opacity-0' : 'opacity-100 delay-75')}>
          <span className="block truncate text-sm font-semibold text-white">{currentLabel ?? 'Selecionar empresa'}</span>
          <span className="block truncate text-xs text-[var(--color-brand-300)]">{currentSlug ? 'Trocar empresa' : `${companies?.length ?? 0} empresas`}</span>
        </span>
        <ChevronsUpDown className={cn('h-4 w-4 shrink-0 text-[var(--color-brand-300)] transition-opacity duration-150', collapsed ? 'opacity-0' : 'opacity-100')} aria-hidden />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[var(--border)] bg-white text-[var(--color-brand-900)] shadow-[var(--shadow-md)] motion-safe:animate-[painel-pop_150ms_ease-out]"
          onKeyDown={onKeyDown}
        >
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-3">
            <Search className="h-4 w-4 shrink-0 text-[var(--color-brand-500)]" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar empresa"
              aria-label="Buscar empresa"
              aria-controls={listId}
              aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
              className="w-full bg-transparent py-2.5 text-sm placeholder:text-[var(--color-brand-500)] focus:outline-none"
            />
          </div>
          <ul id={listId} role="listbox" aria-label="Empresas" className="max-h-72 overflow-y-auto p-1">
            {companies === null && <li className="px-3 py-2 text-sm text-[var(--color-brand-600)]">Carregando…</li>}
            {companies !== null && items.length === 0 && (
              <li className="px-3 py-2 text-sm text-[var(--color-brand-600)]">Nenhuma empresa com “{query}”.</li>
            )}
            {items.map((item, i) => {
              const isActive = i === active
              const base = cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm',
                isActive && 'bg-[var(--color-brand-50)]'
              )
              if (item.kind === 'company') {
                return (
                  <li
                    key={item.slug}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={item.slug === currentSlug}
                    className={base}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(item)}
                  >
                    <TenantLogoAvatar logoUrl={item.logo} label={item.label} size="sm" rounded="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{item.label}</span>
                      <span className="block truncate text-xs text-[var(--color-brand-600)]">{item.slug}</span>
                    </span>
                    {item.slug === currentSlug && <Check className="h-4 w-4 shrink-0 text-[var(--color-brand-700)]" aria-hidden />}
                  </li>
                )
              }
              const isAll = item.kind === 'all'
              return (
                <li
                  key={item.kind}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={false}
                  className={cn(base, isAll && 'mt-1 border-t border-[var(--border)] pt-2.5')}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(item)}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)]" aria-hidden>
                    {isAll ? <Building2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                  <span className="font-medium">{isAll ? 'Todas as empresas' : 'Nova empresa'}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
