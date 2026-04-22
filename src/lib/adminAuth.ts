/**
 * Sinalizador de sessão do painel admin (após login com Supabase Auth em Login).
 * Não substitui autenticação: o painel valida JWT e `public.users` em AdminLayout.
 */
const SESSION_KEY = 'hseit_admin_session'

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

export function setAdminSession(): void {
  sessionStorage.setItem(SESSION_KEY, 'true')
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
