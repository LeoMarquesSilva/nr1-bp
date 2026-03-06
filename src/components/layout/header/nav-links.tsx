"use client"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

export type View =
  | "landing"
  | "relatos-buscar"
  | "identificacao"
  | "form"
  | "obrigado"
  | "sobre"
  | "privacidade"
  | "admin-gate"
  | "admin"
  | "coleta-encerrada"
  | "denuncia-hub"
  | "denuncia"
  | "denuncia-obrigado"
  | "denuncia-consultar"
  | "login"
  | "contato"

const APP_NAV: { view: View; label: string }[] = [
  { view: "landing", label: "Início" },
  { view: "relatos-buscar", label: "Canal de relatos" },
  { view: "sobre", label: "Sobre" },
  { view: "privacidade", label: "Privacidade" },
]

export interface NavLinksProps {
  view: View
  onNavigate: (view: View) => void
}

export function NavLinks({ view, onNavigate }: NavLinksProps) {
  return (
    <NavigationMenu className="max-w-none justify-center">
      <NavigationMenuList className="gap-1">
        {APP_NAV.map(({ view: v, label }) => (
          <NavigationMenuItem key={v}>
            <NavigationMenuLink asChild>
              <button
                type="button"
                onClick={() => onNavigate(v)}
                className={cn(
                  navigationMenuTriggerStyle(),
                  view === v && "bg-[var(--accent)] text-[var(--foreground)]"
                )}
              >
                {label}
              </button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
