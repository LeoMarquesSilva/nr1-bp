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
import { Logo } from "./logo"
import type { View } from "./nav-links"

const APP_NAV: { view: View; label: string }[] = [
  { view: "landing", label: "Início" },
  { view: "relatos-buscar", label: "Canal de relatos" },
  { view: "sobre", label: "Sobre" },
  { view: "privacidade", label: "Privacidade" },
]

export interface MobileMenuProps {
  view: View
  onNavigate: (view: View) => void
  showNavAndAdmin: boolean
}

export function MobileMenu({
  view,
  onNavigate,
  showNavAndAdmin,
}: MobileMenuProps) {
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
          className="lg:hidden text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col w-[min(100vw-2rem,320px)] sm:max-w-[320px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 pt-8">
          <div>
            <Logo onNavigateHome={() => handleNav("landing")} />
          </div>
          {showNavAndAdmin && (
            <nav aria-label="Navegação mobile" className="flex flex-col gap-1">
              {APP_NAV.map((item, i) => (
                <motion.div
                  key={item.view}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.2 }}
                >
                  <button
                    type="button"
                    onClick={() => handleNav(item.view)}
                    className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                      view === item.view
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}
            </nav>
          )}
          <div className="mt-auto flex flex-col gap-3 border-t border-slate-200 pt-6">
            {showNavAndAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => handleNav("login")}
                >
                  Entrar
                </Button>
                <Button
                  className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white px-5 text-sm font-semibold shadow-lg shadow-slate-900/10"
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
