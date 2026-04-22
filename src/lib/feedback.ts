type ToastKind = 'success' | 'error' | 'info'

type ToastPayload = {
  kind: ToastKind
  message: string
}

type ConfirmPayload = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}

type PromptPayload = {
  title: string
  message: string
  defaultValue?: string
  placeholder?: string
  confirmLabel?: string
  cancelLabel?: string
}

type FeedbackEvents = {
  toast: (payload: ToastPayload) => void
  confirm: (payload: ConfirmPayload, resolve: (ok: boolean) => void) => void
  prompt: (payload: PromptPayload, resolve: (value: string | null) => void) => void
}

const listeners: { [K in keyof FeedbackEvents]: Set<FeedbackEvents[K]> } = {
  toast: new Set(),
  confirm: new Set(),
  prompt: new Set(),
}

function emit<K extends keyof FeedbackEvents>(type: K, ...args: Parameters<FeedbackEvents[K]>): void {
  listeners[type].forEach((listener) => (listener as (...params: Parameters<FeedbackEvents[K]>) => void)(...args))
}

export function subscribeFeedback<K extends keyof FeedbackEvents>(
  type: K,
  listener: FeedbackEvents[K]
): () => void {
  listeners[type].add(listener)
  return () => listeners[type].delete(listener)
}

export const feedback = {
  success(message: string): void {
    emit('toast', { kind: 'success', message })
  },
  error(message: string): void {
    emit('toast', { kind: 'error', message })
  },
  info(message: string): void {
    emit('toast', { kind: 'info', message })
  },
  confirm(payload: ConfirmPayload): Promise<boolean> {
    return new Promise((resolve) => {
      if (listeners.confirm.size === 0) {
        const ok = window.confirm(`${payload.title}\n\n${payload.message}`)
        resolve(ok)
        return
      }
      emit('confirm', payload, resolve)
    })
  },
  promptText(payload: PromptPayload): Promise<string | null> {
    return new Promise((resolve) => {
      if (listeners.prompt.size === 0) {
        const value = window.prompt(`${payload.title}\n${payload.message}`, payload.defaultValue ?? '')
        resolve(value === null ? null : value)
        return
      }
      emit('prompt', payload, resolve)
    })
  },
}

