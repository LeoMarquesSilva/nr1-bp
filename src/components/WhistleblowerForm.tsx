import { useState, useRef, useEffect } from 'react'
import { Send, Shield, Lock, UserCircle, Paperclip, ChevronRight, ChevronLeft } from 'lucide-react'
import { saveWhistleblowerReport } from '../services/api'
import {
  RELACAO_DENUNCIADO,
  CATEGORIAS_DENUNCIA,
  GENERO_OPCOES,
  LOCAL_CAMERA_OPCOES,
  MAX_EVIDENCE_FILES,
  MAX_EVIDENCE_BYTES,
  DENUNCIA_FIELD_HELP,
  WIZARD_STEPS,
} from '../data/denunciaForm'
import { clearDraft, loadDraft, saveDraft } from '../lib/draft'
import { getTenantId } from '../lib/tenant'
import { feedback } from '../lib/feedback'
import { trackEvent } from '../lib/telemetry'
import { assertClientRateLimit, isLikelyBotHoneyPot } from '../lib/antiAbuse'
import { createCaptchaChallenge, isCaptchaValid } from '../lib/captcha'

type Props = {
  onEnviado: (protocolId: string, meta: { isAnonymous: boolean }) => void
  onConsultar?: () => void
}

type WhistleblowerDraft = {
  step: number
  isAnonymous: boolean
  subject: string
  accusedRelationship: string
  complaintCategory: string
  complainantGender: string
  incidentDate: string
  locationHasCamera: 'sim' | 'nao' | ''
  body: string
  reporterName: string
  reporterContact: string
}

const inputCls =
  'input-escritorio w-full rounded-xl border bg-white px-4 py-3 text-[var(--color-brand-900)] placeholder:text-[var(--muted-foreground)]'
const selectCls = 'input-escritorio w-full rounded-xl border bg-white px-4 py-3 text-[var(--color-brand-900)]'
const labelCls = 'mb-2 block text-sm font-semibold text-[var(--color-brand-900)]'

const primaryCtaCls =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand-cream)] px-6 py-3.5 text-sm font-semibold text-[var(--color-brand-900)] shadow-[var(--shadow-md)] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-700)] focus-visible:ring-offset-2'

function Helper({ children }: { children: string }) {
  return <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">{children}</p>
}

export function WhistleblowerForm({ onEnviado, onConsultar }: Props) {
  const [step, setStep] = useState(0)
  const [stepError, setStepError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const [isAnonymous, setIsAnonymous] = useState(true)
  const [subject, setSubject] = useState('')
  const [accusedRelationship, setAccusedRelationship] = useState('')
  const [complaintCategory, setComplaintCategory] = useState('')
  const [complainantGender, setComplainantGender] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [locationHasCamera, setLocationHasCamera] = useState<'sim' | 'nao' | ''>('')
  const [body, setBody] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterContact, setReporterContact] = useState('')
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)
  const [tenantId] = useState(() => getTenantId())
  const [websiteField, setWebsiteField] = useState('')
  const [captcha] = useState(() => createCaptchaChallenge())
  const [captchaInput, setCaptchaInput] = useState('')

  const totalSteps = WIZARD_STEPS.length
  const progressPct = ((step + 1) / totalSteps) * 100

  useEffect(() => {
    setStepError(null)
  }, [step])

  useEffect(() => {
    trackEvent({
      name: 'denuncia_step_view',
      flow: 'denuncia',
      tenantId,
      step: `etapa_${step + 1}`,
    })
  }, [step, tenantId])

  useEffect(() => {
    const draft = loadDraft<WhistleblowerDraft>('denuncia', tenantId)
    if (!draft) return
    setStep(Math.min(Math.max(draft.step ?? 0, 0), WIZARD_STEPS.length - 1))
    setIsAnonymous(draft.isAnonymous ?? true)
    setSubject(draft.subject ?? '')
    setAccusedRelationship(draft.accusedRelationship ?? '')
    setComplaintCategory(draft.complaintCategory ?? '')
    setComplainantGender(draft.complainantGender ?? '')
    setIncidentDate(draft.incidentDate ?? '')
    setLocationHasCamera(draft.locationHasCamera ?? '')
    setBody(draft.body ?? '')
    setReporterName(draft.reporterName ?? '')
    setReporterContact(draft.reporterContact ?? '')
  }, [tenantId])

  useEffect(() => {
    if (submitting) return
    const hasAnyData =
      subject.trim().length > 0 ||
      accusedRelationship.length > 0 ||
      complaintCategory.length > 0 ||
      complainantGender.length > 0 ||
      incidentDate.length > 0 ||
      locationHasCamera.length > 0 ||
      body.trim().length > 0 ||
      reporterName.trim().length > 0 ||
      reporterContact.trim().length > 0

    if (!hasAnyData) return

    saveDraft<WhistleblowerDraft>('denuncia', tenantId, {
      step,
      isAnonymous,
      subject,
      accusedRelationship,
      complaintCategory,
      complainantGender,
      incidentDate,
      locationHasCamera,
      body,
      reporterName,
      reporterContact,
    })
  }, [
    accusedRelationship,
    body,
    complaintCategory,
    complainantGender,
    incidentDate,
    isAnonymous,
    locationHasCamera,
    reporterContact,
    reporterName,
    step,
    subject,
    submitting,
    tenantId,
  ])

  const validateStep = (s: number): boolean => {
    switch (s) {
      case 0:
        return isAnonymous || (reporterName.trim().length > 0 && reporterContact.trim().length > 0)
      case 1:
        return (
          accusedRelationship.length > 0 &&
          complaintCategory.length > 0 &&
          complainantGender.length > 0 &&
          incidentDate.length > 0 &&
          (locationHasCamera === 'sim' || locationHasCamera === 'nao')
        )
      case 2:
        return subject.trim().length > 0 && body.trim().length > 0
      case 3:
        return true
      case 4:
        return (
          subject.trim().length > 0 &&
          accusedRelationship.length > 0 &&
          complaintCategory.length > 0 &&
          complainantGender.length > 0 &&
          incidentDate.length > 0 &&
          (locationHasCamera === 'sim' || locationHasCamera === 'nao') &&
          body.trim().length > 0 &&
          (isAnonymous || (reporterName.trim().length > 0 && reporterContact.trim().length > 0))
        )
      default:
        return false
    }
  }

  const goNext = () => {
    if (!validateStep(step)) {
      setStepError('Preencha os campos obrigatórios desta etapa para continuar.')
      return
    }
    setStepError(null)
    setStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }

  const goPrev = () => {
    setStepError(null)
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list?.length) return
    const messages: string[] = []
    const next: File[] = [...evidenceFiles]
    for (let i = 0; i < list.length; i++) {
      const f = list[i]
      if (f.size > MAX_EVIDENCE_BYTES) {
        messages.push(`“${f.name}” excede 10 MB.`)
        continue
      }
      if (next.length >= MAX_EVIDENCE_FILES) {
        messages.push(`No máximo ${MAX_EVIDENCE_FILES} arquivos.`)
        break
      }
      next.push(f)
    }
    setEvidenceFiles(next)
    setFileError(messages.length > 0 ? messages.join(' ') : null)
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const canSubmit =
    subject.trim() &&
    accusedRelationship &&
    complaintCategory &&
    complainantGender &&
    incidentDate &&
    locationHasCamera &&
    body.trim() &&
    (isAnonymous || (reporterName.trim() && reporterContact.trim()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step !== totalSteps - 1) return
    if (!canSubmit || !locationHasCamera) return
    if (!isCaptchaValid(captchaInput, captcha)) {
      feedback.error('Validação humana inválida. Confira o cálculo e tente novamente.')
      return
    }
    if (isLikelyBotHoneyPot(websiteField)) {
      feedback.error('Não foi possível enviar no momento.')
      return
    }
    try {
      assertClientRateLimit({
        action: 'denuncia_submit',
        tenantId,
        maxAttempts: 6,
        windowMs: 15 * 60 * 1000,
        message: 'Muitas tentativas de envio em pouco tempo. Aguarde alguns minutos e tente novamente.',
      })
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Muitas tentativas. Tente novamente mais tarde.')
      return
    }
    setSubmitting(true)

    try {
      const { protocolId } = await saveWhistleblowerReport({
        subject,
        accusedRelationship,
        complaintCategory,
        complainantGender,
        incidentDate,
        locationHasCamera,
        body,
        isAnonymous,
        reporterName: isAnonymous ? undefined : reporterName,
        reporterContact: isAnonymous ? undefined : reporterContact,
        evidenceFiles: evidenceFiles.length > 0 ? evidenceFiles : undefined,
      })
      clearDraft('denuncia', tenantId)
      onEnviado(protocolId, { isAnonymous })
    } catch (err) {
      trackEvent({
        name: 'api_error',
        flow: 'denuncia',
        tenantId,
        step: 'submit',
        meta: { message: err instanceof Error ? err.message : 'erro_desconhecido' },
      })
      feedback.error(err instanceof Error ? err.message : 'Não foi possível enviar.')
    } finally {
      setSubmitting(false)
    }
  }

  const isDirty =
    !submitting &&
    (subject.trim().length > 0 ||
      accusedRelationship.length > 0 ||
      complaintCategory.length > 0 ||
      complainantGender.length > 0 ||
      incidentDate.length > 0 ||
      locationHasCamera.length > 0 ||
      body.trim().length > 0 ||
      reporterName.trim().length > 0 ||
      reporterContact.trim().length > 0 ||
      evidenceFiles.length > 0)

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    const onPageHide = () => {
      trackEvent({ name: 'denuncia_abandon', flow: 'denuncia', tenantId, step: `etapa_${step + 1}` })
    }
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [isDirty, step, tenantId])

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 font-reading text-base leading-relaxed">
      <div className="denuncia-glass-dark px-5 py-6 sm:px-6 sm:py-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="brand-icon-tile h-11 w-11 rounded-xl">
            <Shield className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Canal de denúncias</h1>
            <p className="text-sm text-[var(--color-brand-100)]">
              {isAnonymous ? 'Denúncia anônima e sigilosa' : 'Denúncia com identificação'} — etapa {step + 1} de {totalSteps}
            </p>
          </div>
        </div>

        <div aria-hidden>
          <div className="h-2 overflow-hidden rounded-full bg-black/25 ring-1 ring-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-cream)] via-white to-[var(--color-brand-400)] transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <ol className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--color-brand-200)]">
            {WIZARD_STEPS.map((s, i) => (
              <li
                key={s.id}
                className={
                  i === step ? 'font-semibold text-white' : i < step ? 'text-[var(--color-brand-100)]' : 'text-white/45'
                }
              >
                {i + 1}. {s.label}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="denuncia-glass-panel p-6 sm:p-8">
        <p className="mb-2 text-sm text-[var(--muted-foreground)]">
          Use este canal exclusivamente para <strong className="text-[var(--color-brand-900)]">denúncias</strong>. Os campos marcados com{' '}
          <span className="text-red-500">*</span> são obrigatórios.
        </p>
        <p className="mb-6 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand-600)]" aria-hidden />
          Conexão e armazenamento com medidas de segurança. Não rastreamos IP para fins de identificação do denunciante anônimo.
        </p>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={websiteField}
            onChange={(e) => setWebsiteField(e.target.value)}
            className="hidden"
            aria-hidden
          />
          <div className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/50 p-3">
            <label className="block text-sm font-semibold text-[var(--color-brand-900)]">Verificação humana</label>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{captcha.label}</p>
            <input
              type="text"
              inputMode="numeric"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className={`${inputCls} mt-2`}
              placeholder="Digite o resultado"
            />
          </div>
          {step === 0 && (
            <>
              <Helper>{DENUNCIA_FIELD_HELP.identification}</Helper>
              <fieldset className="space-y-3">
                <legend className={`${labelCls}`}>
                  Identificação <span className="text-red-500">*</span>
                </legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-white p-4 has-[:checked]:border-[var(--color-brand-400)] has-[:checked]:bg-[color-mix(in_srgb,var(--color-brand-cream)_38%,white)]">
                  <input
                    type="radio"
                    name="anon"
                    checked={isAnonymous}
                    onChange={() => setIsAnonymous(true)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium text-[var(--color-brand-900)]">Quero permanecer anônimo</span>
                    <span className="mt-0.5 block text-sm text-[var(--muted-foreground)]">
                      Seus dados pessoais não serão solicitados. O acompanhamento é feito apenas pelo código de protocolo.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-white p-4 has-[:checked]:border-[var(--color-brand-400)] has-[:checked]:bg-[color-mix(in_srgb,var(--color-brand-cream)_38%,white)]">
                  <input
                    type="radio"
                    name="anon"
                    checked={!isAnonymous}
                    onChange={() => setIsAnonymous(false)}
                    className="mt-1"
                  />
                  <span className="flex items-start gap-2">
                    <UserCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted-foreground)]" aria-hidden />
                    <span>
                      <span className="font-medium text-[var(--color-brand-900)]">Autorizo informar meus dados (não anônimo)</span>
                      <span className="mt-0.5 block text-sm text-[var(--muted-foreground)]">
                        Informe nome e um meio de contato para que a organização possa retornar, se necessário.
                      </span>
                    </span>
                  </span>
                </label>
              </fieldset>

              {!isAnonymous && (
                <div className="space-y-4 rounded-xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-4">
                  <div>
                    <label htmlFor="wb-name" className={labelCls}>
                      Nome completo <span className="text-red-500">*</span>
                    </label>
                    <Helper>{DENUNCIA_FIELD_HELP.reporterName}</Helper>
                    <input
                      id="wb-name"
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      autoComplete="name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="wb-contact" className={labelCls}>
                      E-mail ou telefone <span className="text-red-500">*</span>
                    </label>
                    <Helper>{DENUNCIA_FIELD_HELP.reporterContact}</Helper>
                    <input
                      id="wb-contact"
                      type="text"
                      value={reporterContact}
                      onChange={(e) => setReporterContact(e.target.value)}
                      autoComplete="email"
                      placeholder="E-mail ou telefone com DDD"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label htmlFor="wb-relation" className={labelCls}>
                  Qual a relação do denunciado com você? <span className="text-red-500">*</span>
                </label>
                <Helper>{DENUNCIA_FIELD_HELP.accusedRelationship}</Helper>
                <select
                  id="wb-relation"
                  value={accusedRelationship}
                  onChange={(e) => setAccusedRelationship(e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Selecione —</option>
                  {RELACAO_DENUNCIADO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="wb-complaint-cat" className={labelCls}>
                  Em qual categoria se encaixa sua denúncia? <span className="text-red-500">*</span>
                </label>
                <Helper>{DENUNCIA_FIELD_HELP.complaintCategory}</Helper>
                <select
                  id="wb-complaint-cat"
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Selecione —</option>
                  {CATEGORIAS_DENUNCIA.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="wb-gender" className={labelCls}>
                  Qual seu gênero? <span className="text-red-500">*</span>
                </label>
                <Helper>{DENUNCIA_FIELD_HELP.complainantGender}</Helper>
                <select
                  id="wb-gender"
                  value={complainantGender}
                  onChange={(e) => setComplainantGender(e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Selecione —</option>
                  {GENERO_OPCOES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="wb-incident-date" className={labelCls}>
                  Data da ocorrência do fato <span className="text-red-500">*</span>
                </label>
                <Helper>{DENUNCIA_FIELD_HELP.incidentDate}</Helper>
                <input
                  id="wb-incident-date"
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className={selectCls}
                />
              </div>

              <fieldset>
                <legend className={labelCls}>
                  O local da ocorrência possui câmera? <span className="text-red-500">*</span>
                </legend>
                <Helper>{DENUNCIA_FIELD_HELP.locationHasCamera}</Helper>
                <div className="mt-2 flex flex-wrap gap-4">
                  {LOCAL_CAMERA_OPCOES.map((opt) => (
                    <label key={opt.value} className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="camera"
                        value={opt.value}
                        checked={locationHasCamera === opt.value}
                        onChange={() => setLocationHasCamera(opt.value)}
                      />
                      <span className="text-sm text-[var(--color-brand-800)]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label htmlFor="wb-subject" className={labelCls}>
                  Assunto da denúncia <span className="text-red-500">*</span>
                </label>
                <Helper>{DENUNCIA_FIELD_HELP.subject}</Helper>
                <input
                  id="wb-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={500}
                  placeholder="Resumo em uma linha do que está sendo denunciado"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="wb-body" className={labelCls}>
                  Descrição da denúncia <span className="text-red-500">*</span>
                </label>
                <Helper>{DENUNCIA_FIELD_HELP.body}</Helper>
                <textarea
                  id="wb-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  placeholder="Descreva os fatos com o máximo de detalhes (local, contexto, testemunhas, se houver)."
                  className={`${inputCls} resize-y`}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div>
              <span className={labelCls}>Provas (opcional)</span>
              <Helper>{DENUNCIA_FIELD_HELP.evidence}</Helper>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx"
                className="hidden"
                onChange={onFilesChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[color-mix(in_srgb,var(--color-brand-400)_45%,var(--color-brand-200))] bg-[color-mix(in_srgb,var(--color-brand-cream)_18%,white)] px-4 py-3 text-sm font-medium text-[var(--color-brand-800)] transition hover:border-[var(--color-brand-400)] hover:bg-[color-mix(in_srgb,var(--color-brand-cream)_32%,white)]"
              >
                <Paperclip className="h-4 w-4" aria-hidden />
                Anexar arquivos
              </button>
              {fileError && (
                <p className="mt-3 text-sm font-medium text-[var(--color-error-700)]" role="alert">
                  {fileError}
                </p>
              )}
              {evidenceFiles.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-[var(--color-brand-800)]">
                  {evidenceFiles.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2"
                    >
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="shrink-0 text-xs font-semibold text-[var(--color-error-600)] hover:underline"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/50 p-4 text-sm">
              <h2 className="text-base font-semibold text-[var(--color-brand-900)]">Revise antes de enviar</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Identificação</dt>
                  <dd className="mt-0.5 text-[var(--color-brand-900)]">
                    {isAnonymous ? 'Anônima' : `${reporterName.trim()} — ${reporterContact.trim()}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Categoria</dt>
                  <dd className="mt-0.5 text-[var(--color-brand-900)]">{complaintCategory || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Relação com o denunciado</dt>
                  <dd className="mt-0.5 text-[var(--color-brand-900)]">{accusedRelationship || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Data / câmera no local</dt>
                  <dd className="mt-0.5 text-[var(--color-brand-900)]">
                    {incidentDate || '—'} — {locationHasCamera === 'sim' ? 'Sim' : locationHasCamera === 'nao' ? 'Não' : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Assunto</dt>
                  <dd className="mt-0.5 text-[var(--color-brand-900)]">{subject.trim() || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Descrição</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-[var(--color-brand-900)]">{body.trim() || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Anexos</dt>
                  <dd className="mt-0.5 text-[var(--color-brand-900)]">
                    {evidenceFiles.length === 0 ? 'Nenhum' : `${evidenceFiles.length} arquivo(s)`}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {stepError && (
            <p className="text-sm font-medium text-[var(--color-error-700)]" role="alert">
              {stepError}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--color-brand-300)] px-5 py-3 text-sm font-semibold text-[var(--color-brand-700)] transition hover:bg-[var(--color-brand-50)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Voltar
            </button>

            {step < totalSteps - 1 ? (
              <button type="button" onClick={goNext} className={primaryCtaCls}>
                Próximo
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className={`${primaryCtaCls} flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-10`}
              >
                {submitting ? 'Enviando...' : 'Enviar denúncia'}
                <Send className="h-5 w-5" aria-hidden />
              </button>
            )}
          </div>

          {onConsultar && (
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              Já enviou uma denúncia?{' '}
              <button
                type="button"
                onClick={onConsultar}
                className="font-semibold text-[var(--color-brand-700)] underline hover:no-underline"
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
