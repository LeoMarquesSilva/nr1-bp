import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError = false, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          hasError
            ? "border-[var(--color-error-500)] focus-visible:ring-[color-mix(in_srgb,var(--color-error-500)_30%,white)]"
            : "border-[var(--input-border)] focus-visible:border-[var(--input-focus)]",
          disabled && "cursor-not-allowed bg-[var(--muted)] text-[var(--muted-foreground)] opacity-70",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
