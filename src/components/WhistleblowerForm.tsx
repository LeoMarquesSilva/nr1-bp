import { useState } from 'react'
import { Send, Shield } from 'lucide-react'
import { saveWhistleblowerReport } from '../types/whistleblower'

const CATEGORIAS = [
  'Assédio ou discriminação',
  'Irregularidade financeira ou corrupção',
  'Violação de normas ou políticas',
  'Segurança no trabalho',
  'Outro',
]

type Props = {
  onEnviado: () => void
}

export function WhistleblowerForm({ onEnviado }: Props) {
  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await saveWhistleblowerReport({ category: category || undefined, body })
      onEnviado()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível enviar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="bg-card-escritorio rounded-2xl border border-[rgba(16,31,46,0.08)] p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--escritorio-dourado-light)]" style={{ color: 'var(--escritorio-dourado)' }}>
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-escritorio">
              Canal de denúncias
            </h2>
            <p className="text-sm text-escritorio/70">
              Anônimo e sigiloso
            </p>
          </div>
        </div>
        <p className="mb-6 text-sm text-escritorio/80">
          Sua identidade não será revelada. Use este canal para reportar situações que violem a ética, políticas internas ou a lei. As informações são tratadas com confidencialidade.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="wb-category" className="mb-2 block text-sm font-semibold text-escritorio">
              Assunto (opcional)
            </label>
            <select
              id="wb-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-escritorio w-full rounded-xl border border-[rgba(16,31,46,0.12)] bg-white px-4 py-3 text-escritorio"
            >
              <option value="">— Selecione —</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="wb-body" className="mb-2 block text-sm font-semibold text-escritorio">
              Relato <span className="text-red-500">*</span>
            </label>
            <textarea
              id="wb-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={6}
              placeholder="Descreva o ocorrido com o máximo de detalhes possíveis (local, data, pessoas envolvidas, se houver)."
              className="input-escritorio w-full resize-y rounded-xl border border-[rgba(16,31,46,0.12)] bg-white px-4 py-3 text-escritorio placeholder:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!body.trim() || submitting}
            className="btn-escritorio flex w-full items-center justify-center gap-2 py-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Enviar denúncia'}
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
