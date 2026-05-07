import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

function getFullscreenElement(): Element | null {
  const d = document as Document & {
    webkitFullscreenElement?: Element | null
    msFullscreenElement?: Element | null
  }
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? d.msFullscreenElement ?? null
}

/** Expande ou encolhe o contêiner do vídeo em tela cheia (bom para iframe do YouTube). */
export async function toggleElementFullscreen(el: HTMLElement | null): Promise<void> {
  if (!el || typeof document === 'undefined') return
  const anyEl = el as HTMLElement & {
    webkitRequestFullscreen?: () => void | Promise<void>
    msRequestFullscreen?: () => void | Promise<void>
    requestFullscreen?: () => Promise<void>
  }
  const d = document as Document & {
    webkitExitFullscreen?: () => void | Promise<void>
    msExitFullscreen?: () => void | Promise<void>
    exitFullscreen?: () => Promise<void>
  }
  try {
    if (getFullscreenElement() === el) {
      if (d.exitFullscreen) await d.exitFullscreen()
      else if (d.webkitExitFullscreen) await d.webkitExitFullscreen()
      else d.msExitFullscreen?.()
      return
    }
    if (anyEl.requestFullscreen) await anyEl.requestFullscreen()
    else if (anyEl.webkitRequestFullscreen) await anyEl.webkitRequestFullscreen()
    else anyEl.msRequestFullscreen?.()
  } catch {
    // Alguns navegadores bloqueiam; o botão exige gesto do usuário.
  }
}

export function useVideoContainerIsFullscreen(ref: RefObject<HTMLElement | null>): boolean {
  const [fullscreen, setFullscreen] = useState(false)
  useEffect(() => {
    const sync = () => setFullscreen(getFullscreenElement() === ref.current)
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    document.addEventListener('MSFullscreenChange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
      document.removeEventListener('MSFullscreenChange', sync)
    }
  }, [ref])
  return fullscreen
}
