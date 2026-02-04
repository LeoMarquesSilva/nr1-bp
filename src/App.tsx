import { useState } from 'react'
import { Header } from './components/Header'
import { Identificacao } from './components/Identificacao'
import { FormDiagnostico } from './components/FormDiagnostico'
import { Obrigado } from './components/Obrigado'
import { Sobre } from './components/Sobre'
import { Privacidade } from './components/Privacidade'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'
import type { OptionKey } from './data/hseIt'
import { saveSubmission } from './types/submission'
import { isAdminLoggedIn } from './lib/adminAuth'

export type View = 'identificacao' | 'form' | 'obrigado' | 'sobre' | 'privacidade' | 'admin-gate' | 'admin'

function App() {
  const [view, setView] = useState<View>(() =>
    isAdminLoggedIn() ? 'admin' : 'identificacao'
  )
  const [identificacao, setIdentificacao] = useState<{ setor: string } | null>(null)

  const handleIdentificacao = (setor: string) => {
    setIdentificacao({ setor })
    setView('form')
  }

  const handleFormSubmit = (answers: Record<number, OptionKey>, setor: string) => {
    saveSubmission(setor, answers)
    setIdentificacao(null)
    setView('obrigado')
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

  const showNavAndAdmin = ['identificacao', 'form', 'obrigado', 'sobre', 'privacidade'].includes(view)
  const showAdminButton = view === 'identificacao' || view === 'form'

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
        {view === 'identificacao' && (
          <Identificacao onIniciar={handleIdentificacao} />
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
          Formulário em conformidade com o estudo HSE-IT · 35 perguntas · 7 dimensões
        </div>
      </footer>
    </div>
  )
}

export default App
