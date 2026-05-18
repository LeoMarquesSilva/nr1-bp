import { useMemo, useRef, useState } from 'react'
import { ArrowRight, PlayCircle, Volume2, Maximize2, Minimize2 } from 'lucide-react'
import { toggleElementFullscreen, useVideoContainerIsFullscreen } from '../lib/videoEmbedFullscreen'
import { Button } from './ui/button'

type Props = {
  onContinuar: () => void
}

const VIDEO_BASE_URL = 'https://www.youtube-nocookie.com/embed/yksh6VrSroI'

export function DenunciaIntroVideo({ onContinuar }: Props) {
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const isVideoFullscreen = useVideoContainerIsFullscreen(videoWrapRef)
  const [audioLigado, setAudioLigado] = useState(false)
  const videoUrl = useMemo(
    () =>
      `${VIDEO_BASE_URL}?autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0&mute=${
        audioLigado ? '0' : '1'
      }`,
    [audioLigado]
  )

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-white/10 px-6 py-8 shadow-[var(--shadow-md)] ring-1 ring-white/20 sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-100)]">
            Antes de enviar sua denúncia
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Entenda como registrar um relato com segurança
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-brand-100)] sm:text-base">
            Este vídeo mostra como preencher a denúncia, quais informações ajudam na apuração e como acompanhar o protocolo
            depois do envio.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[var(--shadow-sm)] backdrop-blur-md sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <PlayCircle className="h-5 w-5 text-[var(--color-brand-200)]" />
          Vídeo: como fazer uma denúncia
        </div>
        <div
          ref={videoWrapRef}
          className="overflow-hidden rounded-xl border border-white/20 bg-black [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:flex [&:fullscreen]:min-h-screen [&:fullscreen]:w-screen [&:fullscreen]:items-stretch [&:fullscreen]:bg-black [&:fullscreen]:[&_iframe]:aspect-auto [&:fullscreen]:[&_iframe]:min-h-[100dvh] [&:fullscreen]:[&_iframe]:w-full [&:fullscreen]:[&_iframe]:flex-1"
        >
          <iframe
            title="Vídeo de orientação para denúncias"
            src={videoUrl}
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
            className="h-11 w-full rounded-full border-white/35 bg-white/10 px-6 text-white hover:bg-white/15 sm:w-auto"
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
          <div className="mt-4 rounded-xl border border-white/25 bg-white/10 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-white">O vídeo iniciou sem som para abrir automaticamente.</p>
              <Button
                type="button"
                variant="primary"
                size="default"
                onClick={() => setAudioLigado(true)}
                className="h-11 w-full rounded-full px-6 sm:w-auto"
              >
                <Volume2 className="h-4 w-4" />
                Ativar som
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-end">
        <Button
          type="button"
          variant="primary"
          size="default"
          onClick={onContinuar}
          className="h-11 w-full rounded-full px-6 sm:ml-auto sm:w-auto"
        >
          Continuar para denúncia
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}
