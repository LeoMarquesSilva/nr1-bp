import { ShieldCheck } from 'lucide-react'

export function ComplianceBadge() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700"
      role="status"
      aria-label="Em conformidade com NR-1, Lei 14.457/22 e ISO 37002"
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Em conformidade com NR-1, Lei 14.457/22 e ISO 37002
    </span>
  )
}
