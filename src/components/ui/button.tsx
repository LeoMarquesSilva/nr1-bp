import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"

const variantClass = {
  primary: "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--primary-hover)]",
  secondary:
    "border border-[var(--color-brand-300)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]",
  ghost: "bg-transparent text-[var(--color-brand-700)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
  outline:
    "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--accent)]",
  link: "text-[var(--primary)] underline-offset-4 hover:underline",
  destructive: "bg-[var(--danger)] text-[var(--danger-foreground)] hover:bg-[var(--danger-hover)]",
}

const sizeClass = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-[var(--radius-sm)] px-3 text-xs",
  lg: "h-11 rounded-[var(--radius-md)] px-8",
  icon: "h-10 w-10",
  iconSm: "h-8 w-8",
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClass
  size?: keyof typeof sizeClass
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(base, variantClass[variant], sizeClass[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
