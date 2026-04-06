import { trackEvent } from './telemetry'

export function captureError(error: unknown, context: string): void {
  const message = error instanceof Error ? error.message : String(error)
  trackEvent({
    name: 'frontend_error',
    flow: 'admin',
    step: context,
    meta: { message },
  })
}

export function initGlobalErrorMonitoring(): () => void {
  const onError = (event: ErrorEvent) => {
    captureError(event.error ?? event.message, 'window_error')
  }
  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    captureError(event.reason, 'unhandled_rejection')
  }
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onUnhandledRejection)
  return () => {
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onUnhandledRejection)
  }
}

