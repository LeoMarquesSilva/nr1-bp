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
  /** When false, only logo is shown (e.g. canal de denúncias). */
  showNavAndAdmin?: boolean
}

export function HealthqoeHeader({
  view = "landing",
  onNavigate = () => {},
  showNavAndAdmin = true,
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
              showNavAndAdmin={showNavAndAdmin}
            />
          )}
          {showNavAndAdmin && (
            <div className="hidden lg:flex items-center gap-2">
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
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
