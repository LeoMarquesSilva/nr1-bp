import { useState } from 'react'
import { Search, FileQuestion } from 'lucide-react'
import { getWhistleblowerStatusByProtocol } from '../types/whistleblower'
import { PageShell, PageShellCard } from './layout/PageShell'

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
    <PageShell
      onBack={onVoltar}
      backLabel="Voltar para enviar denúncia"
      title="Consultar denúncia"
      subtitle="Informe o número do protocolo para ver o status. Você recebe o protocolo ao enviar uma denúncia e pode acompanhar o andamento sem precisar se identificar."
      surface="onGradient"
    >
      <PageShellCard surface="onGradient">
        <div className="mb-6 flex items-center gap-3">
          <div className="brand-icon-tile h-10 w-10 rounded-xl">
            <FileQuestion className="h-5 w-5" aria-hidden />
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Digite exatamente o código exibido ao concluir o envio (ex.: WB-…).
          </p>
        </div>

        <form onSubmit={handleConsultar} className="space-y-4">
          <div>
            <label htmlFor="consultar-protocol" className="mb-2 block text-sm font-semibold text-[var(--color-brand-900)]">
              Número do protocolo
            </label>
            <input
              id="consultar-protocol"
              type="text"
              value={protocolId}
              onChange={(e) => setProtocolId(e.target.value)}
              placeholder="Ex.: WB-XXXXXXXX"
              className="input-escritorio w-full rounded-xl border bg-white px-4 py-3 font-mono text-[var(--color-brand-900)] placeholder:text-[var(--muted-foreground)]"
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
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                Consultando...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" aria-hidden />
                Consultar
              </>
            )}
          </button>
        </form>

        {result !== null && result !== 'loading' && (
          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/70 p-4">
            {result ? (
              <>
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">Status</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-brand-900)]">
                  {STATUS_LABELS[result.status] ?? result.status}
                </p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Registro em{' '}
                  {new Date(result.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </>
            ) : (
              <p className="text-[var(--muted-foreground)]">
                Protocolo não encontrado. Verifique o número e tente novamente.
              </p>
            )}
          </div>
        )}
      </PageShellCard>
    </PageShell>
  )
}
