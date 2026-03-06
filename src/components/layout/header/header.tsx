"use client"

import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import { NavLinks } from "./nav-links"
import { MobileMenu } from "./mobile-menu"
import type { View } from "./nav-links"

export interface HealthqoeHeaderProps {
  /** Current view (for active state). Optional when header is minimal. */
  view?: View
  /** Navigate to a view. Optional when showNavAndAdmin is false. */
  onNavigate?: (view: View) => void
  /** Open admin gate. Optional. */
  onOpenAdmin?: () => void
  /** When false, only logo is shown (e.g. canal de denúncias). */
  showNavAndAdmin?: boolean
  /** When true, show "Área administrativa" button. */
  showAdminButton?: boolean
}

export function HealthqoeHeader({
  view = "landing",
  onNavigate = () => {},
  onOpenAdmin,
  showNavAndAdmin = true,
  showAdminButton = false,
}: HealthqoeHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 h-16 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 lg:px-8"
      role="banner"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4">
        <div className="flex shrink-0 items-center">
          <Logo
            onNavigateHome={showNavAndAdmin ? () => onNavigate("landing") : undefined}
          />
        </div>

        {showNavAndAdmin && (
          <nav
            className="hidden lg:flex flex-1 items-center justify-center"
            aria-label="Navegação principal"
          >
            <NavLinks view={view} onNavigate={onNavigate} />
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {showNavAndAdmin && (
            <MobileMenu
              view={view}
              onNavigate={onNavigate}
              onOpenAdmin={onOpenAdmin}
              showNavAndAdmin={showNavAndAdmin}
              showAdminButton={showAdminButton}
            />
          )}
          {showNavAndAdmin && (
            <div className="hidden lg:flex items-center gap-2">
              {showAdminButton && onOpenAdmin ? (
                <Button
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-5 text-sm font-semibold shadow-lg shadow-slate-900/10"
                  onClick={onOpenAdmin}
                >
                  Área administrativa
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    onClick={() => onNavigate("login")}
                  >
                    Entrar
                  </Button>
                  <Button
                    className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-5 text-sm font-semibold shadow-lg shadow-slate-900/10"
                    onClick={() => onNavigate("contato")}
                  >
                    Entre em contato
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
