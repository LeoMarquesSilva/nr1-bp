import * as React from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "pending" | "resolved" | "critical" | "neutral"

const variants: Record<BadgeVariant, string> = {
  pending: "bg-[var(--color-warning-50)] text-[var(--color-warning-700)] border-[color-mix(in_srgb,var(--color-warning-500)_35%,white)]",
  resolved: "bg-[var(--color-success-50)] text-[var(--color-success-700)] border-[color-mix(in_srgb,var(--color-success-500)_35%,white)]",
  critical: "bg-[var(--color-error-50)] text-[var(--color-error-700)] border-[color-mix(in_srgb,var(--color-error-500)_35%,white)]",
  neutral: "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] border-[var(--color-brand-200)]",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
