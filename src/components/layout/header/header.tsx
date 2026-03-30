"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import { NavLinks, type HeaderAppearance } from "./nav-links"
import { MobileMenu } from "./mobile-menu"
import type { View } from "./nav-links"

export type { HeaderAppearance }

export interface HealthqoeHeaderProps {
  /** Current view (for active state). Optional when header is minimal. */
  view?: View
  /** Navigate to a view. Optional when showNavAndAdmin is false. */
  onNavigate?: (view: View) => void
  /** When false, only logo is shown (e.g. canal de denúncias). */
  showNavAndAdmin?: boolean
  /** Esconder item "Canal de denúncia" no menu (fluxo link do formulário). */
  hideCanalDenunciaNav?: boolean
  /** Superfície do header: `dark` alinha com o hero da landing. */
  appearance?: HeaderAppearance
}

export function HealthqoeHeader({
  view = "landing",
  onNavigate = () => {},
  showNavAndAdmin = true,
  hideCanalDenunciaNav = false,
  appearance = "light",
}: HealthqoeHeaderProps) {
  const isDark = appearance === "dark"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-md",
        isDark
          ? "border-b border-white/10 bg-[var(--color-brand-900)]/95 shadow-none supports-[backdrop-filter]:bg-[var(--color-brand-900)]/90"
          : "border-b border-[var(--border)] bg-white/95 shadow-[var(--shadow-xs)] supports-[backdrop-filter]:bg-white/90"
      )}
      role="banner"
    >
      <div className="mx-auto flex min-h-[3.75rem] max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:min-h-16 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <Logo
            variant={isDark ? "dark" : "light"}
            onNavigateHome={showNavAndAdmin ? () => onNavigate("landing") : undefined}
          />
        </div>

        {showNavAndAdmin && (
          <nav
            className="hidden min-w-0 flex-1 items-center justify-center px-2 lg:flex"
            aria-label="Navegação principal"
          >
            <NavLinks
              view={view}
              onNavigate={onNavigate}
              hideCanalDenunciaNav={hideCanalDenunciaNav}
              appearance={appearance}
            />
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {showNavAndAdmin && (
            <MobileMenu
              view={view}
              onNavigate={onNavigate}
              showNavAndAdmin={showNavAndAdmin}
              hideCanalDenunciaNav={hideCanalDenunciaNav}
              appearance={appearance}
            />
          )}
          {showNavAndAdmin && (
            <div className="hidden items-center gap-2 lg:flex">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  isDark
                    ? "text-white/90 hover:bg-white/10 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-900)]"
                    : "text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] hover:text-[var(--color-brand-900)]"
                )}
                onClick={() => onNavigate("login")}
              >
                Entrar
              </Button>
              <Button
                variant="primary"
                size="default"
                className={cn(
                  "rounded-full px-5 shadow-[var(--shadow-sm)]",
                  isDark &&
                    "bg-[var(--color-brand-cream)] text-[var(--color-brand-900)] hover:bg-white focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-900)]"
                )}
                onClick={() => onNavigate("contato")}
              >
                Entre em contato
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
