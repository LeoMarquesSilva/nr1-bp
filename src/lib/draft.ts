const PREFIX = 'confiara:draft'

type DraftPayload<T> = {
  v: number
  updatedAt: string
  data: T
}

function key(flow: string, tenantId: string): string {
  return `${PREFIX}:${flow}:${tenantId}`
}

export function saveDraft<T>(flow: string, tenantId: string, data: T): void {
  if (typeof window === 'undefined') return
  const payload: DraftPayload<T> = {
    v: 1,
    updatedAt: new Date().toISOString(),
    data,
  }
  try {
    window.localStorage.setItem(key(flow, tenantId), JSON.stringify(payload))
  } catch {
    // ignore quota/private mode failures
  }
}

export function loadDraft<T>(flow: string, tenantId: string, maxAgeHours = 72): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key(flow, tenantId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as DraftPayload<T>
    const updated = Date.parse(parsed.updatedAt)
    if (!Number.isFinite(updated)) return null
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000
    if (Date.now() - updated > maxAgeMs) {
      clearDraft(flow, tenantId)
      return null
    }
    return parsed.data ?? null
  } catch {
    return null
  }
}

export function clearDraft(flow: string, tenantId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key(flow, tenantId))
  } catch {
    // ignore
  }
}

