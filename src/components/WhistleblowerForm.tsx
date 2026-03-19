import { useState } from 'react'
import { Send, Shield, ChevronDown, ChevronUp, Lock, UserCircle } from 'lucide-react'
import { saveWhistleblowerReport } from '../types/whistleblower'

const ASSUNTOS_DENUNCIA = [
  'Assédio ou discriminação',
  'Irregularidade financeira ou corrupção',
  'Violação de normas ou políticas',
  'Segurança no trabalho',
  'Outro',
]

type Props = {
  onEnviado: (protocolId: string, meta: { isAnonymous: boolean }) => void
  onConsultar?: () => void
}

export function WhistleblowerForm({ onEnviado, onConsultar }: Props) {
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterContact, setReporterContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [compromissoAberto, setCompromissoAberto] = useState(false)

  const canSubmit =
    body.trim() &&
    (isAnonymous || (reporterName.trim() && reporterContact.trim()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)

    try {
      const { protocolId } = await saveWhistleblowerReport({
        category: category.trim() || null,
        body,
        isAnonymous,
        reporterName: isAnonymous ? undefined : reporterName,
        reporterContact: isAnonymous ? undefined : reporterContact,
      })
      onEnviado(protocolId, { isAnonymous })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível enviar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="bg-card-escritorio overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm">
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
          <div className="space-y-3 border-t border-slate-200 px-5 pb-5 pt-2 text-sm text-slate-700">
            <p>
              <strong>Código de ética e conduta</strong> já aplicável na organização.
            </p>
            <p>
              <strong>Política de não retaliação:</strong> denunciantes de boa-fé estão protegidos; não há represálias por uso deste canal.
            </p>
            <p>
              <strong>Treinamentos periódicos</strong> sobre assédio, bullying e comunicação não violenta, em conformidade com as melhores práticas.
            </p>
            <p>
              As denúncias são tratadas por <strong>comitê de ética</strong> (preferencialmente membros de setores distintos e não líderes), de forma auditável.
            </p>
          </div>
        )}
      </div>

      <div className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Canal de denúncias</h2>
            <p className="text-sm text-slate-600">
              {isAnonymous ? 'Denúncia anônima e sigilosa' : 'Denúncia com identificação'}
            </p>
          </div>
        </div>

        <p className="mb-2 text-sm text-slate-600">
          Use este canal exclusivamente para <strong>denúncias</strong> (violações à ética, políticas internas ou à lei). Você pode optar por permanecer anônimo ou informar seus dados para que a empresa possa retornar o contato.
        </p>
        <p className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          Conexão e armazenamento com medidas de segurança. Não rastreamos IP para fins de identificação do denunciante anônimo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="space-y-3">
            <legend className="mb-2 block text-sm font-semibold text-slate-900">
              Identificação <span className="text-red-500">*</span>
            </legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50/40">
              <input
                type="radio"
                name="anon"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(true)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-slate-900">Quero permanecer anônimo</span>
                <span className="mt-0.5 block text-sm text-slate-600">
                  Seus dados pessoais não serão solicitados. O acompanhamento é feito apenas pelo código de protocolo.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50/40">
              <input
                type="radio"
                name="anon"
                checked={!isAnonymous}
                onChange={() => setIsAnonymous(false)}
                className="mt-1"
              />
              <span className="flex items-start gap-2">
                <UserCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <span>
                  <span className="font-medium text-slate-900">Autorizo informar meus dados (não anônimo)</span>
                  <span className="mt-0.5 block text-sm text-slate-600">
                    Informe nome e um meio de contato para que a organização possa retornar, se necessário.
                  </span>
                </span>
              </span>
            </label>
          </fieldset>

          {!isAnonymous && (
            <div className="space-y-4 rounded-xl border border-violet-200 bg-violet-50/30 p-4">
              <div>
                <label htmlFor="wb-name" className="mb-2 block text-sm font-semibold text-slate-900">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="wb-name"
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  required={!isAnonymous}
                  autoComplete="name"
                  className="input-escritorio w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="wb-contact" className="mb-2 block text-sm font-semibold text-slate-900">
                  E-mail ou telefone <span className="text-red-500">*</span>
                </label>
                <input
                  id="wb-contact"
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  required={!isAnonymous}
                  autoComplete="email"
                  placeholder="E-mail ou telefone com DDD"
                  className="input-escritorio w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="wb-category" className="mb-2 block text-sm font-semibold text-slate-900">
              Assunto da denúncia (opcional)
            </label>
            <select
              id="wb-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-escritorio w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
            >
              <option value="">— Selecione —</option>
              {ASSUNTOS_DENUNCIA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="wb-body" className="mb-2 block text-sm font-semibold text-slate-900">
              Descrição da denúncia <span className="text-red-500">*</span>
            </label>
            <textarea
              id="wb-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={6}
              placeholder="Descreva os fatos com o máximo de detalhes (local, data, pessoas envolvidas, se souber)."
              className="input-escritorio w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="btn-escritorio flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Enviar denúncia'}
            <Send className="h-5 w-5" />
          </button>
          {onConsultar && (
            <p className="text-center text-sm text-slate-600">
              Já enviou uma denúncia?{' '}
              <button
                type="button"
                onClick={onConsultar}
                className="font-semibold text-violet-600 underline hover:no-underline"
              >
                Consultar status
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
