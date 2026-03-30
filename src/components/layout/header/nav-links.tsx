"use client"

import { cn } from "@/lib/utils"
import { getHrefForView, type AppRouteView } from "@/lib/routes"

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
  { view: "relatos-buscar", label: "Canal de denúncia" },
  { view: "sobre", label: "Sobre" },
  { view: "privacidade", label: "Privacidade" },
]

export type HeaderAppearance = "light" | "dark"

export interface NavLinksProps {
  view: View
  onNavigate: (view: View) => void
  hideCanalDenunciaNav?: boolean
  appearance?: HeaderAppearance
}

const navBtnBase =
  "inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"

export function NavLinks({
  view,
  onNavigate,
  hideCanalDenunciaNav = false,
  appearance = "light",
}: NavLinksProps) {
  const links = hideCanalDenunciaNav
    ? APP_NAV.filter((item) => item.view !== "relatos-buscar")
    : APP_NAV
  const isDark = appearance === "dark"

  return (
    <ul className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1">
      {links.map(({ view: v, label }) => {
        const active = view === v
        const href = getHrefForView(v as AppRouteView)
        return (
          <li key={v}>
            <a
              href={href}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(v)
              }}
              className={cn(
                navBtnBase,
                isDark
                  ? "focus-visible:ring-white/45 focus-visible:ring-offset-[var(--color-brand-900)]"
                  : "focus-visible:ring-[var(--ring)]",
                active
                  ? isDark
                    ? "bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)]"
                    : "bg-[var(--color-brand-100)] text-[var(--color-brand-900)] shadow-[inset_0_0_0_1px_var(--color-brand-200)]"
                  : isDark
                    ? "text-white/85 hover:bg-white/10 hover:text-white"
                    : "text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-900)]"
              )}
            >
              {label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
