import { LineChart, Line, ResponsiveContainer } from 'recharts'
import type { LucideIcon } from 'lucide-react'

const SPARKLINE_DATA = [
  { v: 42 }, { v: 55 }, { v: 48 }, { v: 62 }, { v: 58 }, { v: 71 },
  { v: 65 }, { v: 78 }, { v: 72 }, { v: 85 }, { v: 80 }, { v: 90 },
]

type Props = {
  icon: LucideIcon
  iconBgClass: string
  iconColorClass: string
  value: string | number
  label: string
  badge?: string
  badgeClass?: string
  sparkline?: boolean
  valueClassName?: string
}

export function MetricCard({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  value,
  label,
  badge,
  badgeClass = 'bg-amber-50 text-amber-700',
  sparkline = false,
  valueClassName = 'text-2xl font-bold text-slate-900',
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBgClass}`}
        >
          <Icon className={`h-4 w-4 ${iconColorClass}`} aria-hidden />
        </div>
        {badge && (
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>
      <p className={`mt-2 ${valueClassName}`}>{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
      {sparkline && (
        <div className="mt-2 h-10 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SPARKLINE_DATA} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#10b981"
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
