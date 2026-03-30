import * as React from "react"
import { cn } from "@/lib/utils"

type CardVariant = "standard" | "kpi" | "analytics"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantClass: Record<CardVariant, string> = {
  standard: "bg-[var(--card)] border-[var(--border)] shadow-[var(--shadow-xs)]",
  kpi: "bg-white border-[var(--color-brand-200)] shadow-[var(--shadow-sm)]",
  analytics: "bg-[var(--color-brand-50)] border-[var(--color-brand-200)] shadow-[var(--shadow-xs)]",
}

function Card({ className, variant = "standard", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border p-5 text-[var(--card-foreground)]",
        variantClass[variant],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex items-start justify-between gap-3", className)} {...props} />
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-[var(--foreground)]", className)} {...props} />
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-[var(--muted-foreground)]", className)} {...props} />
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
