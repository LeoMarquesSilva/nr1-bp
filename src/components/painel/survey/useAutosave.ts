import { useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

/**
 * Salva `value` automaticamente após uma pausa na edição.
 * O primeiro valor é considerado já salvo; mudanças pendentes são gravadas ao sair da tela.
 */
export function useAutosave<T>(value: T, save: (value: T) => Promise<void>, { delay = 800, enabled = true } = {}) {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const lastSaved = useRef(JSON.stringify(value))
  const latest = useRef(value)
  const saveRef = useRef(save)
  const timer = useRef<number | null>(null)
  const inFlight = useRef<Promise<void> | null>(null)

  latest.current = value
  saveRef.current = save

  const flush = async () => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    const snapshot = JSON.stringify(latest.current)
    if (snapshot === lastSaved.current) return
    if (inFlight.current) await inFlight.current.catch(() => {})
    setStatus('saving')
    const p = saveRef.current(latest.current)
    inFlight.current = p
    try {
      await p
      lastSaved.current = snapshot
      setError(null)
      setStatus(JSON.stringify(latest.current) === snapshot ? 'saved' : 'pending')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
      setStatus('error')
    } finally {
      inFlight.current = null
    }
  }

  useEffect(() => {
    if (!enabled) return
    if (JSON.stringify(value) === lastSaved.current) return
    setStatus('pending')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      void flush()
    }, delay)
  }, [value, enabled, delay])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(latest.current) === lastSaved.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      // Ao trocar de tela dentro do painel, grava o que ficou pendente.
      if (JSON.stringify(latest.current) !== lastSaved.current) void saveRef.current(latest.current).catch(() => {})
    }
  }, [])

  return { status, error, flush }
}

export function autosaveLabel(status: AutosaveStatus): string {
  switch (status) {
    case 'pending':
      return 'Alterações não salvas'
    case 'saving':
      return 'Salvando…'
    case 'saved':
      return 'Salvo'
    case 'error':
      return 'Erro ao salvar'
    default:
      return 'Salvo automaticamente'
  }
}
