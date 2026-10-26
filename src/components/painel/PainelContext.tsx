import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getTenantRegistry, getTenantOverview, type TenantOverviewItem, type TenantRegistryItem } from '@/types/submission'
import { getUnreadReportCounts } from '@/types/whistleblower'

export type PainelProfile = {
  id: string
  name: string
  email: string
  role?: string
  avatar_url?: string | null
  department?: string | null
  requires_password_change?: boolean
}

type PainelData = {
  profile: PainelProfile
  refreshProfile: () => void
  /** null enquanto carrega. */
  companies: TenantRegistryItem[] | null
  overview: Record<string, TenantOverviewItem>
  unread: Record<string, number>
  reloadCompanies: () => Promise<void>
  reloadUnread: () => Promise<void>
  companyBySlug: (slug: string) => TenantRegistryItem | undefined
  /** Última empresa visitada: mantém o menu "Esta empresa" ao ir para páginas do escritório. */
  lastSlug: string | null
  rememberSlug: (slug: string) => void
}

const Ctx = createContext<PainelData | null>(null)
const LAST_SLUG_KEY = 'confiara:painel:empresa'

function readLastSlug(): string | null {
  try {
    return window.localStorage.getItem(LAST_SLUG_KEY)
  } catch {
    return null
  }
}

export function PainelProvider({
  profile,
  refreshProfile,
  children,
}: {
  profile: PainelProfile
  refreshProfile: () => void
  children: ReactNode
}) {
  const [companies, setCompanies] = useState<TenantRegistryItem[] | null>(null)
  const [overview, setOverview] = useState<Record<string, TenantOverviewItem>>({})
  const [unread, setUnread] = useState<Record<string, number>>({})
  const [lastSlug, setLastSlug] = useState<string | null>(readLastSlug)

  const reloadCompanies = useCallback(async () => {
    const [registry, ov] = await Promise.all([getTenantRegistry(), getTenantOverview()])
    setCompanies([...registry].sort((a, b) => (a.display_name ?? a.tenant_id).localeCompare(b.display_name ?? b.tenant_id, 'pt-BR')))
    setOverview(Object.fromEntries(ov.map((o) => [o.tenant_id, o])))
  }, [])

  const reloadUnread = useCallback(async () => {
    setUnread(await getUnreadReportCounts())
  }, [])

  useEffect(() => {
    reloadCompanies()
    reloadUnread()
    const onFocus = () => reloadUnread()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [reloadCompanies, reloadUnread])

  const rememberSlug = useCallback((slug: string) => {
    setLastSlug(slug)
    try {
      window.localStorage.setItem(LAST_SLUG_KEY, slug)
    } catch {
      // ignore storage errors
    }
  }, [])

  const value = useMemo<PainelData>(
    () => ({
      profile,
      refreshProfile,
      companies,
      overview,
      unread,
      reloadCompanies,
      reloadUnread,
      companyBySlug: (slug) => companies?.find((c) => c.tenant_id === slug),
      lastSlug: lastSlug && companies?.some((c) => c.tenant_id === lastSlug) ? lastSlug : null,
      rememberSlug,
    }),
    [profile, refreshProfile, companies, overview, unread, reloadCompanies, reloadUnread, lastSlug, rememberSlug]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePainel(): PainelData {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePainel fora do PainelProvider')
  return ctx
}

export function companyName(company: TenantRegistryItem | undefined, fallback: string): string {
  return company?.display_name?.trim() || fallback
}
