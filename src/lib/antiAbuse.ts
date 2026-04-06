const KEY_PREFIX = 'confiara:antiabuse'

type AttemptPayload = {
  ts: number[]
}

function storageKey(action: string, tenantId: string): string {
  return `${KEY_PREFIX}:${tenantId}:${action}`
}

function readAttempts(action: string, tenantId: string): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey(action, tenantId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as AttemptPayload
    return Array.isArray(parsed.ts) ? parsed.ts.filter((n) => Number.isFinite(n)) : []
  } catch {
    return []
  }
}

function writeAttempts(action: string, tenantId: string, timestamps: number[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(action, tenantId), JSON.stringify({ ts: timestamps }))
  } catch {
    // ignore storage errors
  }
}

export function assertClientRateLimit(input: {
  action: string
  tenantId: string
  maxAttempts: number
  windowMs: number
  message: string
}): void {
  const now = Date.now()
  const threshold = now - input.windowMs
  const recent = readAttempts(input.action, input.tenantId).filter((ts) => ts >= threshold)
  if (recent.length >= input.maxAttempts) throw new Error(input.message)
  recent.push(now)
  writeAttempts(input.action, input.tenantId, recent)
}

export function isLikelyBotHoneyPot(value: string): boolean {
  return value.trim().length > 0
}

