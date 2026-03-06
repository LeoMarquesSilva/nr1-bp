import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"

const variantClass = {
  default: "bg-[var(--primary)] text-[var(--primary-foreground)] shadow hover:opacity-90",
  destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  outline:
    "border border-[var(--border)] bg-transparent shadow-sm hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
  secondary: "bg-[var(--muted)] text-[var(--foreground)] shadow-sm hover:bg-[var(--muted)]/80",
  ghost: "hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
  link: "text-[var(--primary)] underline-offset-4 hover:underline",
}

const sizeClass = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
  iconSm: "h-8 w-8",
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClass
  size?: keyof typeof sizeClass
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
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
