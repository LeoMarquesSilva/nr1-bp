import { useCallback, useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { logoutAdmin } from '@/lib/adminAuth'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { AdminPerfil } from '@/components/admin/AdminPerfil'
import { AdminUsuarios } from '@/components/admin/usuarios/AdminUsuarios'
import { ForcePasswordChangeModal } from '@/components/admin/ForcePasswordChangeModal'
import { PainelProvider, usePainel, type PainelProfile } from './PainelContext'
import { Sidebar, SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from './Sidebar'
import { useCanHover, useSidebarHover } from './useSidebarHover'
import { cn } from '@/lib/utils'
import { CompanySwitcher } from './CompanySwitcher'
import { navigate, parsePainelPath, paths, useLocationKey, type PainelRoute } from './router'
import { Button, EmptyState, PageHeader, PageSkeleton, PainelLink } from './ui'
import { EmpresasPage } from './pages/EmpresasPage'
import { EmpresaNovaPage, EmpresaConfiguracoesPage } from './pages/EmpresaFormPages'
import { EmpresaVisaoGeralPage } from './pages/EmpresaVisaoGeralPage'
import { DiagnosticoPage } from './pages/DiagnosticoPage'
import { DenunciasPage } from './pages/DenunciasPage'
import { PesquisasPage } from './pages/PesquisasPage'
import { NovaPesquisaPage } from './pages/NovaPesquisaPage'
import { PesquisaPage } from './pages/PesquisaPage'
import { ModelosPage } from './pages/ModelosPage'
import { ModeloPage } from './pages/ModeloPage'

type Props = {
  /** Sai do painel para o site público (mantém a sessão). */
  onExit: () => void
  onLogout: () => void
}

/** Painel administrativo: confere a sessão de admin e monta o shell com navegação por URL. */
export function PainelLayout({ onExit, onLogout }: Props) {
  const [profile, setProfile] = useState<PainelProfile | null>(null)
  const [checked, setChecked] = useState(false)

  const loadProfile = useCallback(
    (onDenied?: () => void) => {
      const supabase = getSupabase()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user?.id) {
          setChecked(true)
          onDenied?.()
          return
        }
        supabase
          .from('users')
          .select('id, name, email, role, avatar_url, department, requires_password_change')
          .eq('auth_id', session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            setChecked(true)
            if (data && data.role === 'admin') setProfile(data as PainelProfile)
            else onDenied?.()
          })
      })
    },
    []
  )

  useEffect(() => {
    loadProfile(() => {
      logoutAdmin()
      getSupabase().auth.signOut().finally(onLogout)
    })
  }, [loadProfile, onLogout])

  const handleLogout = () => {
    getSupabase()
      .auth.signOut()
      .finally(() => {
        logoutAdmin()
        onLogout()
      })
  }

  if (!checked || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-brand-50)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-200)] border-t-[var(--color-brand-700)] motion-reduce:animate-none" aria-label="Carregando" />
      </div>
    )
  }

  return (
    <PainelProvider profile={profile} refreshProfile={() => loadProfile()}>
      {profile.requires_password_change && (
        <ForcePasswordChangeModal onSuccess={() => setProfile({ ...profile, requires_password_change: false })} onLogout={handleLogout} />
      )}
      <Shell onExit={onExit} onLogout={handleLogout} />
    </PainelProvider>
  )
}

function Shell({ onExit, onLogout }: { onExit: () => void; onLogout: () => void }) {
  const locationKey = useLocationKey()
  const pathname = locationKey.split('?')[0]
  const route = parsePainelPath(pathname)
  const { lastSlug, rememberSlug, companies, companyBySlug } = usePainel()
  const [menuOpen, setMenuOpen] = useState(false)
  const canHover = useCanHover()
  const { ref: asideRef, expanded, setLocked, handlers } = useSidebarHover(canHover)

  const routeSlug = 'slug' in route ? route.slug : null
  const companySlug = routeSlug ?? lastSlug

  useEffect(() => {
    if (pathname === '/painel' || pathname === '/painel/') navigate(paths.empresas(), { replace: true })
  }, [pathname])

  useEffect(() => {
    if (routeSlug && companyBySlug(routeSlug)) rememberSlug(routeSlug)
  }, [routeSlug, companyBySlug, rememberSlug])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  // A gaveta do celular fecha em qualquer troca de página (inclusive pelo voltar do navegador).
  useEffect(() => setMenuOpen(false), [locationKey])

  // Se a janela crescer para o tamanho de computador com a gaveta aberta, fecha a gaveta.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const onChange = () => mql.matches && setMenuOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const unknownCompany = routeSlug && companies !== null && !companyBySlug(routeSlug)
  const collapsed = canHover && !expanded
  // Com mouse, o conteúdo fica ao lado da faixa recolhida e a barra aberta passa por cima dele (sem empurrar a página).
  const sidebarSpace = canHover ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W

  return (
    <div
      className="min-h-screen bg-[var(--color-brand-50)] font-reading text-[var(--color-brand-900)] antialiased"
      style={{ '--painel-sidebar-w': sidebarSpace } as React.CSSProperties}
    >
      <aside
        ref={asideRef}
        {...handlers}
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden transition-[width,box-shadow] duration-200 ease-out motion-reduce:transition-none md:block',
          canHover && expanded && 'shadow-[8px_0_24px_-12px_rgba(4,12,30,0.45)]'
        )}
        style={{ width: collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W }}
      >
        <Sidebar route={route} companySlug={companySlug} collapsed={collapsed} onSwitcherOpenChange={setLocked} onExit={onExit} onLogout={onLogout} />
      </aside>

      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[var(--color-brand-900)] px-4 py-2.5 md:hidden">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <SheetContent side="left" showCloseButton={false} className="w-72 max-w-[85vw] gap-0 border-0 p-0">
            <SheetTitle className="sr-only">Menu do painel</SheetTitle>
            <Sidebar route={route} companySlug={companySlug} onNavigate={() => setMenuOpen(false)} onExit={onExit} onLogout={onLogout} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <CompanySwitcher currentSlug={companySlug} />
        </div>
      </div>

      <div className="md:pl-[var(--painel-sidebar-w)]">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {unknownCompany ? <EmpresaNaoEncontrada slug={routeSlug} /> : <Page key={pageKey(route)} route={route} />}
        </main>
      </div>
    </div>
  )
}

/**
 * Identidade da página: muda ao trocar de tela, de empresa ou de pesquisa (a página remonta limpa,
 * sem mostrar dados da empresa anterior). Trocar de aba dentro da mesma tela não remonta.
 */
function pageKey(route: PainelRoute): string {
  const slug = 'slug' in route ? route.slug : ''
  const id = 'id' in route ? route.id : ''
  const section = route.name === 'empresa' ? route.section : ''
  return [route.name, slug, id, section].join(':')
}

function Page({ route }: { route: PainelRoute }) {
  const { companies, profile, refreshProfile } = usePainel()
  const needsCompanies = 'slug' in route
  if (needsCompanies && companies === null) return <PageSkeleton />

  switch (route.name) {
    case 'empresas':
      return <EmpresasPage />
    case 'empresa-nova':
      return <EmpresaNovaPage />
    case 'empresa':
      if (route.section === 'pesquisas') return <PesquisasPage slug={route.slug} />
      if (route.section === 'denuncias') return <DenunciasPage slug={route.slug} />
      if (route.section === 'configuracoes') return <EmpresaConfiguracoesPage slug={route.slug} />
      return <EmpresaVisaoGeralPage slug={route.slug} />
    case 'diagnostico':
      return <DiagnosticoPage slug={route.slug} tab={route.tab} />
    case 'pesquisa-nova':
      return <NovaPesquisaPage slug={route.slug} />
    case 'pesquisa':
      return <PesquisaPage slug={route.slug} id={route.id} tab={route.tab} />
    case 'denuncias':
      return <DenunciasPage />
    case 'modelos':
      return <ModelosPage />
    case 'modelo':
      return <ModeloPage id={route.id} />
    case 'equipe':
      return (
        <>
          <PageHeader title="Equipe" description="Pessoas do escritório com acesso ao painel. Só a equipe tem login; colaboradores das empresas usam apenas os links públicos." />
          <AdminUsuarios />
        </>
      )
    case 'perfil':
      return (
        <>
          <PageHeader title="Meu perfil" />
          <AdminPerfil profile={profile} onProfileUpdated={refreshProfile} />
        </>
      )
    case 'nao-encontrado':
      return (
        <EmptyState
          title="Página não encontrada"
          description="O endereço pode ter mudado com a nova organização do painel."
          action={
            <Button asChild variant="outline">
              <PainelLink to={paths.empresas()}>Ir para as empresas</PainelLink>
            </Button>
          }
        />
      )
  }
}

function EmpresaNaoEncontrada({ slug }: { slug: string }) {
  const { overview } = usePainel()
  const hasData = Boolean(overview[slug])
  return (
    <EmptyState
      title="Empresa não encontrada"
      description={
        hasData
          ? `“${slug}” tem respostas de diagnóstico, mas não está no cadastro. Cadastre a empresa com o mesmo identificador para gerenciá-la.`
          : `Não existe empresa cadastrada com o identificador “${slug}”.`
      }
      action={
        <Button asChild variant="outline">
          <PainelLink to={paths.empresas()}>Ver todas as empresas</PainelLink>
        </Button>
      }
    />
  )
}
