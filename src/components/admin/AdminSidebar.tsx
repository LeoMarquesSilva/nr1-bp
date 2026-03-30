import { LayoutDashboard, User, LogOut, Home, Building2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/header/logo'

export type AdminPage = 'dashboard' | 'perfil' | 'empresas' | 'empresa' | 'usuarios'

export const ADMIN_NAV: { id: AdminPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'empresas', label: 'Empresas', icon: Building2 },
  { id: 'usuarios', label: 'Usuários', icon: Users as typeof LayoutDashboard },
  { id: 'perfil', label: 'Perfil', icon: User },
]

type AdminSidebarProps = {
  page: AdminPage
  onNavigate: (page: AdminPage) => void
  onGoToSite: () => void
  onLogout: () => void
  profile: { name: string; avatar_url?: string | null } | null
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'A'
}

export function AdminSidebar({ page, onNavigate, onGoToSite, onLogout, profile }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop: barra fixa à esquerda */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col border-r md:flex',
          'bg-gradient-to-b from-[var(--color-brand-900)] to-[var(--color-brand-700)]',
          'border-[color-mix(in_srgb,var(--color-brand-400)_30%,black)]'
        )}
        aria-label="Navegação do painel"
      >
        {/* Logo / Voltar ao site */}
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-[color-mix(in_srgb,var(--color-brand-400)_30%,black)]">
          <button
            type="button"
            onClick={onGoToSite}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-brand-200)] transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            title="Voltar ao site"
          >
            <Home className="h-5 w-5" />
          </button>
        </div>
        <div className="flex justify-center px-2 py-3">
          <Logo variant="dark" className="w-full justify-center opacity-95" />
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2 pt-4">
          {ADMIN_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              title={label}
              className={cn(
                'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-white/30',
                page === id
                  ? 'bg-[var(--color-brand-400)]/25 text-white'
                  : 'text-[var(--color-brand-200)] hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </nav>

        <div className="border-t border-[color-mix(in_srgb,var(--color-brand-400)_30%,black)] p-2">
          {/* Avatar → Perfil */}
          <button
            type="button"
            onClick={() => onNavigate('perfil')}
            title={profile ? profile.name : 'Perfil'}
            className={cn(
              'mb-2 flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-white/30',
              'border-[var(--color-brand-400)]/50 bg-[var(--color-brand-700)]/60 text-[var(--color-brand-100)] hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-700)]/90',
              page === 'perfil' && 'border-[var(--color-brand-400)] bg-[var(--color-brand-400)]/25 text-white'
            )}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-semibold">
                {profile ? getInitials(profile.name) : 'A'}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onLogout}
            title="Sair"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-brand-200)] transition hover:bg-[var(--color-error-500)]/20 hover:text-[var(--color-error-50)] focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Mobile: bottom navigation */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t bg-[var(--color-brand-900)] px-2 py-2 md:hidden',
          'border-[color-mix(in_srgb,var(--color-brand-400)_30%,black)]'
        )}
        aria-label="Navegação mobile"
      >
        <button
          type="button"
          onClick={onGoToSite}
          className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[var(--color-brand-200)] transition hover:text-white"
          title="Voltar ao site"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">Site</span>
        </button>
        {ADMIN_NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition',
              page === id ? 'text-white' : 'text-[var(--color-brand-200)] hover:text-white'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[var(--color-brand-200)] transition hover:text-[var(--color-error-50)]"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px]">Sair</span>
        </button>
      </nav>
    </>
  )
}
