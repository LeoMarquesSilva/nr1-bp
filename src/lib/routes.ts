export type AppRouteView =
  | 'landing'
  | 'relatos-buscar'
  | 'sobre'
  | 'privacidade'
  | 'contato'
  | 'login'

const VIEW_PATHS: Record<AppRouteView, string> = {
  landing: '/',
  'relatos-buscar': '/canal-de-denuncia',
  sobre: '/sobre',
  privacidade: '/privacidade',
  contato: '/contato',
  login: '/entrar',
}

const PATH_VIEWS = new Map<string, AppRouteView>(
  Object.entries(VIEW_PATHS).map(([view, path]) => [path, view as AppRouteView])
)

export function isRoutableView(view: string): view is AppRouteView {
  return view in VIEW_PATHS
}

export function getPathForView(view: AppRouteView): string {
  return VIEW_PATHS[view]
}

export function getViewFromPath(pathname: string): AppRouteView | null {
  const normalized = normalizePath(pathname)
  return PATH_VIEWS.get(normalized) ?? null
}

export function getHrefForView(view: AppRouteView): string {
  return getPathForView(view)
}

export function normalizePath(pathname: string): string {
  if (!pathname) return '/'
  if (pathname === '/') return '/'
  const trimmed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return trimmed || '/'
}
