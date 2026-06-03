import { useMemo, useRef, useState } from 'react'
import { MessageSquarePlus, FileQuestion, ArrowRight, Shield, PlayCircle, Volume2, Maximize2, Minimize2 } from 'lucide-react'
import { toggleElementFullscreen, useVideoContainerIsFullscreen } from '../lib/videoEmbedFullscreen'
import { TenantLogoAvatar } from './TenantLogoAvatar'
import { PageShell, PageShellCard } from './layout/PageShell'
import { Button } from './ui/button'

type Props = {
  orgSlug: string
  orgDisplayName?: string | null
  orgLogoUrl?: string | null
  onEnviarDenuncia: () => void
  onAcompanharCodigo: () => void
}

const VIDEO_BASE_URL = 'https://www.youtube-nocookie.com/embed/yksh6VrSroI'

export function CanalRelatosHub({ orgSlug, orgDisplayName, orgLogoUrl, onEnviarDenuncia, onAcompanharCodigo }: Props) {
  const orgName = orgDisplayName || orgSlug
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const isVideoFullscreen = useVideoContainerIsFullscreen(videoWrapRef)
  const [audioLigado, setAudioLigado] = useState(false)
  const canalHelpVideoUrl = useMemo(
    () =>
      `${VIDEO_BASE_URL}?si=x4WBOKPmABfEn4lh&autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0&mute=${
        audioLigado ? '0' : '1'
      }`,
    [audioLigado]
  )

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
          Ao tocar em Enviar denúncia, aparece outro vídeo com orientações específicas para preencher o relato com segurança.
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-900)]">
            <PlayCircle className="h-5 w-5 shrink-0 text-[var(--color-brand-700)]" aria-hidden />
            Como usar este canal (vídeo)
          </div>
          <div
            ref={videoWrapRef}
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-black [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:flex [&:fullscreen]:min-h-screen [&:fullscreen]:w-screen [&:fullscreen]:items-stretch [&:fullscreen]:bg-black [&:fullscreen]:[&_iframe]:aspect-auto [&:fullscreen]:[&_iframe]:min-h-[100dvh] [&:fullscreen]:[&_iframe]:w-full [&:fullscreen]:[&_iframe]:flex-1"
          >
            <iframe
              title="Como enviar uma denúncia ou acompanhar pelo código no canal"
              src={canalHelpVideoUrl}
              className="aspect-video w-full min-h-[12rem]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => void toggleElementFullscreen(videoWrapRef.current)}
              className="h-11 w-full shrink-0 rounded-full px-6 sm:w-auto"
            >
              {isVideoFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4" aria-hidden />
                  Sair da tela cheia
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" aria-hidden />
                  Ampliar vídeo
                </>
              )}
            </Button>
          </div>
          {!audioLigado && (
            <div className="mt-4 rounded-xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-[var(--color-brand-900)]">
                  O vídeo iniciou sem som para abrir automaticamente.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  onClick={() => setAudioLigado(true)}
                  className="h-11 w-full shrink-0 rounded-full px-6 sm:w-auto"
                >
                  <Volume2 className="h-4 w-4" aria-hidden />
                  Ativar som
                </Button>
              </div>
            </div>
          )}
        </div>

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
