import { useMemo, useRef, useState } from 'react'
import { PlayCircle, ArrowRight, Volume2, Maximize2, Minimize2 } from 'lucide-react'
import { toggleElementFullscreen, useVideoContainerIsFullscreen } from '../lib/videoEmbedFullscreen'
import { Button } from './ui/button'

type Props = {
  onPular: () => void
}

const VIDEO_BASE_URL = 'https://www.youtube-nocookie.com/embed/cE9zzXquHFY'

export function DiagnosticoIntroVideo({ onPular }: Props) {
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
      <div className="relative overflow-hidden rounded-2xl landing-premium-bg px-6 py-8 shadow-[var(--shadow-md)] sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-100)]">
            Antes de começar
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Entenda como funciona o diagnóstico
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-brand-100)] sm:text-base">
            Assista ao vídeo para entender o objetivo da avaliação, como suas respostas serão usadas e por que sua participação
            é importante para melhorar o ambiente de trabalho. Se preferir, você pode pular esta etapa e ir direto para o
            formulário.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-900)]">
          <PlayCircle className="h-5 w-5 text-[var(--color-brand-700)]" />
          Vídeo explicativo
        </div>
        <div
          ref={videoWrapRef}
          className="overflow-hidden rounded-xl border border-[var(--border)] bg-black [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:flex [&:fullscreen]:min-h-screen [&:fullscreen]:w-screen [&:fullscreen]:items-stretch [&:fullscreen]:bg-black [&:fullscreen]:[&_iframe]:aspect-auto [&:fullscreen]:[&_iframe]:min-h-[100dvh] [&:fullscreen]:[&_iframe]:w-full [&:fullscreen]:[&_iframe]:flex-1"
        >
          <iframe
            title="Vídeo de introdução ao diagnóstico"
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
            className="h-11 w-full rounded-full px-6 sm:w-auto"
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
          onClick={onPular}
          className="h-11 w-full rounded-full px-6 sm:ml-auto sm:w-auto"
        >
          Continuar para o diagnóstico
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}
