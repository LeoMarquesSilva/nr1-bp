import { cn } from "@/lib/utils"

const LOGO_LIGHT = "/logos/logo-horizontal-azul.png"
const LOGO_DARK = "/logos/logo-horizontal-branca.png"
const LOGO_ALT = "CONFIARA"

export interface LogoProps {
  /** When set, logo acts as button and calls this (app navigation). Otherwise links to "/". */
  onNavigateHome?: () => void
  className?: string
  variant?: "light" | "dark"
}

export function Logo({ onNavigateHome, className, variant = "light" }: LogoProps) {
  const img = (
    <img
      src={variant === "dark" ? LOGO_DARK : LOGO_LIGHT}
      alt={LOGO_ALT}
      className="h-9 w-auto max-h-[2.5rem] object-contain object-left sm:h-10"
      width={200}
      height={44}
      loading="eager"
    />
  )
  const baseClass =
    "flex items-center text-[var(--foreground)] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-md"

  if (onNavigateHome) {
    return (
      <button
        type="button"
        onClick={onNavigateHome}
        className={cn(baseClass, "bg-transparent border-0 cursor-pointer p-0", className)}
        aria-label={LOGO_ALT}
      >
        {img}
      </button>
    )
  }
  return (
    <a href="/" className={cn(baseClass, className)} aria-label={LOGO_ALT}>
      {img}
    </a>
  )
}
