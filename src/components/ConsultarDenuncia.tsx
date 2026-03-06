import { useState } from 'react'
import { Search, ArrowLeft, FileQuestion } from 'lucide-react'
import { getWhistleblowerStatusByProtocol } from '../types/whistleblower'

const STATUS_LABELS: Record<string, string> = {
  recebida: 'Recebida',
  em_analise: 'Em análise',
  concluida: 'Concluída',
  arquivada: 'Arquivada',
}

type Props = {
  onVoltar: () => void
}

export function ConsultarDenuncia({ onVoltar }: Props) {
  const [protocolId, setProtocolId] = useState('')
  const [result, setResult] = useState<{ status: string; created_at: string } | null | 'loading'>(null)

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = protocolId.trim()
    if (!trimmed) return
    setResult('loading')
    const data = await getWhistleblowerStatusByProtocol(trimmed)
    setResult(data)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <FileQuestion className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Consultar denúncia
            </h2>
            <p className="text-sm text-slate-600">
              Informe o número do protocolo para ver o status
            </p>
          </div>
        </div>
        <p className="mb-6 text-sm text-slate-600">
          Você recebe o número do protocolo ao enviar uma denúncia. Com ele é possível acompanhar o andamento sem precisar se identificar.
        </p>
        <form onSubmit={handleConsultar} className="space-y-4">
          <div>
            <label htmlFor="consultar-protocol" className="mb-2 block text-sm font-semibold text-slate-900">
              Número do protocolo
            </label>
            <input
              id="consultar-protocol"
              type="text"
              value={protocolId}
              onChange={(e) => setProtocolId(e.target.value)}
              placeholder="Ex.: WB-XXXXXXXX"
              className="input-escritorio w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-slate-900 placeholder:text-slate-400"
              disabled={result === 'loading'}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={!protocolId.trim() || result === 'loading'}
            className="btn-escritorio flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {result === 'loading' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Consultar
              </>
            )}
          </button>
        </form>

        {result !== null && result !== 'loading' && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            {result ? (
              <>
                <p className="text-sm font-semibold text-slate-600">Status</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {STATUS_LABELS[result.status] ?? result.status}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Registro em {new Date(result.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </>
            ) : (
              <p className="text-slate-600">
                Protocolo não encontrado. Verifique o número e tente novamente.
              </p>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onVoltar}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para enviar denúncia
      </button>
    </div>
  )
}
