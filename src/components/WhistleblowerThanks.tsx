import { useState } from 'react'
import { CheckCircle2, Copy } from 'lucide-react'
import { PageShell, PageShellCard } from './layout/PageShell'

type Props = {
  protocolId: string
  isAnonymous: boolean
  onFechar: () => void
  onConsultar?: () => void
}

export function WhistleblowerThanks({ protocolId, isAnonymous, onFechar, onConsultar }: Props) {
  const [copied, setCopied] = useState(false)

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocolId).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <PageShell maxWidth="narrow" className="text-center" surface="onGradient">
      <PageShellCard padding="lg" surface="onGradient">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success-50)_75%,var(--color-brand-cream))] text-[var(--color-success-700)] ring-2 ring-[color-mix(in_srgb,var(--color-brand-400)_40%,transparent)]">
          <CheckCircle2 className="h-10 w-10" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-brand-900)] sm:text-3xl">Denúncia recebida</h1>
        <p className="mx-auto mt-4 max-w-md text-left text-[var(--muted-foreground)] sm:text-center">
          {isAnonymous ? (
            <>
              Sua denúncia foi registrada de forma <strong>anônima</strong> e será analisada pelo comitê de ética. Guarde o número do protocolo para
              acompanhar o andamento.
            </>
          ) : (
            <>
              Sua denúncia foi registrada com os dados de contato informados. A organização poderá utilizar essas informações para retorno, quando
              aplicável. Guarde também o protocolo para acompanhar o status.
            </>
          )}
        </p>
        <div className="mt-6 rounded-xl border-2 border-[var(--color-brand-400)] bg-[color-mix(in_srgb,var(--color-brand-cream)_28%,white)] px-4 py-3 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-brand-400)_18%,transparent)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Seu protocolo</p>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-2 font-mono text-lg font-bold tracking-widest text-[var(--color-brand-800)]">
            <span>{protocolId}</span>
            <button
              type="button"
              onClick={copyProtocol}
              className="rounded p-1 hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              aria-label="Copiar protocolo"
            >
              <Copy className="h-4 w-4" aria-hidden />
            </button>
          </p>
          <p className="mt-2 min-h-[1.25rem] text-sm text-[var(--color-brand-700)]" role="status" aria-live="polite">
            {copied ? 'Protocolo copiado para a área de transferência.' : '\u00a0'}
          </p>
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {isAnonymous ? (
            <>Use este número nesta mesma página (opção &quot;Consultar denúncia&quot;) para ver o status sem precisar se identificar.</>
          ) : (
            <>Você também pode acompanhar o status pelo protocolo, em &quot;Consultar denúncia&quot;, quando desejar.</>
          )}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onConsultar && (
            <button
              type="button"
              onClick={onConsultar}
              className="rounded-full border-2 border-[var(--color-brand-300)] px-5 py-3 font-semibold text-[var(--color-brand-700)] transition hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)]"
            >
              Consultar denúncia
            </button>
          )}
          <button type="button" onClick={onFechar} className="btn-escritorio rounded-full px-6 py-3 font-semibold">
            Fechar
          </button>
        </div>
      </PageShellCard>
    </PageShell>
  )
}
