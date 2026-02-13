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

/** Nome da empresa/organização (ex.: "Bismarchi Pires Sociedade de Advogados"). */
export function getAppName(): string {
  return (env.VITE_APP_NAME as string | undefined)?.trim() || 'Bismarchi Pires Sociedade de Advogados'
}

/** URL do logo (caminho relativo ou URL absoluta). Ex.: /logo.png ou https://... */
export function getAppLogoUrl(): string {
  return (env.VITE_APP_LOGO_URL as string | undefined)?.trim() || '/logo.png'
}

/** Nome do produto exibido no header (ex.: "Diagnóstico HSE-IT"). */
export function getProductName(): string {
  return (env.VITE_PRODUCT_NAME as string | undefined)?.trim() || 'Diagnóstico HSE-IT'
}
