import { MessageSquarePlus, FileQuestion, ArrowRight, Shield } from 'lucide-react'
import { TenantLogoAvatar } from './TenantLogoAvatar'
import { PageShell, PageShellCard } from './layout/PageShell'

type Props = {
  orgSlug: string
  orgDisplayName?: string | null
  orgLogoUrl?: string | null
  onEnviarDenuncia: () => void
  onAcompanharCodigo: () => void
}

export function CanalRelatosHub({ orgSlug, orgDisplayName, orgLogoUrl, onEnviarDenuncia, onAcompanharCodigo }: Props) {
  const orgName = orgDisplayName || orgSlug

  return (
    <PageShell maxWidth="narrow" className="space-y-8" surface="onGradient">
      <PageShellCard padding="lg" surface="onGradient">
        <div className="flex items-center gap-3">
          {orgLogoUrl?.trim() ? (
            <TenantLogoAvatar logoUrl={orgLogoUrl} label={orgName} size="lg" rounded="xl" />
          ) : (
            <div className="brand-icon-tile h-12 w-12 rounded-xl">
              <Shield className="h-6 w-6" aria-hidden />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-600)]">
              Canal de denúncia
            </p>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-brand-900)]">{orgName}</h1>
          </div>
        </div>

        <p className="mt-6 text-[var(--muted-foreground)]">
          Registre uma denúncia de forma anônima ou informando seus dados, ou acompanhe uma denúncia já enviada pelo código de protocolo.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onEnviarDenuncia}
            className="group flex flex-col items-start rounded-xl border-2 border-[var(--border)] bg-gradient-to-br from-white to-[color-mix(in_srgb,var(--color-brand-50)_70%,white)] p-5 text-left transition hover:border-[var(--color-brand-400)] hover:shadow-[var(--shadow-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
          >
            <div className="brand-icon-tile h-10 w-10 rounded-lg">
              <MessageSquarePlus className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-4 font-semibold text-[var(--color-brand-900)]">Enviar denúncia</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Nova denúncia, com opção de anonimato ou identificação.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-700)] transition-all group-hover:gap-2 group-hover:text-[var(--color-brand-800)]">
              Acessar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </button>

          <button
            type="button"
            onClick={onAcompanharCodigo}
            className="group flex flex-col items-start rounded-xl border-2 border-[var(--border)] bg-gradient-to-br from-white to-[color-mix(in_srgb,var(--color-brand-50)_70%,white)] p-5 text-left transition hover:border-[var(--color-brand-400)] hover:shadow-[var(--shadow-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
          >
            <div className="brand-icon-tile h-10 w-10 rounded-lg">
              <FileQuestion className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-4 font-semibold text-[var(--color-brand-900)]">Acompanhar denúncia por código</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Informe o protocolo para ver o status da sua denúncia.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-700)] transition-all group-hover:gap-2 group-hover:text-[var(--color-brand-800)]">
              Acessar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </button>
        </div>
      </PageShellCard>
    </PageShell>
  )
}
