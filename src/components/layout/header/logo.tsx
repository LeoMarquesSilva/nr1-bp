import { cn } from "@/lib/utils"

const LOGO_SRC = "/logo-azul.png"
const LOGO_ALT = "Bismarchi Pires Logo"

export interface LogoProps {
  /** When set, logo acts as button and calls this (app navigation). Otherwise links to "/". */
  onNavigateHome?: () => void
  className?: string
}

export function Logo({ onNavigateHome, className }: LogoProps) {
  const img = (
    <img
      src={LOGO_SRC}
      alt={LOGO_ALT}
      className="h-8 w-auto max-h-10 object-contain object-left"
      width={180}
      height={40}
      loading="eager"
    />
  )
  const baseClass =
    "flex items-center text-[var(--foreground)] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20 focus-visible:ring-offset-2 rounded-md"

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
