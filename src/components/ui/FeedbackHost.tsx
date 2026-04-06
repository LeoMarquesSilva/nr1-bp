import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { subscribeFeedback } from '@/lib/feedback'

type ToastItem = {
  id: string
  kind: 'success' | 'error' | 'info'
  message: string
}

type ConfirmState = {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  resolve: (ok: boolean) => void
}

type PromptState = {
  title: string
  message: string
  defaultValue: string
  placeholder: string
  confirmLabel: string
  cancelLabel: string
  resolve: (value: string | null) => void
}

export function FeedbackHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const [promptState, setPromptState] = useState<PromptState | null>(null)
  const [promptValue, setPromptValue] = useState('')

  useEffect(() => {
    const offToast = subscribeFeedback('toast', ({ kind, message }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((curr) => [...curr, { id, kind, message }])
      window.setTimeout(() => {
        setToasts((curr) => curr.filter((t) => t.id !== id))
      }, 3600)
    })
    const offConfirm = subscribeFeedback('confirm', (payload, resolve) => {
      setConfirmState({
        title: payload.title,
        message: payload.message,
        confirmLabel: payload.confirmLabel ?? 'Confirmar',
        cancelLabel: payload.cancelLabel ?? 'Cancelar',
        resolve,
      })
    })
    const offPrompt = subscribeFeedback('prompt', (payload, resolve) => {
      setPromptState({
        title: payload.title,
        message: payload.message,
        defaultValue: payload.defaultValue ?? '',
        placeholder: payload.placeholder ?? '',
        confirmLabel: payload.confirmLabel ?? 'Salvar',
        cancelLabel: payload.cancelLabel ?? 'Cancelar',
        resolve,
      })
      setPromptValue(payload.defaultValue ?? '')
    })
    return () => {
      offToast()
      offConfirm()
      offPrompt()
    }
  }, [])

  return (
    <>
      <div className="pointer-events-none fixed right-4 top-4 z-[70] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex min-w-[260px] max-w-[360px] items-start gap-2 rounded-xl border px-3 py-2 shadow-lg ${
              toast.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : toast.kind === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-[var(--color-brand-200)] bg-white text-[var(--color-brand-900)]'
            }`}
          >
            {toast.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            ) : toast.kind === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            )}
            <p className="text-sm">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToasts((curr) => curr.filter((t) => t.id !== toast.id))}
              className="ml-auto rounded p-0.5 opacity-70 transition hover:opacity-100"
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--color-brand-900)]">{confirmState.title}</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{confirmState.message}</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  confirmState.resolve(false)
                  setConfirmState(null)
                }}
                className="flex-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--color-brand-700)]"
              >
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmState.resolve(true)
                  setConfirmState(null)
                }}
                className="flex-1 rounded-xl bg-[var(--color-brand-700)] px-3 py-2 text-sm font-semibold text-white"
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {promptState && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--color-brand-900)]">{promptState.title}</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{promptState.message}</p>
            <input
              type="text"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder={promptState.placeholder}
              className="mt-4 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--color-brand-900)]"
            />
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  promptState.resolve(null)
                  setPromptState(null)
                }}
                className="flex-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--color-brand-700)]"
              >
                {promptState.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  promptState.resolve(promptValue)
                  setPromptState(null)
                }}
                className="flex-1 rounded-xl bg-[var(--color-brand-700)] px-3 py-2 text-sm font-semibold text-white"
              >
                {promptState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

