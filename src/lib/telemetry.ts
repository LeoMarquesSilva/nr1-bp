type TelemetryEvent = {
  name: string
  ts: string
  tenantId?: string
  flow?: 'diagnostico' | 'denuncia' | 'landing' | 'admin'
  step?: string
  meta?: Record<string, string | number | boolean | null>
}

const STORAGE_KEY = 'confiara:telemetry:v1'
const MAX_EVENTS = 1200

function readEvents(): TelemetryEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TelemetryEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeEvents(events: TelemetryEvent[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
  } catch {
    // no-op
  }
}

export function trackEvent(event: Omit<TelemetryEvent, 'ts'>): void {
  const next: TelemetryEvent = { ...event, ts: new Date().toISOString() }
  const events = readEvents()
  events.push(next)
  writeEvents(events)
}

export function getTelemetrySummary() {
  const events = readEvents()
  const byName: Record<string, number> = {}
  const byFlow: Record<string, number> = {}
  for (const evt of events) {
    byName[evt.name] = (byName[evt.name] ?? 0) + 1
    if (evt.flow) byFlow[evt.flow] = (byFlow[evt.flow] ?? 0) + 1
  }
  return {
    total: events.length,
    byName,
    byFlow,
    events,
  }
}

