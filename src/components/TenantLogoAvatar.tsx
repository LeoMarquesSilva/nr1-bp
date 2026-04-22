import { useState } from 'react'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
} as const

const INITIALS_TEXT: Record<keyof typeof SIZES, string> = {
  sm: 'text-[10px] font-semibold leading-none',
  md: 'text-xs font-semibold leading-none',
  lg: 'text-sm font-semibold leading-none',
  xl: 'text-base font-semibold leading-none',
}

type Size = keyof typeof SIZES

function initialsFromLabel(label: string): string {
  const t = label.trim()
  if (!t) return '?'
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const a = parts[0][0] ?? ''
    const b = parts[parts.length - 1]?.[0] ?? ''
    return (a + b).toUpperCase()
  }
  const alnum = t.replace(/[^a-zA-Z0-9À-ÿ]/g, '')
  if (alnum.length >= 2) return alnum.slice(0, 2).toUpperCase()
  return t.slice(0, Math.min(2, t.length)).toUpperCase()
}

type Props = {
  logoUrl?: string | null
  label: string
  size?: Size
  className?: string
  /** Círculo (avatar) por padrão; use lg/xl para cantos mais suaves onde o layout pedir. */
  rounded?: 'full' | 'lg' | 'xl'
}

export function TenantLogoAvatar({ logoUrl, label, size = 'md', className, rounded = 'full' }: Props) {
  const [failed, setFailed] = useState(false)
  const url = logoUrl?.trim()
  const roundClass =
    rounded === 'xl' ? 'rounded-xl' : rounded === 'lg' ? 'rounded-lg' : 'rounded-full'
  const initials = initialsFromLabel(label)

  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        className={cn(
          'shrink-0 border border-black/10 bg-white object-contain',
          roundClass,
          SIZES[size],
          className
        )}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center border border-[var(--color-brand-600)]/25 bg-[var(--color-brand-600)] text-white',
        roundClass,
        SIZES[size],
        INITIALS_TEXT[size],
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  )
}
