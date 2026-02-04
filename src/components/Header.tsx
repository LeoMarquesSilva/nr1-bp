import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'
import type { View } from '../App'

const NAV = [
  { id: 'identificacao' as const, label: 'Início' },
  { id: 'sobre' as const, label: 'Sobre' },
  { id: 'privacidade' as const, label: 'Privacidade' },
]

interface HeaderProps {
  view: View
  onNavigate: (view: View) => void
  onOpenAdmin: () => void
  showNavAndAdmin: boolean
  showAdminButton: boolean
}

export function Header({
  view,
  onNavigate,
  onOpenAdmin,
  showNavAndAdmin,
  showAdminButton,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)
  const handleNav = (v: View) => {
    onNavigate(v)
    closeMobile()
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{
        background: 'linear-gradient(180deg, rgba(13,24,32,0.97) 0%, rgba(8,16,24,0.98) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.2)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 sm:py-4">
        {/* Logo + nome do produto (estilo referência: logo + marca) */}
        <button
          type="button"
          onClick={() => handleNav('identificacao')}
          className="flex shrink-0 items-center gap-3 text-left"
          aria-label="Ir para início"
        >
          <img
            src="/logo.png"
            alt="Bismarchi Pires"
            className="h-8 w-auto sm:h-9"
            width={160}
            height={36}
          />
          <span className="hidden h-6 w-px flex-shrink-0 bg-white/20 sm:block" aria-hidden />
          <span className="hidden text-base font-semibold tracking-tight text-white sm:block">
            Diagnóstico HSE-IT
          </span>
        </button>

        {/* Desktop: nav centralizada + CTA à direita */}
        {showNavAndAdmin && (
          <>
            <nav
              className="hidden flex-1 justify-center md:flex"
              aria-label="Navegação principal"
            >
              <div className="flex items-center gap-0.5">
              {NAV.map(({ id, label }) => (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => onNavigate(id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    view === id
                      ? 'text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {view === id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg border border-white/30 bg-white/10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      style={{ borderWidth: '1.5px' }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </motion.button>
              ))}
              </div>
            </nav>

            {showAdminButton && (
              <motion.button
                type="button"
                onClick={onOpenAdmin}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="hidden shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold text-[var(--escritorio-escuro)] shadow-lg md:block"
                style={{
                  background: 'linear-gradient(135deg, #D5B170 0%, #c4a060 100%)',
                  boxShadow: '0 2px 12px rgba(213,177,112,0.35)',
                }}
              >
                Área administrativa
              </motion.button>
            )}
          </>
        )}

        {/* Mobile: menu toggle */}
        {showNavAndAdmin && (
          <motion.button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/90 transition hover:bg-white/10 md:hidden"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        )}
      </div>

      {/* Mobile menu (dropdown animado) */}
      <AnimatePresence>
        {showNavAndAdmin && mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden border-t border-white/10 md:hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(8,16,24,0.98) 0%, rgba(13,24,32,0.99) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
              {NAV.map(({ id, label }, i) => (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => handleNav(id)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`w-full rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${
                    view === id
                      ? 'bg-[var(--escritorio-dourado)]/20 text-[var(--escritorio-dourado)]'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  {label}
                </motion.button>
              ))}
              {showAdminButton && (
                <motion.button
                  type="button"
                  onClick={() => { onOpenAdmin(); closeMobile() }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-2 w-full rounded-xl bg-[var(--escritorio-dourado)] py-3.5 text-center text-sm font-bold text-[var(--escritorio-escuro)]"
                >
                  Área administrativa
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
