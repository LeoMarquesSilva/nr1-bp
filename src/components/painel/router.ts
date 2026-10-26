import { useSyncExternalStore } from 'react'

/** Seções dentro de uma empresa. */
export type EmpresaSection = 'visao-geral' | 'pesquisas' | 'denuncias' | 'configuracoes'
export type PesquisaTab = 'perguntas' | 'compartilhar' | 'resultados'
export type DiagnosticoTab = 'resultados' | 'setores' | 'compartilhar' | 'perguntas'

export type PainelRoute =
  | { name: 'empresas' }
  | { name: 'empresa-nova' }
  | { name: 'empresa'; slug: string; section: EmpresaSection }
  | { name: 'diagnostico'; slug: string; tab: DiagnosticoTab }
  | { name: 'pesquisa-nova'; slug: string }
  | { name: 'pesquisa'; slug: string; id: string; tab: PesquisaTab }
  | { name: 'denuncias' }
  | { name: 'modelos' }
  | { name: 'modelo'; id: string }
  | { name: 'equipe' }
  | { name: 'perfil' }
  | { name: 'nao-encontrado' }

export const PAINEL_BASE = '/painel'
export const DIAGNOSTICO_ID = 'diagnostico-nr1'

const NAV_EVENT = 'painel:navigate'

const SECTIONS: EmpresaSection[] = ['pesquisas', 'denuncias', 'configuracoes']
const PESQUISA_TABS: PesquisaTab[] = ['compartilhar', 'resultados']
const DIAGNOSTICO_TABS: DiagnosticoTab[] = ['setores', 'compartilhar', 'perguntas']

export function isPainelPath(pathname: string): boolean {
  return pathname === PAINEL_BASE || pathname.startsWith(`${PAINEL_BASE}/`)
}

export function parsePainelPath(pathname: string): PainelRoute {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean).map(decodeURIComponent)
  if (parts[0] !== 'painel') return { name: 'nao-encontrado' }
  const [, area, a, b, c, d] = parts
  if (!area) return { name: 'empresas' }
  if (area === 'denuncias' && !a) return { name: 'denuncias' }
  if (area === 'modelos') return a ? { name: 'modelo', id: a } : { name: 'modelos' }
  if (area === 'equipe' && !a) return { name: 'equipe' }
  if (area === 'perfil' && !a) return { name: 'perfil' }
  if (area !== 'empresas') return { name: 'nao-encontrado' }
  if (!a) return { name: 'empresas' }
  if (a === 'nova' && !b) return { name: 'empresa-nova' }
  const slug = a
  if (!b) return { name: 'empresa', slug, section: 'visao-geral' }
  if (!SECTIONS.includes(b as EmpresaSection)) return { name: 'nao-encontrado' }
  if (b !== 'pesquisas' || !c) return d ? { name: 'nao-encontrado' } : { name: 'empresa', slug, section: b as EmpresaSection }
  if (c === 'nova' && !d) return { name: 'pesquisa-nova', slug }
  if (c === DIAGNOSTICO_ID) {
    if (!d) return { name: 'diagnostico', slug, tab: 'resultados' }
    return DIAGNOSTICO_TABS.includes(d as DiagnosticoTab) ? { name: 'diagnostico', slug, tab: d as DiagnosticoTab } : { name: 'nao-encontrado' }
  }
  if (!d) return { name: 'pesquisa', slug, id: c, tab: 'perguntas' }
  return PESQUISA_TABS.includes(d as PesquisaTab) ? { name: 'pesquisa', slug, id: c, tab: d as PesquisaTab } : { name: 'nao-encontrado' }
}

const enc = encodeURIComponent

export const paths = {
  empresas: () => `${PAINEL_BASE}/empresas`,
  empresaNova: () => `${PAINEL_BASE}/empresas/nova`,
  empresa: (slug: string, section: EmpresaSection = 'visao-geral') =>
    section === 'visao-geral' ? `${PAINEL_BASE}/empresas/${enc(slug)}` : `${PAINEL_BASE}/empresas/${enc(slug)}/${section}`,
  diagnostico: (slug: string, tab: DiagnosticoTab = 'resultados') =>
    `${PAINEL_BASE}/empresas/${enc(slug)}/pesquisas/${DIAGNOSTICO_ID}${tab === 'resultados' ? '' : `/${tab}`}`,
  pesquisaNova: (slug: string) => `${PAINEL_BASE}/empresas/${enc(slug)}/pesquisas/nova`,
  pesquisa: (slug: string, id: string, tab: PesquisaTab = 'perguntas') =>
    `${PAINEL_BASE}/empresas/${enc(slug)}/pesquisas/${enc(id)}${tab === 'perguntas' ? '' : `/${tab}`}`,
  denuncias: () => `${PAINEL_BASE}/denuncias`,
  modelos: () => `${PAINEL_BASE}/modelos`,
  modelo: (id: string) => `${PAINEL_BASE}/modelos/${enc(id)}`,
  equipe: () => `${PAINEL_BASE}/equipe`,
  perfil: () => `${PAINEL_BASE}/perfil`,
}

/** Navega dentro do painel sem recarregar a página (mantém o histórico do navegador). */
export function navigate(to: string, options: { replace?: boolean } = {}): void {
  const current = `${window.location.pathname}${window.location.search}`
  if (current === to) return
  if (options.replace) window.history.replaceState({}, '', to)
  else window.history.pushState({}, '', to)
  window.dispatchEvent(new Event(NAV_EVENT))
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAV_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAV_EVENT, onChange)
  }
}

function getLocationKey(): string {
  return `${window.location.pathname}${window.location.search}`
}

/** Caminho + query atuais; re-renderiza a cada navegação. */
export function useLocationKey(): string {
  return useSyncExternalStore(subscribe, getLocationKey, () => PAINEL_BASE)
}

export function useSearchParam(name: string): string | null {
  const key = useLocationKey()
  const query = key.includes('?') ? key.slice(key.indexOf('?')) : ''
  return new URLSearchParams(query).get(name)
}

export function setSearchParam(name: string, value: string | null, options: { replace?: boolean } = {}): void {
  const params = new URLSearchParams(window.location.search)
  if (value == null) params.delete(name)
  else params.set(name, value)
  const qs = params.toString()
  navigate(`${window.location.pathname}${qs ? `?${qs}` : ''}`, options)
}

/** Clique simples navega dentro do app; Ctrl/Cmd/meio-clique abrem nova aba normalmente. */
export function handleLinkClick(event: React.MouseEvent<HTMLAnchorElement>, to: string): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate(to)
}
