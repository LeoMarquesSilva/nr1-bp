"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { getHrefForView, type AppRouteView } from "@/lib/routes"
import { Logo } from "./logo"
import type { HeaderAppearance, View } from "./nav-links"

const APP_NAV: { view: View; label: string }[] = [
  { view: "landing", label: "Início" },
  { view: "relatos-buscar", label: "Canal de denúncia" },
  { view: "sobre", label: "Sobre" },
  { view: "privacidade", label: "Privacidade" },
]

export interface MobileMenuProps {
  view: View
  onNavigate: (view: View) => void
  showNavAndAdmin: boolean
  hideCanalDenunciaNav?: boolean
  appearance?: HeaderAppearance
}

export function MobileMenu({
  view,
  onNavigate,
  showNavAndAdmin,
  hideCanalDenunciaNav = false,
  appearance = "light",
}: MobileMenuProps) {
  const isDark = appearance === "dark"
  const links = hideCanalDenunciaNav
    ? APP_NAV.filter((item) => item.view !== "relatos-buscar")
    : APP_NAV
  const [open, setOpen] = useState(false)

  const handleNav = (v: View) => {
    onNavigate(v)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "lg:hidden",
            isDark
              ? "text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-900)]"
              : "text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] hover:text-[var(--color-brand-900)]"
          )}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col w-[min(100vw-2rem,320px)] sm:max-w-[320px]",
          isDark &&
            "border-white/10 bg-[var(--color-brand-900)] text-white [&>button]:text-white [&>button]:hover:bg-white/10 [&>button]:ring-offset-[var(--color-brand-900)]"
        )}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 pt-8">
          <div
            className={cn("border-b pb-6", isDark ? "border-white/15" : "border-[var(--border)]")}
          >
            <Logo variant={isDark ? "dark" : "light"} onNavigateHome={() => handleNav("landing")} />
          </div>
          {showNavAndAdmin && (
            <nav aria-label="Navegação mobile" className="flex flex-col gap-1">
              {links.map((item, i) => (
                <motion.div
                  key={item.view}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.2 }}
                >
                  <a
                    href={getHrefForView(item.view as AppRouteView)}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNav(item.view)
                    }}
                    className={cn(
                      "block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
                      view === item.view
                        ? isDark
                          ? "bg-white/15 text-white"
                          : "bg-[var(--color-brand-100)] text-[var(--color-brand-900)]"
                        : isDark
                          ? "text-white/90 hover:bg-white/10"
                          : "text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]"
                    )}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}
            </nav>
          )}
          <div
            className={cn(
              "mt-auto flex flex-col gap-3 border-t pt-6",
              isDark ? "border-white/15" : "border-[var(--border)]"
            )}
          >
            {showNavAndAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-center",
                    isDark
                      ? "text-white/90 hover:bg-white/10 hover:text-white"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                  )}
                  onClick={() => handleNav("login")}
                >
                  Entrar
                </Button>
                <Button
                  className={cn(
                    "w-full rounded-full px-5 text-sm font-semibold shadow-[var(--shadow-sm)]",
                    isDark
                      ? "bg-[var(--color-brand-cream)] text-[var(--color-brand-900)] hover:bg-white"
                      : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                  )}
                  onClick={() => handleNav("contato")}
                >
                  Entre em contato
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
