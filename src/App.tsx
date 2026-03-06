import { useState, useEffect } from 'react'
import { HealthqoeHeader } from './components/layout/header'
import { Identificacao } from './components/Identificacao'
import { FormDiagnostico } from './components/FormDiagnostico'
import { Obrigado } from './components/Obrigado'
import { ColetaEncerrada } from './components/ColetaEncerrada'
import { WhistleblowerForm } from './components/WhistleblowerForm'
import { WhistleblowerThanks } from './components/WhistleblowerThanks'
import { ConsultarDenuncia } from './components/ConsultarDenuncia'
import { LandingPage } from './components/LandingPage'
import { RelatosBuscarEmpresa } from './components/RelatosBuscarEmpresa'
import { CanalRelatosHub } from './components/CanalRelatosHub'
import { Sobre } from './components/Sobre'
import { Privacidade } from './components/Privacidade'
import { AdminLogin } from './components/AdminLogin'
import { AdminLayout } from './components/admin'
import { Login } from './components/Login'
import { Contato } from './components/Contato'
import type { OptionKey } from './data/hseIt'
import { saveSubmission, getTenantStatus } from './types/submission'
import { isAdminLoggedIn } from './lib/adminAuth'
import { getAppName, getTenantId } from './lib/tenant'
import { getTenantDisplayName } from './types/submission'

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

function App() {
  const [view, setView] = useState<View>(() => {
    if (isAdminLoggedIn()) return 'admin'
    if (isDenunciaChannel()) return getDenunciaViewFromUrl()
    return 'landing'
  })
  const [identificacao, setIdentificacao] = useState<{ setor: string } | null>(null)
  const [tenantBlocked, setTenantBlocked] = useState<boolean | null>(null)
  const [denunciaProtocolId, setDenunciaProtocolId] = useState<string | null>(null)
  const [hubOrgDisplayName, setHubOrgDisplayName] = useState<string | null>(null)

  const handleIdentificacao = (setor: string) => {
    setIdentificacao({ setor })
    setView('form')
  }

  const handleFormSubmit = async (answers: Record<number, OptionKey>, setor: string) => {
    try {
      await saveSubmission(setor, answers)
      setIdentificacao(null)
      setView('obrigado')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível enviar. Tente novamente.'
      alert(message)
    }
  }

  const openAdminGate = () => {
    setView('admin-gate')
  }

  const openAdmin = () => {
    setView('admin')
  }

  const closeAdmin = () => {
    setView('landing')
  }

  const handleAdminLogout = () => {
    setView('landing')
  }

  useEffect(() => {
    if (view !== 'identificacao') return
    getTenantStatus(getTenantId()).then((s) => setTenantBlocked(!s.active))
  }, [view])

  useEffect(() => {
    if (view !== 'denuncia-hub') return
    getTenantDisplayName(getTenantId()).then(setHubOrgDisplayName)
  }, [view])

  const showNavAndAdmin = ['landing', 'relatos-buscar', 'identificacao', 'form', 'obrigado', 'sobre', 'privacidade', 'coleta-encerrada', 'denuncia-hub', 'denuncia', 'denuncia-obrigado', 'login', 'contato'].includes(view)
  const showAdminButton = view === 'identificacao' || view === 'form'

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname || '/'}` : ''

  if (view === 'admin') {
    return (
      <div className="app-bg min-h-screen font-sans antialiased">
        <AdminLayout onClose={closeAdmin} onLogout={handleAdminLogout} />
      </div>
    )
  }

  if (view === 'denuncia-hub' || view === 'denuncia' || view === 'denuncia-obrigado' || view === 'denuncia-consultar') {
    return (
      <div className="app-bg flex min-h-screen flex-col font-sans antialiased">
        <HealthqoeHeader view="identificacao" onNavigate={() => {}} onOpenAdmin={() => {}} showNavAndAdmin={false} showAdminButton={false} />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
          {view === 'denuncia-hub' && (
            <CanalRelatosHub
              orgSlug={getTenantId()}
              orgDisplayName={hubOrgDisplayName}
              onEnviarRelato={() => { window.location.href = `${baseUrl}?org=${encodeURIComponent(getTenantId())}&channel=denuncia&form=1` }}
              onAcompanharCodigo={() => { window.location.href = `${baseUrl}?org=${encodeURIComponent(getTenantId())}&channel=denuncia&consultar=1` }}
            />
          )}
          {view === 'denuncia' && (
            <WhistleblowerForm
              onEnviado={(protocolId) => {
                setDenunciaProtocolId(protocolId)
                setView('denuncia-obrigado')
              }}
              onConsultar={() => setView('denuncia-consultar')}
            />
          )}
          {view === 'denuncia-obrigado' && denunciaProtocolId && (
            <WhistleblowerThanks
              protocolId={denunciaProtocolId}
              onFechar={() => { setDenunciaProtocolId(null); window.location.href = window.location.origin + (window.location.pathname || '/') }}
              onConsultar={() => { setDenunciaProtocolId(null); setView('denuncia-consultar') }}
            />
          )}
          {view === 'denuncia-consultar' && (
            <ConsultarDenuncia onVoltar={() => setView('denuncia')} />
          )}
        </main>
        <footer className="mt-auto border-t border-slate-200 bg-white/60 py-5">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <p className="text-xs text-slate-500">
              {getAppName()} · Canal de denúncias anônimo
            </p>
            <a
              href={baseUrl}
              className="mt-2 inline-block text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline"
            >
              Voltar ao site
            </a>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="app-bg flex min-h-screen flex-col font-sans antialiased">
      <HealthqoeHeader
        view={view}
        onNavigate={setView}
        onOpenAdmin={openAdminGate}
        showNavAndAdmin={showNavAndAdmin}
        showAdminButton={showAdminButton}
      />

      <main className={`mx-auto w-full flex-1 px-4 py-10 sm:px-6 sm:py-12 ${view !== 'landing' ? 'max-w-4xl' : ''}`}>
        {view === 'landing' && (
          <LandingPage onFazerRelato={() => setView('relatos-buscar')} />
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

        {view === 'admin-gate' && (
          <div className="space-y-6">
            <AdminLogin
              onSuccess={openAdmin}
              onCancel={() => setView('landing')}
            />
          </div>
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
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white/60 py-5">
        <div className="mx-auto max-w-2xl px-4 text-center text-xs text-slate-500 sm:px-6">
          {getAppName()} · Formulário em conformidade com o estudo HSE-IT · 35 perguntas · 7 dimensões
        </div>
      </footer>
    </div>
  )
}

export default App
