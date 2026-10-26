import type { ComponentType, ReactNode } from 'react'
import { BookOpen, Building2, ClipboardList, ExternalLink, Inbox, LayoutDashboard, LogOut, Settings, ShieldAlert, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CompanySwitcher } from './CompanySwitcher'
import { usePainel } from './PainelContext'
import { navigate, paths, type PainelRoute } from './router'
import { PainelLink } from './ui'

type NavItem = { label: string; to: string; icon: ComponentType<{ className?: string }>; active: boolean; badge?: number }

/** Largura da barra: recolhida (só ícones) e aberta. Os ícones ficam centralizados nos 64px da faixa recolhida. */
export const SIDEBAR_COLLAPSED_W = '4rem'
export const SIDEBAR_EXPANDED_W = '16rem'

const itemBase =
  'flex items-center gap-3 rounded-lg py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

/** Texto que some suavemente quando a barra recolhe (continua no DOM para leitores de tela). */
function Fade({ collapsed, children, className }: { collapsed: boolean; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'min-w-0 whitespace-nowrap transition-opacity duration-150 motion-reduce:transition-none',
        collapsed ? 'opacity-0' : 'opacity-100 delay-75',
        className
      )}
    >
      {children}
    </span>
  )
}

function NavList({ title, items, collapsed, onNavigate }: { title: string; items: NavItem[]; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <div>
      <div className="relative flex h-6 items-center px-4">
        <Fade collapsed={collapsed} className="text-xs font-medium text-[var(--color-brand-300)]">
          {title}
        </Fade>
        <span
          className={cn(
            'absolute left-6 top-1/2 h-px w-5 -translate-x-1/2 bg-white/15 transition-opacity duration-150 motion-reduce:transition-none',
            collapsed ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden
        />
      </div>
      <ul className="space-y-0.5">
        {items.map(({ label, to, icon: Icon, active, badge }) => (
          <li key={to}>
            <PainelLink
              to={to}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              aria-label={badge ? `${label}, ${badge} não lidas` : undefined}
              className={cn(
                itemBase,
                'px-4',
                active ? 'bg-white/[0.12] font-semibold text-white' : 'text-[var(--color-brand-200)] hover:bg-white/[0.06] hover:text-white'
              )}
            >
              <span className="relative shrink-0">
                <Icon className="h-4 w-4" />
                {badge ? (
                  <span
                    className={cn(
                      'absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--color-brand-cream)] ring-2 ring-[var(--color-brand-900)] transition-opacity duration-150 motion-reduce:transition-none',
                      collapsed ? 'opacity-100' : 'opacity-0'
                    )}
                    aria-hidden
                  />
                ) : null}
              </span>
              <Fade collapsed={collapsed} className="flex-1">
                {label}
              </Fade>
              {badge ? (
                <Fade collapsed={collapsed} className="rounded-full bg-[var(--color-brand-cream)] px-1.5 text-xs font-semibold tabular-nums text-[var(--color-brand-900)]">
                  <span aria-hidden>{badge}</span>
                </Fade>
              ) : null}
            </PainelLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Sidebar({
  route,
  companySlug,
  collapsed = false,
  onNavigate,
  onSwitcherOpenChange,
  onExit,
  onLogout,
}: {
  route: PainelRoute
  /** Empresa em contexto (a da URL ou a última visitada). */
  companySlug: string | null
  /** Só ícones (a barra abre ao passar o mouse). */
  collapsed?: boolean
  onNavigate?: () => void
  /** Avisa quando o seletor de empresa abre/fecha, para a barra não recolher com ele aberto. */
  onSwitcherOpenChange?: (open: boolean) => void
  onExit: () => void
  onLogout: () => void
}) {
  const { profile, unread } = usePainel()
  const routeSlug = 'slug' in route ? route.slug : null
  const inCompany = (section: string) =>
    routeSlug === companySlug &&
    ((route.name === 'empresa' && route.section === section) ||
      (section === 'pesquisas' && ['diagnostico', 'pesquisa', 'pesquisa-nova'].includes(route.name)))
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0)

  const companyItems: NavItem[] = companySlug
    ? [
        { label: 'Visão geral', to: paths.empresa(companySlug), icon: LayoutDashboard, active: inCompany('visao-geral') },
        { label: 'Pesquisas', to: paths.empresa(companySlug, 'pesquisas'), icon: ClipboardList, active: inCompany('pesquisas') },
        { label: 'Denúncias', to: paths.empresa(companySlug, 'denuncias'), icon: ShieldAlert, active: inCompany('denuncias'), badge: unread[companySlug] },
        { label: 'Configurações', to: paths.empresa(companySlug, 'configuracoes'), icon: Settings, active: inCompany('configuracoes') },
      ]
    : []

  const officeItems: NavItem[] = [
    { label: 'Todas as empresas', to: paths.empresas(), icon: Building2, active: route.name === 'empresas' || route.name === 'empresa-nova' },
    { label: 'Todas as denúncias', to: paths.denuncias(), icon: Inbox, active: route.name === 'denuncias', badge: totalUnread },
    { label: 'Modelos de pesquisa', to: paths.modelos(), icon: BookOpen, active: route.name === 'modelos' || route.name === 'modelo' },
    { label: 'Equipe', to: paths.equipe(), icon: Users, active: route.name === 'equipe' },
  ]

  return (
    <div className="flex h-full flex-col bg-[var(--color-brand-900)] text-white">
      <div className="px-2 pb-3 pt-4">
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            navigate(paths.empresas())
          }}
          aria-label="CONFIARA: ir para as empresas"
          className="mb-4 ml-[10px] block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {/* Mesma imagem nos dois estados: recolhida mostra só o símbolo (o “C” com a estrela). */}
          <span
            className={cn('block overflow-hidden transition-[width] duration-200 ease-out motion-reduce:transition-none', collapsed ? 'w-7' : 'w-[140px]')}
          >
            <img src="/logos/logo-horizontal-branca.png" alt="" className="h-7 w-[140px] max-w-none object-contain object-left" width={140} height={28} />
          </span>
        </button>
        <CompanySwitcher currentSlug={companySlug} collapsed={collapsed} onNavigate={onNavigate} onOpenChange={onSwitcherOpenChange} />
      </div>
      {/* Em telas baixas a lista rola com a roda do mouse, mas sem a barra de rolagem nativa (que ocupa a faixa recolhida). */}
      <nav aria-label="Painel" className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {companyItems.length > 0 && <NavList title="Esta empresa" items={companyItems} collapsed={collapsed} onNavigate={onNavigate} />}
        <NavList title="Escritório" items={officeItems} collapsed={collapsed} onNavigate={onNavigate} />
      </nav>
      <div className="space-y-0.5 overflow-hidden border-t border-white/10 px-2 py-3">
        <PainelLink
          to={paths.perfil()}
          onClick={onNavigate}
          aria-current={route.name === 'perfil' ? 'page' : undefined}
          className={cn(itemBase, 'px-2 hover:bg-white/[0.06]', route.name === 'perfil' && 'bg-white/[0.12]')}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold" aria-hidden>
              {initials(profile.name)}
            </span>
          )}
          <Fade collapsed={collapsed} className="flex-1">
            <span className="block truncate text-sm font-medium">{profile.name}</span>
            <span className="block truncate text-xs text-[var(--color-brand-300)]">Meu perfil</span>
          </Fade>
        </PainelLink>
        <button type="button" onClick={onExit} className={cn(itemBase, 'w-full px-4 text-[var(--color-brand-200)] hover:bg-white/[0.06] hover:text-white')}>
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          <Fade collapsed={collapsed}>Ver o site</Fade>
        </button>
        <button type="button" onClick={onLogout} className={cn(itemBase, 'w-full px-4 text-[var(--color-brand-200)] hover:bg-white/[0.06] hover:text-white')}>
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          <Fade collapsed={collapsed}>Sair</Fade>
        </button>
      </div>
    </div>
  )
}
