import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

/** Pequenas pausas evitam que a barra pisque quando o mouse só cruza a faixa a caminho de outro lugar. */
const OPEN_DELAY_MS = 120
const CLOSE_DELAY_MS = 220

/** Computador com mouse: a barra recolhe e abre ao passar o mouse. Telas de toque mantêm a barra aberta. */
const HOVER_QUERY = '(hover: hover) and (pointer: fine)'

function subscribeHover(onChange: () => void) {
  const mql = window.matchMedia(HOVER_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

export function useCanHover(): boolean {
  return useSyncExternalStore(subscribeHover, () => window.matchMedia(HOVER_QUERY).matches, () => false)
}

/**
 * Última forma de interação. Foco vindo de clique (ou foco automático de um campo que abriu por clique)
 * não deve prender a barra aberta; só navegação por teclado.
 */
let lastInputWasKeyboard = false
let modalityListeners = 0

function onKeyDownGlobal(e: KeyboardEvent) {
  if (!e.metaKey && !e.ctrlKey && !e.altKey) lastInputWasKeyboard = true
}

function onPointerDownGlobal() {
  lastInputWasKeyboard = false
}

/**
 * Estado aberto/recolhido da barra lateral.
 * Abre com o mouse em cima, com navegação por teclado dentro (Tab) ou com o seletor de empresa aberto.
 */
export function useSidebarHover(enabled: boolean) {
  const [hovered, setHovered] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [locked, setLocked] = useState(false)
  const timer = useRef<number | null>(null)
  const pending = useRef<'open' | 'close' | null>(null)
  const ref = useRef<HTMLElement>(null)

  const clearTimer = () => {
    if (timer.current != null) window.clearTimeout(timer.current)
    timer.current = null
    pending.current = null
  }

  const schedule = (value: boolean, delay: number) => {
    clearTimer()
    pending.current = value ? 'open' : 'close'
    timer.current = window.setTimeout(() => {
      timer.current = null
      pending.current = null
      setHovered(value)
    }, delay)
  }

  // Rede de segurança: se um elemento some debaixo do cursor (ex.: item do seletor clicado), o navegador
  // pode não avisar que o mouse saiu da barra. Enquanto aberta por hover, confere a posição a cada movimento.
  useEffect(() => {
    if (!enabled || !hovered) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const inside = Boolean(ref.current?.contains(e.target as Node))
      if (!inside && pending.current !== 'close') schedule(false, CLOSE_DELAY_MS)
      else if (inside && pending.current === 'close') clearTimer()
    }
    document.addEventListener('pointermove', onMove)
    return () => document.removeEventListener('pointermove', onMove)
  }, [enabled, hovered])

  useEffect(() => {
    if (modalityListeners++ === 0) {
      document.addEventListener('keydown', onKeyDownGlobal, true)
      document.addEventListener('pointerdown', onPointerDownGlobal, true)
    }
    return () => {
      clearTimer()
      if (--modalityListeners === 0) {
        document.removeEventListener('keydown', onKeyDownGlobal, true)
        document.removeEventListener('pointerdown', onPointerDownGlobal, true)
      }
    }
  }, [])

  // Se o modo muda (ex.: mouse conectado/desconectado), começa recolhida.
  useEffect(() => {
    clearTimer()
    setHovered(false)
    setKeyboardFocus(false)
  }, [enabled])

  // Quando o seletor fecha, o campo de busca some sem disparar "blur": confere onde o foco ficou.
  useEffect(() => {
    if (!locked && ref.current && !ref.current.contains(document.activeElement)) setKeyboardFocus(false)
  }, [locked])

  const onPointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') schedule(true, OPEN_DELAY_MS)
  }, [])

  // Cobre o caso do cursor já estar sobre a barra quando a página carrega (aí não há "entrada").
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && !hovered && timer.current == null) schedule(true, OPEN_DELAY_MS)
    },
    [hovered]
  )

  const onPointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') schedule(false, CLOSE_DELAY_MS)
  }, [])

  const onFocus = useCallback(() => {
    if (lastInputWasKeyboard) setKeyboardFocus(true)
  }, [])

  const onBlur = useCallback((e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardFocus(false)
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Escape' || locked) return
      clearTimer()
      setHovered(false)
      setKeyboardFocus(false)
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    },
    [locked]
  )

  return {
    ref,
    expanded: !enabled || hovered || keyboardFocus || locked,
    /** Para o seletor de empresa: aberto = barra não recolhe. Função estável. */
    setLocked,
    handlers: enabled ? { onPointerEnter, onPointerMove, onPointerLeave, onFocus, onBlur, onKeyDown } : {},
  }
}
