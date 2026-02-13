import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Identificacao } from './components/Identificacao'
import { FormDiagnostico } from './components/FormDiagnostico'
import { Obrigado } from './components/Obrigado'
import { ColetaEncerrada } from './components/ColetaEncerrada'
import { WhistleblowerForm } from './components/WhistleblowerForm'
import { WhistleblowerThanks } from './components/WhistleblowerThanks'
import { Sobre } from './components/Sobre'
import { Privacidade } from './components/Privacidade'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'
import type { OptionKey } from './data/hseIt'
import { saveSubmission, getTenantStatus } from './types/submission'
import { isAdminLoggedIn } from './lib/adminAuth'
import { getAppName, getTenantId } from './lib/tenant'

export type View = 'identificacao' | 'form' | 'obrigado' | 'sobre' | 'privacidade' | 'admin-gate' | 'admin' | 'coleta-encerrada' | 'denuncia' | 'denuncia-obrigado'

function isDenunciaChannel(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('channel') === 'denuncia'
}

function App() {
  const [view, setView] = useState<View>(() => {
    if (isAdminLoggedIn()) return 'admin'
    if (isDenunciaChannel()) return 'denuncia'
    return 'identificacao'
  })
  const [identificacao, setIdentificacao] = useState<{ setor: string } | null>(null)
  const [tenantBlocked, setTenantBlocked] = useState<boolean | null>(null)

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
    setView('identificacao')
  }

  const handleAdminLogout = () => {
    setView('identificacao')
  }

  useEffect(() => {
    if (view !== 'identificacao') return
    getTenantStatus(getTenantId()).then((s) => setTenantBlocked(!s.active))
  }, [view])

  const showNavAndAdmin = ['identificacao', 'form', 'obrigado', 'sobre', 'privacidade', 'coleta-encerrada', 'denuncia', 'denuncia-obrigado'].includes(view)
  const showAdminButton = view === 'identificacao' || view === 'form'

  if (view === 'denuncia') {
    return (
      <div className="app-bg flex min-h-screen flex-col font-sans antialiased">
        <Header view="identificacao" onNavigate={() => {}} onOpenAdmin={() => {}} showNavAndAdmin={false} showAdminButton={false} />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
          <WhistleblowerForm onEnviado={() => setView('denuncia-obrigado')} />
        </main>
        <footer className="mt-auto border-t border-[rgba(16,31,46,0.06)] bg-white/50 py-5">
          <div className="mx-auto max-w-2xl px-4 text-center text-xs text-[var(--escritorio-escuro)]/60 sm:px-6">
            {getAppName()} · Canal de denúncias anônimo
          </div>
        </footer>
      </div>
    )
  }

  if (view === 'denuncia-obrigado') {
    return (
      <div className="app-bg flex min-h-screen flex-col font-sans antialiased">
        <Header view="identificacao" onNavigate={() => {}} onOpenAdmin={() => {}} showNavAndAdmin={false} showAdminButton={false} />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
          <WhistleblowerThanks onFechar={() => { window.location.href = window.location.origin + (window.location.pathname || '/') }} />
        </main>
        <footer className="mt-auto border-t border-[rgba(16,31,46,0.06)] bg-white/50 py-5">
          <div className="mx-auto max-w-2xl px-4 text-center text-xs text-[var(--escritorio-escuro)]/60 sm:px-6">
            {getAppName()} · Canal de denúncias anônimo
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="app-bg flex min-h-screen flex-col font-sans antialiased">
      <Header
        view={view}
        onNavigate={setView}
        onOpenAdmin={openAdminGate}
        showNavAndAdmin={showNavAndAdmin}
        showAdminButton={showAdminButton}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
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
          <Obrigado onVoltar={() => setView('identificacao')} />
        )}

        {view === 'sobre' && (
          <Sobre onVoltar={() => setView('identificacao')} />
        )}

        {view === 'privacidade' && (
          <Privacidade onVoltar={() => setView('identificacao')} />
        )}

        {view === 'admin-gate' && (
          <div className="space-y-6">
            <AdminLogin
              onSuccess={openAdmin}
              onCancel={() => setView('identificacao')}
            />
          </div>
        )}

        {view === 'admin' && (
          <AdminDashboard onClose={closeAdmin} onLogout={handleAdminLogout} />
        )}
      </main>

      <footer className="mt-auto border-t border-[rgba(16,31,46,0.06)] bg-white/50 py-5">
        <div className="mx-auto max-w-2xl px-4 text-center text-xs text-[var(--escritorio-escuro)]/60 sm:px-6">
          {getAppName()} · Formulário em conformidade com o estudo HSE-IT · 35 perguntas · 7 dimensões
        </div>
      </footer>
    </div>
  )
}

export default App
