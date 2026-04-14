import { useState, useEffect, lazy, Suspense } from 'react'
import { HealthqoeHeader } from './components/layout/header'
import type { OptionKey } from './data/hseIt'
import { saveSubmission, getTenantStatus, getTenantDisplayName, getTenantWhistleblowerStatus } from './services/api'
import { isAdminLoggedIn } from './lib/adminAuth'
import { getAppName, getTenantId, isDiagnosticParticipantFlow, setTenantFromUrl } from './lib/tenant'
import { Footer } from './components/layout/Footer'
import { getSeoDescriptionForView, getSeoTitleForView } from './lib/seo'
import { buildDenunciaUrl, getPathForView, getViewFromPath, isRoutableView, normalizePath } from './lib/routes'
import { FeedbackHost } from './components/ui/FeedbackHost'
import { feedback } from './lib/feedback'
import { trackEvent } from './lib/telemetry'
import { initGlobalErrorMonitoring } from './lib/observability'

const Identificacao = lazy(() => import('./components/Identificacao').then((m) => ({ default: m.Identificacao })))
const FormDiagnostico = lazy(() => import('./components/FormDiagnostico').then((m) => ({ default: m.FormDiagnostico })))
const Obrigado = lazy(() => import('./components/Obrigado').then((m) => ({ default: m.Obrigado })))
const ColetaEncerrada = lazy(() => import('./components/ColetaEncerrada').then((m) => ({ default: m.ColetaEncerrada })))
const WhistleblowerForm = lazy(() => import('./components/WhistleblowerForm').then((m) => ({ default: m.WhistleblowerForm })))
const WhistleblowerThanks = lazy(() => import('./components/WhistleblowerThanks').then((m) => ({ default: m.WhistleblowerThanks })))
const ConsultarDenuncia = lazy(() => import('./components/ConsultarDenuncia').then((m) => ({ default: m.ConsultarDenuncia })))
const LandingPage = lazy(() => import('./components/LandingPage').then((m) => ({ default: m.LandingPage })))
const RelatosBuscarEmpresa = lazy(() => import('./components/RelatosBuscarEmpresa').then((m) => ({ default: m.RelatosBuscarEmpresa })))
const CanalRelatosHub = lazy(() => import('./components/CanalRelatosHub').then((m) => ({ default: m.CanalRelatosHub })))
const Sobre = lazy(() => import('./components/Sobre').then((m) => ({ default: m.Sobre })))
const Privacidade = lazy(() => import('./components/Privacidade').then((m) => ({ default: m.Privacidade })))
const AdminLayout = lazy(() => import('./components/admin').then((m) => ({ default: m.AdminLayout })))
const Login = lazy(() => import('./components/Login').then((m) => ({ default: m.Login })))
const Contato = lazy(() => import('./components/Contato').then((m) => ({ default: m.Contato })))

export type View = 'landing' | 'relatos-buscar' | 'identificacao' | 'form' | 'obrigado' | 'sobre' | 'privacidade' | 'admin-gate' | 'admin' | 'coleta-encerrada' | 'denuncia-hub' | 'denuncia' | 'denuncia-obrigado' | 'denuncia-consultar' | 'login' | 'contato'

function isDenunciaChannel(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('channel') === 'denuncia'
}

function getDenunciaViewFromUrl(): View {
  if (typeof window === 'undefined') return 'denuncia'
  const params = new URLSearchParams(window.location.search)
  const org = params.get('org')?.trim()
  const form = params.get('form') === '1'
  const consultar = params.get('consultar') === '1'
  if (org && form) return 'denuncia'
  if (org && consultar) return 'denuncia-consultar'
  if (org) return 'denuncia-hub'
  return 'relatos-buscar'
}

/** Se a URL tem ?org=slug (sem channel=denuncia), o link é do diagnóstico: ir direto para identificação. */
function hasDiagnosticOrgInUrl(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  const org = params.get('org')?.trim()
  const channel = params.get('channel')
  return Boolean(org && channel !== 'denuncia')
}

function App() {
  const [view, setView] = useState<View>(() => {
    if (hasDiagnosticOrgInUrl()) return 'identificacao'
    if (isDenunciaChannel()) return getDenunciaViewFromUrl()
    if (isAdminLoggedIn()) return 'admin'
    if (typeof window !== 'undefined') return getViewFromPath(window.location.pathname) ?? 'landing'
    return 'landing'
  })
  const [identificacao, setIdentificacao] = useState<{ setor: string } | null>(null)
  const [tenantBlocked, setTenantBlocked] = useState<boolean | null>(null)
  const [denunciaProtocolId, setDenunciaProtocolId] = useState<string | null>(null)
  const [denunciaFoiAnonima, setDenunciaFoiAnonima] = useState(true)
  const [hubOrgDisplayName, setHubOrgDisplayName] = useState<string | null>(null)
  const [whistleblowerEnabled, setWhistleblowerEnabled] = useState<boolean | null>(null)

  const handleIdentificacao = (setor: string) => {
    trackEvent({ name: 'diagnostico_identificacao_start', flow: 'diagnostico', tenantId: getTenantId(), step: 'identificacao' })
    setIdentificacao({ setor })
    setView('form')
  }

  const handleFormSubmit = async (answers: Record<number, OptionKey>, setor: string) => {
    try {
      await saveSubmission(setor, answers)
      trackEvent({ name: 'diagnostico_submit_success', flow: 'diagnostico', tenantId: getTenantId(), step: 'submit' })
      setIdentificacao(null)
      setView('obrigado')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível enviar. Tente novamente.'
      trackEvent({ name: 'api_error', flow: 'diagnostico', tenantId: getTenantId(), step: 'submit', meta: { message } })
      feedback.error(message)
    }
  }

  const closeAdmin = () => {
    setView('landing')
  }

  const handleAdminLogout = () => {
    setView('landing')
  }

  useEffect(() => {
    if (hasDiagnosticOrgInUrl()) {
      setTenantFromUrl()
      setView((v) => (['identificacao', 'form', 'obrigado'].includes(v) ? v : 'identificacao'))
    }
  }, [])

  useEffect(() => initGlobalErrorMonitoring(), [])

  useEffect(() => {
    const onPopState = () => {
      if (hasDiagnosticOrgInUrl()) {
        setView('identificacao')
        return
      }
      if (isDenunciaChannel()) {
        setView(getDenunciaViewFromUrl())
        return
      }
      setView(getViewFromPath(window.location.pathname) ?? 'landing')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (view !== 'identificacao') return
    getTenantStatus(getTenantId()).then((s) => setTenantBlocked(!s.active))
  }, [view])

  useEffect(() => {
    if (view !== 'denuncia-hub') return
    getTenantDisplayName(getTenantId()).then(setHubOrgDisplayName)
  }, [view])

  useEffect(() => {
    if (!['denuncia-hub', 'denuncia'].includes(view)) return
    setWhistleblowerEnabled(null)
    getTenantWhistleblowerStatus(getTenantId()).then((status) => setWhistleblowerEnabled(status.enabled))
  }, [view])

  useEffect(() => {
    trackEvent({
      name: 'view_open',
      flow:
        view === 'landing'
          ? 'landing'
          : view.startsWith('denuncia')
            ? 'denuncia'
            : ['identificacao', 'form', 'obrigado'].includes(view)
              ? 'diagnostico'
              : view.startsWith('admin')
                ? 'admin'
                : undefined,
      tenantId: getTenantId(),
      step: view,
    })
  }, [view])

  useEffect(() => {
    document.title = getSeoTitleForView(view)
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', getSeoDescriptionForView(view))
    const canonical = document.querySelector('link[rel="canonical"]')
    const canonicalPath = isRoutableView(view) ? getPathForView(view) : window.location.pathname || '/'
    const canonicalHref = `${window.location.origin}${canonicalPath}`
    if (canonical) canonical.setAttribute('href', canonicalHref)
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', canonicalHref)
  }, [view])

  useEffect(() => {
    if (!isRoutableView(view)) return
    if (hasDiagnosticOrgInUrl() || isDenunciaChannel()) return
    const targetPath = getPathForView(view)
    const currentPath = normalizePath(window.location.pathname)
    if (currentPath === targetPath && !window.location.search) return
    window.history.pushState({}, '', targetPath)
  }, [view])

  const showNavAndAdmin = ['landing', 'relatos-buscar', 'identificacao', 'form', 'obrigado', 'sobre', 'privacidade', 'coleta-encerrada', 'denuncia-hub', 'denuncia', 'denuncia-obrigado', 'login', 'contato'].includes(view)
  const showFooter = view !== 'obrigado'

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://confiara.local/'
  const renderFallback = (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-400)] border-t-transparent" />
    </div>
  )

  if (view === 'admin') {
    return (
      <div className="app-bg min-h-screen font-sans antialiased">
        <Suspense fallback={renderFallback}>
          <AdminLayout onClose={closeAdmin} onLogout={handleAdminLogout} />
        </Suspense>
      </div>
    )
  }

  if (view === 'denuncia-hub' || view === 'denuncia' || view === 'denuncia-obrigado' || view === 'denuncia-consultar') {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-brand-900)] font-sans antialiased">
        <HealthqoeHeader view="identificacao" onNavigate={() => {}} showNavAndAdmin={false} appearance="dark" />
        <div className="denuncia-flow-canvas px-4 py-10 sm:px-6 sm:py-14">
          <main className="mx-auto w-full max-w-2xl">
          <Suspense fallback={renderFallback}>
          {['denuncia-hub', 'denuncia'].includes(view) && whistleblowerEnabled === null && renderFallback}
          {['denuncia-hub', 'denuncia'].includes(view) && whistleblowerEnabled === false && (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-white backdrop-blur-md sm:p-10">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Canal indisponível</h1>
              <p className="mx-auto mt-4 max-w-lg text-sm text-[var(--color-brand-100)] sm:text-base">
                O canal de denúncias desta organização está desativado no momento. Se você recebeu este link por engano, solicite atualização ao responsável da empresa.
              </p>
              <button
                type="button"
                onClick={() => { window.location.href = window.location.origin + (window.location.pathname || '/') }}
                className="mt-7 inline-flex rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                Voltar ao site
              </button>
            </div>
          )}
          {view === 'denuncia-hub' && whistleblowerEnabled === true && (
            <CanalRelatosHub
              orgSlug={getTenantId()}
              orgDisplayName={hubOrgDisplayName}
              onEnviarDenuncia={() => {
                trackEvent({ name: 'denuncia_flow_open', flow: 'denuncia', tenantId: getTenantId(), step: 'hub' })
                window.location.href = buildDenunciaUrl(baseUrl, getTenantId(), 'form')
              }}
              onAcompanharCodigo={() => {
                trackEvent({ name: 'denuncia_consulta_open', flow: 'denuncia', tenantId: getTenantId(), step: 'hub' })
                window.location.href = buildDenunciaUrl(baseUrl, getTenantId(), 'consultar')
              }}
            />
          )}
          {view === 'denuncia' && whistleblowerEnabled === true && (
            <WhistleblowerForm
              onEnviado={(protocolId, meta) => {
                trackEvent({ name: 'denuncia_submit_success', flow: 'denuncia', tenantId: getTenantId(), step: 'submit' })
                setDenunciaProtocolId(protocolId)
                setDenunciaFoiAnonima(meta.isAnonymous)
                setView('denuncia-obrigado')
              }}
              onConsultar={() => setView('denuncia-consultar')}
            />
          )}
          {view === 'denuncia-obrigado' && denunciaProtocolId && (
            <WhistleblowerThanks
              protocolId={denunciaProtocolId}
              isAnonymous={denunciaFoiAnonima}
              onFechar={() => { setDenunciaProtocolId(null); window.location.href = window.location.origin + (window.location.pathname || '/') }}
              onConsultar={() => { setDenunciaProtocolId(null); setView('denuncia-consultar') }}
            />
          )}
          {view === 'denuncia-consultar' && (
            <ConsultarDenuncia onVoltar={() => setView('denuncia')} />
          )}
          </Suspense>
          </main>
        </div>
        <footer className="mt-auto border-t border-white/10 bg-[var(--color-brand-900)] py-6">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <p className="text-xs text-[var(--color-brand-200)]">
              {getAppName()} · Canal de denúncias
            </p>
            <a
              href={baseUrl}
              className="mt-3 inline-block text-sm font-semibold text-[var(--color-brand-cream)] transition hover:text-white hover:underline"
            >
              Voltar ao site
            </a>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="flow-brand-surface flex min-h-screen flex-col font-sans antialiased">
      <FeedbackHost />
      {/*
        Header appearance: landing uses dark (aligns with full-bleed hero / landing-premium-bg).
        All other public views use light header on flow-brand-surface for readability and parity
        with Footer. See docs/CONFIARA-DESIGN-SYSTEM.md §7. Fluxo denúncia (?channel=denuncia) uses
        a separate branch with appearance="dark" over denuncia-flow-canvas.
      */}
      <HealthqoeHeader
        view={view}
        onNavigate={setView}
        showNavAndAdmin={showNavAndAdmin}
        hideCanalDenunciaNav={isDiagnosticParticipantFlow()}
        appearance={view === 'landing' ? 'dark' : 'light'}
      />

      <main
        className={
          view === 'landing'
            ? 'mx-auto w-full flex-1 px-0 pt-0 pb-0'
            : 'mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-12'
        }
      >
        <Suspense fallback={renderFallback}>
        {view === 'landing' && (
          <LandingPage onFazerRelato={() => {
            trackEvent({ name: 'landing_cta_click', flow: 'landing', step: 'hero' })
            setView('relatos-buscar')
          }} />
        )}

        {view === 'relatos-buscar' && (
          <RelatosBuscarEmpresa onVoltar={() => setView('landing')} />
        )}

        {view === 'identificacao' && tenantBlocked === true && (
          <ColetaEncerrada onVoltar={() => { window.location.href = window.location.origin + (window.location.pathname || '/') }} />
        )}
        {view === 'identificacao' && tenantBlocked === false && (
          <Identificacao onIniciar={handleIdentificacao} />
        )}
        {view === 'identificacao' && tenantBlocked === null && (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--escritorio-dourado)] border-t-transparent" />
          </div>
        )}

        {view === 'form' && identificacao && (
          <FormDiagnostico
            setor={identificacao.setor}
            onSubmit={handleFormSubmit}
            initialAnswers={{}}
          />
        )}

        {view === 'obrigado' && (
          <Obrigado onVoltar={() => setView('landing')} />
        )}

        {view === 'sobre' && (
          <Sobre onVoltar={() => setView('landing')} />
        )}

        {view === 'privacidade' && (
          <Privacidade onVoltar={() => setView('landing')} />
        )}

        {view === 'login' && (
          <Login
            onSuccess={() => setView('admin')}
            onCancel={() => setView('landing')}
          />
        )}

        {view === 'contato' && (
          <Contato onVoltar={() => setView('landing')} />
        )}
        </Suspense>
      </main>

      {showFooter && (
        <Footer
          onNavigate={(v) => setView(v as View)}
          hideCanalDenunciaNav={isDiagnosticParticipantFlow()}
        />
      )}
    </div>
  )
}

export default App
