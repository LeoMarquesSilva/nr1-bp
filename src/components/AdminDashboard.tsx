import { useState } from 'react'
import { ArrowLeft, LogOut, BarChart3, Calendar, Building2, Users, Briefcase, Trash2 } from 'lucide-react'
import { getSubmissions, deleteSubmission, type Submission } from '../types/submission'
import { logoutAdmin } from '../lib/adminAuth'
import { computeDimensionScores, aggregateDimensionScores } from '../data/hseIt'
import { GraficosResultados } from './GraficosResultados'
import { Resultados } from './Resultados'

type Props = {
  onClose: () => void
  onLogout: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminDashboard({ onClose, onLogout }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>(() => getSubmissions())
  const [selected, setSelected] = useState<Submission | null>(null)

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Excluir este envio? Esta ação não pode ser desfeita.')) return
    deleteSubmission(id)
    setSubmissions(getSubmissions())
    if (selected?.id === id) setSelected(null)
  }

  const handleLogout = () => {
    logoutAdmin()
    onLogout()
  }

  // Dashboard da empresa: agregar todos os envios
  const scoresPorEnvio = submissions.map((s) => computeDimensionScores(s.answers))
  const scoresEmpresa = aggregateDimensionScores(scoresPorEnvio)

  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-2 rounded-xl border bg-card-escritorio px-4 py-2.5 font-semibold text-escritorio shadow-sm transition hover:opacity-90"
            style={{ borderColor: 'rgba(16,31,46,0.2)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao dashboard
          </button>
        </div>
        <Resultados
          answers={selected.answers}
          setor={selected.funcao ? `${selected.setor} · ${selected.funcao}` : selected.setor}
          onVoltar={() => setSelected(null)}
          isAdmin
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-escritorio">
            Dashboard da empresa
          </h2>
          <p className="mt-1 text-sm text-escritorio opacity-80">
            Visão agregada de todos os diagnósticos. Gráficos refletem a empresa toda.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border bg-card-escritorio px-4 py-2.5 font-semibold text-escritorio shadow-sm transition hover:opacity-90"
            style={{ borderColor: 'rgba(16,31,46,0.2)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border bg-card-escritorio px-4 py-2.5 font-semibold text-escritorio shadow-sm transition hover:opacity-90"
            style={{ borderColor: 'rgba(16,31,46,0.2)' }}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-card-escritorio rounded-2xl p-12 text-center shadow-sm">
          <BarChart3 className="mx-auto h-12 w-12 text-escritorio opacity-40" />
          <p className="mt-4 font-medium text-escritorio">Nenhum envio ainda</p>
          <p className="mt-1 text-sm text-escritorio opacity-75">
            Os diagnósticos enviados aparecerão aqui. O dashboard da empresa será preenchido automaticamente.
          </p>
        </div>
      ) : (
        <>
          {/* Resumo */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-card-escritorio rounded-xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dourado-light" style={{ color: 'var(--escritorio-dourado)' }}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-escritorio">{submissions.length}</p>
                  <p className="text-sm text-escritorio opacity-75">total de respostas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos da empresa (agregado) */}
          <GraficosResultados scores={scoresEmpresa} />

          {/* Cards de resultado por dimensão (empresa) - opcional, já está nos gráficos */}
          <Resultados
            answers={{}}
            setor="Empresa (agregado)"
            onVoltar={() => {}}
            isAdmin
            scoresOverride={scoresEmpresa}
          />

          {/* Lista de envios (drill-down por setor/função) */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-escritorio">
              Envios por setor e função
            </h3>
            <p className="mb-4 text-sm text-escritorio opacity-80">
              Clique em um envio para ver o mapeamento individual.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {submissions.map((s) => (
                <li key={s.id}>
                  <div className="flex items-stretch gap-2 rounded-xl border bg-card-escritorio shadow-sm transition hover:opacity-95" style={{ borderColor: 'rgba(16,31,46,0.12)' }}>
                    <button
                      type="button"
                      onClick={() => setSelected(s)}
                      className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left transition hover:bg-dourado-light/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dourado-light" style={{ color: 'var(--escritorio-dourado)' }}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-escritorio">{s.setor}</p>
                        {s.funcao ? (
                          <p className="flex items-center gap-1.5 text-xs text-escritorio opacity-80">
                            <Briefcase className="h-3.5 w-3.5" />
                            {s.funcao}
                          </p>
                        ) : null}
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-escritorio opacity-60">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(s.submittedAt)}
                        </p>
                      </div>
                      <BarChart3 className="h-5 w-5 shrink-0 text-escritorio opacity-50" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, s.id)}
                      className="flex shrink-0 items-center rounded-r-xl px-3 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Excluir envio"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
