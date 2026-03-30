import { LineChart, Line, ResponsiveContainer } from 'recharts'
import type { LucideIcon } from 'lucide-react'

const SPARKLINE_DATA = [
  { v: 42 }, { v: 55 }, { v: 48 }, { v: 62 }, { v: 58 }, { v: 71 },
  { v: 65 }, { v: 78 }, { v: 72 }, { v: 85 }, { v: 80 }, { v: 90 },
]

type Props = {
  icon: LucideIcon
  tone?: 'brand' | 'success' | 'warning' | 'neutral'
  value: string | number
  label: string
  badge?: string
  badgeClass?: string
  sparkline?: boolean
  valueClassName?: string
}

export function MetricCard({
  icon: Icon,
  tone = 'brand',
  value,
  label,
  badge,
  badgeClass = 'bg-[var(--color-warning-50)] text-[var(--color-warning-700)]',
  sparkline = false,
  valueClassName = 'text-2xl font-bold text-[var(--color-brand-900)]',
}: Props) {
  const toneClass = {
    brand: 'bg-[var(--color-brand-100)] text-[var(--color-brand-700)]',
    success: 'bg-[var(--color-success-50)] text-[var(--color-success-700)]',
    warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-700)]',
    neutral: 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)]',
  }[tone]

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        {badge && (
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>
      <p className={`mt-2 ${valueClassName}`}>{value}</p>
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      {sparkline && (
        <div className="mt-2 h-10 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SPARKLINE_DATA} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="var(--color-success-500)"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
