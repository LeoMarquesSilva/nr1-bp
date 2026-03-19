/**
 * Multi-tenant: cada empresa (cliente) tem um tenant_id único.
 * O tenant pode vir da URL (?org=slug) quando você envia o link ao cliente — assim ele não preenche nada.
 * No dashboard você escolhe qual empresa ver.
 */

const env = import.meta.env

let urlTenantOverride: string | null = null

/**
 * Chamado ao carregar a página. Lê ?org=slug da URL e define o tenant para esta sessão.
 * Link para o cliente: https://seusite.com/?org=empresa-alpha
 */
export function setTenantFromUrl(): void {
  try {
    const params = new URLSearchParams(window.location.search)
    const org = params.get('org')?.trim().toLowerCase()
    urlTenantOverride = org || null
  } catch {
    urlTenantOverride = null
  }
}

/**
 * ID da empresa no contexto atual:
 * - Se a página foi aberta com ?org=slug (link que você envia ao cliente), usa esse slug.
 * - Senão, usa VITE_TENANT_ID do .env (seu uso interno) ou "default".
 */
export function getTenantId(): string {
  if (urlTenantOverride) return urlTenantOverride
  const id = env.VITE_TENANT_ID as string | undefined
  return (id?.trim() || 'default').toLowerCase()
}

/** Nome da empresa/organização. Usa VITE_APP_NAME; fallback "NR1 Form". */
export function getAppName(): string {
  return (env.VITE_APP_NAME as string | undefined)?.trim() || 'NR1 Form'
}

/** URL do logo (caminho relativo ou URL absoluta). Ex.: /logo.png ou https://... */
export function getAppLogoUrl(): string {
  return (env.VITE_APP_LOGO_URL as string | undefined)?.trim() || '/logo.png'
}

/** Nome do produto exibido no header. Usa VITE_PRODUCT_NAME; fallback "NR1 Form". */
export function getProductName(): string {
  return (env.VITE_PRODUCT_NAME as string | undefined)?.trim() || 'NR1 Form'
}

/** Link do questionário (?org= sem channel=denuncia): ocultar atalho ao canal de denúncia no header/rodapé. */
export function isDiagnosticParticipantFlow(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  const org = params.get('org')?.trim()
  const channel = params.get('channel')
  return Boolean(org && channel !== 'denuncia')
}
