import type { OptionKey } from '../data/hseIt'

export interface Submission {
  id: string
  setor: string
  funcao: string
  answers: Record<number, OptionKey>
  submittedAt: string // ISO
}

const STORAGE_KEY = 'hseit_submissions'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getSubmissions(): Submission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as (Submission & { funcao?: string })[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((s) => ({ ...s, funcao: s.funcao ?? '' }))
  } catch {
    return []
  }
}

export function saveSubmission(
  setor: string,
  answers: Record<number, OptionKey>
): Submission {
  const list = getSubmissions()
  const submission: Submission = {
    id: generateId(),
    setor,
    funcao: '',
    answers,
    submittedAt: new Date().toISOString(),
  }
  list.unshift(submission)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  return submission
}

export function deleteSubmission(id: string): void {
  const list = getSubmissions().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function deleteSubmissions(ids: string[]): void {
  const set = new Set(ids)
  const list = getSubmissions().filter((s) => !set.has(s.id))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}
