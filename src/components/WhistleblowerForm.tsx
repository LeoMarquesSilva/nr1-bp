import { useState } from 'react'
import { Send, Shield, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { saveWhistleblowerReport } from '../types/whistleblower'

const CATEGORIAS = [
  'Assédio ou discriminação',
  'Irregularidade financeira ou corrupção',
  'Violação de normas ou políticas',
  'Segurança no trabalho',
  'Outro',
]

type Props = {
  onEnviado: (protocolId: string) => void
  onConsultar?: () => void
}

export function WhistleblowerForm({ onEnviado, onConsultar }: Props) {
  const [contactType, setContactType] = useState('')
  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [compromissoAberto, setCompromissoAberto] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactType || !body.trim()) return
    setSubmitting(true)
    
    const combinedCategory = category ? `${contactType} - ${category}` : contactType

    try {
      const { protocolId } = await saveWhistleblowerReport({ category: combinedCategory, body })
      onEnviado(protocolId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível enviar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Nosso compromisso: ética, não retaliação, treinamentos */}
      <div className="bg-card-escritorio rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setCompromissoAberto((a) => !a)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
          aria-expanded={compromissoAberto}
        >
          <span className="text-sm font-semibold text-slate-900">Nosso compromisso</span>
          {compromissoAberto ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
        {compromissoAberto && (
          <div className="border-t border-slate-200 px-5 pb-5 pt-2 text-sm text-slate-700 space-y-3">
            <p><strong>Código de ética e conduta</strong> já aplicável na organização.</p>
            <p><strong>Política de não retaliação:</strong> denunciantes de boa-fé estão protegidos; não há represálias por uso deste canal.</p>
            <p><strong>Treinamentos periódicos</strong> sobre assédio, bullying e comunicação não violenta, em conformidade com as melhores práticas.</p>
            <p>As denúncias são tratadas por <strong>comitê de ética</strong> (preferencialmente membros de setores distintos e não líderes), de forma auditável.</p>
          </div>
        )}
      </div>

      <div className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Canal de denúncias
            </h2>
            <p className="text-sm text-slate-600">
              Anônimo e sigiloso
            </p>
          </div>
        </div>
        <p className="mb-2 text-sm text-slate-600">
          Sua identidade não será revelada. Use este canal para reportar situações que violem a ética, políticas internas ou a lei. As informações são tratadas com confidencialidade.
        </p>
        <p className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5" />
          Plataforma externa, independente e criptografada. Conexão e dados armazenados com segurança; não rastreamos nome nem IP.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="wb-type" className="mb-2 block text-sm font-semibold text-slate-900">
              Tipo de Contato <span className="text-red-500">*</span>
            </label>
            <select
              id="wb-type"
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
              required
              className="input-escritorio w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
            >
              <option value="">— Selecione o tipo de contato —</option>
              <option value="Dúvida">Dúvida</option>
              <option value="Reclamação">Reclamação de RH</option>
              <option value="Denúncia">Denúncia de Má Conduta</option>
            </select>
          </div>
          <div>
            <label htmlFor="wb-category" className="mb-2 block text-sm font-semibold text-slate-900">
              Assunto (opcional)
            </label>
            <select
              id="wb-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-escritorio w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
            >
              <option value="">— Selecione —</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="wb-body" className="mb-2 block text-sm font-semibold text-slate-900">
              Relato <span className="text-red-500">*</span>
            </label>
            <textarea
              id="wb-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={6}
              placeholder="Descreva o ocorrido com o máximo de detalhes possíveis (local, data, pessoas envolvidas, se houver)."
              className="input-escritorio w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={!contactType || !body.trim() || submitting}
            className="btn-escritorio flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Enviar denúncia'}
            <Send className="h-5 w-5" />
          </button>
          {onConsultar && (
            <p className="text-center text-sm text-slate-600">
              Já enviou uma denúncia?{' '}
              <button type="button" onClick={onConsultar} className="font-semibold text-violet-600 underline hover:no-underline">
                Consultar status
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
