/**
 * Autenticação admin apenas no cliente.
 * Em produção, a senha deve ser validada no backend.
 * A senha padrão pode ser sobrescrita por VITE_ADMIN_PASSWORD no .env
 */
const DEFAULT_ADMIN_PASSWORD = 'admin123'
const SESSION_KEY = 'hseit_admin_session'

function getExpectedPassword(): string {
  return typeof import.meta.env.VITE_ADMIN_PASSWORD === 'string' &&
    import.meta.env.VITE_ADMIN_PASSWORD.length > 0
    ? import.meta.env.VITE_ADMIN_PASSWORD
    : DEFAULT_ADMIN_PASSWORD
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

export function loginAdmin(password: string): boolean {
  if (password === getExpectedPassword()) {
    sessionStorage.setItem(SESSION_KEY, 'true')
    return true
  }
  return false
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
