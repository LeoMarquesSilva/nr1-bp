import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'

type MaxWidth = 'narrow' | 'medium' | 'wide'

const maxWidthClass: Record<MaxWidth, string> = {
  narrow: 'max-w-xl',
  medium: 'max-w-2xl',
  wide: 'max-w-3xl',
}

/** `onGradient`: texto claro sobre landing-premium-bg / denuncia-flow-canvas. */
export type PageShellSurface = 'default' | 'onGradient'

export type PageShellProps = {
  title?: string
  subtitle?: ReactNode
  onBack?: () => void
  backLabel?: string
  children: ReactNode
  maxWidth?: MaxWidth
  className?: string
  footer?: ReactNode
  surface?: PageShellSurface
}

export function PageShell({
  title,
  subtitle,
  onBack,
  backLabel = 'Voltar',
  children,
  maxWidth = 'narrow',
  className,
  footer,
  surface = 'default',
}: PageShellProps) {
  const onGrad = surface === 'onGradient'

  return (
    <div
      className={cn(
        'mx-auto w-full space-y-6 font-reading text-base leading-relaxed',
        maxWidthClass[maxWidth],
        className,
      )}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'inline-flex items-center gap-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            onGrad
              ? 'text-white/90 hover:text-white focus-visible:ring-white/45 focus-visible:ring-offset-transparent'
              : 'text-[var(--muted-foreground)] hover:text-[var(--color-brand-900)] focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
          )}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          {backLabel}
        </button>
      )}

      {(title || subtitle) && (
        <header className="space-y-3">
          {title && (
            <div className="space-y-3">
              <span
                className={cn(
                  'block h-1 w-14 rounded-full bg-gradient-to-r',
                  onGrad
                    ? 'from-[var(--color-brand-cream)] via-white to-[var(--color-brand-400)]'
                    : 'from-[var(--color-brand-800)] via-[var(--color-brand-400)] to-[var(--color-brand-600)]',
                )}
                aria-hidden
              />
              <h1
                className={cn(
                  'text-2xl font-bold tracking-tight sm:text-3xl',
                  onGrad ? 'text-white' : 'text-[var(--color-brand-900)]',
                )}
              >
                {title}
              </h1>
            </div>
          )}
          {subtitle && (
            <div
              className={cn(
                onGrad
                  ? 'text-[var(--color-brand-100)] [&_strong]:font-semibold [&_strong]:text-white'
                  : 'text-[var(--muted-foreground)] [&_strong]:font-semibold [&_strong]:text-[var(--color-brand-800)]',
              )}
            >
              {subtitle}
            </div>
          )}
        </header>
      )}

      {children}

      {footer}
    </div>
  )
}

export type PageShellCardProps = {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  surface?: PageShellSurface
}

const paddingClass: Record<NonNullable<PageShellCardProps['padding']>, string> = {
  sm: 'p-5',
  md: 'p-6',
  lg: 'p-8 sm:p-10',
}

export function PageShellCard({ children, className, padding = 'md', surface = 'default' }: PageShellCardProps) {
  const onGrad = surface === 'onGradient'

  return (
    <div
      className={cn(
        onGrad
          ? 'denuncia-glass-panel text-[var(--color-brand-900)]'
          : 'rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white via-white to-[color-mix(in_srgb,var(--color-brand-50)_55%,white)] shadow-[inset_0_3px_0_0_var(--color-brand-400),var(--shadow-sm)]',
        !onGrad && 'rounded-2xl',
        paddingClass[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}
