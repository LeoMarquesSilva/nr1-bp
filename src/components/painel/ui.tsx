import { forwardRef, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { handleLinkClick } from './router'

export { Button } from '@/components/ui/button'

// ---------- Navegação ----------

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

/** Link interno do painel: navega sem recarregar e mantém Ctrl+clique para nova aba. */
export const PainelLink = forwardRef<HTMLAnchorElement, LinkProps>(function PainelLink({ to, onClick, ...props }, ref) {
  return (
    <a
      ref={ref}
      href={to}
      onClick={(e) => {
        onClick?.(e)
        handleLinkClick(e, to)
      }}
      {...props}
    />
  )
})

export type Crumb = { label: string; to?: string }

export function PageHeader({
  breadcrumbs,
  title,
  description,
  actions,
  meta,
}: {
  breadcrumbs?: Crumb[]
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
}) {
  return (
    <header className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Você está em" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--color-brand-600)]">
            {breadcrumbs.map((c, i) => (
              <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand-300)]" aria-hidden />}
                {c.to ? (
                  <PainelLink to={c.to} className="truncate rounded px-0.5 hover:text-[var(--color-brand-900)] hover:underline">
                    {c.label}
                  </PainelLink>
                ) : (
                  <span className="truncate" aria-current="page">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-sans text-2xl font-bold tracking-tight text-[var(--color-brand-900)] [text-wrap:balance]">{title}</h1>
            {meta}
          </div>
          {description && <p className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-[var(--color-brand-700)]">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function TabNav({ items, label }: { items: { label: string; to: string; active: boolean; count?: number }[]; label: string }) {
  return (
    <nav aria-label={label} className="mb-6 border-b border-[var(--border)]">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {items.map((item) => (
          <li key={item.to}>
            <PainelLink
              to={item.to}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                item.active
                  ? 'border-[var(--color-brand-700)] text-[var(--color-brand-900)]'
                  : 'border-transparent text-[var(--color-brand-600)] hover:border-[var(--color-brand-200)] hover:text-[var(--color-brand-900)]'
              )}
            >
              {item.label}
              {item.count != null && (
                <span className="rounded-full bg-[var(--color-brand-100)] px-1.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--color-brand-700)]">
                  {item.count}
                </span>
              )}
            </PainelLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ---------- Superfícies ----------

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <section className={cn('rounded-xl border border-[var(--border)] bg-white', className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="font-sans text-base font-semibold text-[var(--color-brand-900)]">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-[var(--color-brand-700)]">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn(padded && 'p-5')}>{children}</div>
    </section>
  )
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-600)]" aria-hidden>
          {icon}
        </div>
      )}
      <p className="font-sans text-base font-semibold text-[var(--color-brand-900)]">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm leading-relaxed text-[var(--color-brand-700)]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-[var(--color-brand-100)] motion-reduce:animate-none', className)} aria-hidden />
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const TONE_CLASS: Record<Tone, string> = {
  success: 'bg-[var(--color-success-50)] text-[var(--color-success-700)]',
  warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-700)]',
  danger: 'bg-[var(--color-error-50)] text-[var(--color-error-700)]',
  neutral: 'bg-[var(--color-brand-100)] text-[var(--color-brand-700)]',
  info: 'bg-[var(--color-info-50)] text-[var(--color-info-700)]',
}

const DOT_CLASS: Record<Tone, string> = {
  success: 'bg-[var(--color-success-500)]',
  warning: 'bg-[var(--color-warning-500)]',
  danger: 'bg-[var(--color-error-500)]',
  neutral: 'bg-[var(--color-brand-400)]',
  info: 'bg-[var(--color-info-500)]',
}

export function StatusPill({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold', TONE_CLASS[tone], className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT_CLASS[tone])} aria-hidden />
      {children}
    </span>
  )
}

export function Notice({ tone = 'info', children, action }: { tone?: Tone; children: ReactNode; action?: ReactNode }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm', TONE_CLASS[tone])} role={tone === 'danger' ? 'alert' : 'status'}>
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
      {action}
    </div>
  )
}

// ---------- Formulários ----------

export const inputCls =
  'w-full rounded-lg border border-[var(--input-border)] bg-white px-3 py-2 text-sm text-[var(--color-brand-900)] placeholder:text-[var(--color-brand-500)] transition-colors focus:border-[var(--input-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--color-brand-50)] disabled:text-[var(--color-brand-600)]'

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: ReactNode
  error?: string | null
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[var(--color-brand-900)]">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-[var(--color-error-700)]" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-brand-600)]">{hint}</p>
      )}
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: ReactNode
  disabled?: boolean
  id?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-brand-900)]">
          {label}
        </label>
        {description && <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-brand-700)]">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-[var(--color-brand-700)]' : 'bg-[var(--color-brand-200)]'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow-[var(--shadow-xs)] transition-transform duration-150 motion-reduce:transition-none',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

// ---------- Formatação ----------

export function formatDateTimeBR(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Data pura do banco (AAAA-MM-DD), sem fuso. */
export function formatDayBR(day: string): string {
  const [y, m, d] = day.split('-')
  return y && m && d ? `${d}/${m}/${y}` : day
}

export function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}
