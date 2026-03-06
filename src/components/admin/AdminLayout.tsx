import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { logoutAdmin } from '@/lib/adminAuth'
import { getTenantRegistry, getTenantOverview } from '@/types/submission'
import { cn } from '@/lib/utils'
import { AdminSidebar, type AdminPage } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { AdminDashboard } from '../AdminDashboard'
import { AdminPerfil } from './AdminPerfil'
import { AdminEmpresas } from './AdminEmpresas'
import { AdminEmpresaDetalhe } from './AdminEmpresaDetalhe'

type AdminLayoutProps = {
  onClose: () => void
  onLogout: () => void
}

type Profile = { id: string; name: string; email: string; role?: string; avatar_url?: string | null; department?: string | null } | null

export function AdminLayout({ onClose, onLogout }: AdminLayoutProps) {
  const [page, setPage] = useState<AdminPage>('dashboard')
  const [profile, setProfile] = useState<Profile>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [searchableCompanies, setSearchableCompanies] = useState<{ tenant_id: string; display_name: string }[]>([])

  const refetchProfile = () => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.id) return
      supabase
        .from('users')
        .select('id, name, email, role, avatar_url, department')
        .eq('auth_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.role === 'admin') setProfile(data as Profile)
        })
    })
  }

  useEffect(() => {
    let cancelled = false
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (!session?.user?.id) {
        setAuthChecked(true)
        logoutAdmin()
        onClose()
        return
      }
      supabase
        .from('users')
        .select('id, name, email, role, avatar_url, department')
        .eq('auth_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (cancelled) return
          setAuthChecked(true)
          if (!data || data.role !== 'admin') {
            logoutAdmin()
            supabase.auth.signOut().finally(() => onClose())
            return
          }
          setProfile(data as Profile)
        })
    })
    return () => { cancelled = true }
  }, [onClose])

  useEffect(() => {
    Promise.all([getTenantRegistry(), getTenantOverview()]).then(([registry, overview]) => {
      const ids = new Set<string>([
        ...registry.map((r) => r.tenant_id),
        ...overview.map((o) => o.tenant_id),
      ])
      const byId = Object.fromEntries(registry.map((r) => [r.tenant_id, r.display_name?.trim() ?? r.tenant_id]))
      setSearchableCompanies(
        Array.from(ids).sort().map((tid) => ({
          tenant_id: tid,
          display_name: byId[tid] ?? tid,
        }))
      )
    })
  }, [])

  const q = searchQuery.trim().toLowerCase()
  const searchResults = q
    ? searchableCompanies.filter(
        (c) =>
          c.display_name.toLowerCase().includes(q) || c.tenant_id.toLowerCase().includes(q)
      )
    : []

  const handleSelectSearchResult = (tenantId: string) => {
    setSearchQuery('')
    setSelectedTenantId(tenantId)
    setPage('empresa')
  }

  const handleLogout = () => {
    getSupabase()
      .auth.signOut()
      .then(() => {
        logoutAdmin()
        onLogout()
      })
      .catch(() => {
        logoutAdmin()
        onLogout()
      })
  }

  if (!authChecked || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--branco-gelo)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" aria-label="Carregando" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[var(--branco-gelo)]">
      <AdminSidebar
        page={page}
        onNavigate={setPage}
        onGoToSite={onClose}
        onLogout={handleLogout}
        profile={profile ? { name: profile.name, avatar_url: profile.avatar_url } : null}
      />
      <div className="flex min-h-0 flex-1 flex-col md:ml-16">
        <AdminHeader
          page={page}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult}
        />
        <main
          className={cn(
            'flex-1 overflow-auto pb-24 md:pb-8',
            'px-4 sm:px-6 lg:px-8 pt-4'
          )}
        >
          {page === 'dashboard' && (
            <AdminDashboard onClose={onClose} onLogout={onLogout} hideHeaderActions searchQuery={searchQuery} />
          )}
          {page === 'perfil' && (
            <AdminPerfil profile={profile} onProfileUpdated={refetchProfile} />
          )}
          {page === 'empresas' && <AdminEmpresas />}
          {page === 'empresa' && selectedTenantId && (
            <AdminEmpresaDetalhe
              tenantId={selectedTenantId}
              onBack={() => {
                setPage('dashboard')
                setSelectedTenantId(null)
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
