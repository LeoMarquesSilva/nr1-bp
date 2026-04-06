import { Shield, Mail, Phone, MapPin, Building, Lock, FileCheck } from 'lucide-react'
import { getAppName } from '../../lib/tenant'
import { Logo } from './header/logo'
import { getHrefForView } from '../../lib/routes'

export type FooterNavView = 'landing' | 'relatos-buscar' | 'sobre' | 'privacidade' | 'contato'

type Props = {
  onNavigate?: (view: FooterNavView) => void
  hideCanalDenunciaNav?: boolean
}

export function Footer({ onNavigate, hideCanalDenunciaNav = false }: Props) {
  const currentYear = new Date().getFullYear()

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, view: FooterNavView) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(view)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer
      className="mt-auto border-t border-[var(--border)] bg-[var(--color-brand-50)] pb-8 pt-16"
      itemScope
      itemType="https://schema.org/Organization"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          
          {/* Brand & SEO Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="mb-3">
              <Logo className="w-fit" size="footer" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]" itemProp="description">
              Plataforma completa e segura para gestão de Canal de Denúncias e Diagnóstico de Riscos Psicossociais. Proteja sua empresa e promova um ambiente saudável e seguro.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--color-brand-600)]">
              Confiara: a confiança transformada em método de gestão e prevenção.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-brand-900)]">Navegação</h4>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Navegação do rodapé">
              <a href={getHrefForView('landing')} onClick={(e) => handleNav(e, 'landing')} className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--color-brand-700)]">Página Inicial</a>
              <a href={getHrefForView('sobre')} onClick={(e) => handleNav(e, 'sobre')} className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--color-brand-700)]">Sobre a Plataforma</a>
              {!hideCanalDenunciaNav && (
                <a href={getHrefForView('relatos-buscar')} onClick={(e) => handleNav(e, 'relatos-buscar')} className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--color-brand-700)]">Canal de denúncia</a>
              )}
              <a href={getHrefForView('contato')} onClick={(e) => handleNav(e, 'contato')} className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--color-brand-700)]">Fale Conosco</a>
              <a href={getHrefForView('privacidade')} onClick={(e) => handleNav(e, 'privacidade')} className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--color-brand-700)]">Política de Privacidade</a>
            </nav>
          </div>

          {/* Funcionalidades & SEO Keywords */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-brand-900)]">Nossas Soluções</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-[var(--muted-foreground)]">
              <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-[var(--color-brand-400)]"/> Criptografia Ponta a Ponta</li>
              <li className="flex items-center gap-2"><Building className="h-4 w-4 text-[var(--color-brand-400)]"/> Conformidade ISO 37002</li>
              <li className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-[var(--color-brand-400)]"/> Adequação à NR-1</li>
            </ul>
          </div>

          {/* Contato & Localização (GEO SEO) */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-brand-900)]">Contato Comercial</h4>
            <address className="mt-4 flex flex-col gap-3 text-sm text-[var(--muted-foreground)] not-italic" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[var(--color-brand-400)] shrink-0 mt-0.5" />
                <span itemProp="streetAddress">Rua Coronel Quirino, 1266 - Cambuí<br/>
                <span itemProp="addressLocality">Campinas</span>, <span itemProp="addressRegion">SP</span> - <span itemProp="postalCode">13025-002</span><br/>
                <span itemProp="addressCountry">Brasil</span></span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--color-brand-400)]" />
                <a href="mailto:contato@bismarchipires.com.br" className="hover:text-[var(--color-brand-700)] transition-colors" itemProp="email">contato@bismarchipires.com.br</a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[var(--color-brand-400)]" />
                <a href="tel:+5511900000000" className="hover:text-[var(--color-brand-700)] transition-colors" itemProp="telephone">+55 (11) 90000-0000</a>
              </p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-[var(--border)] pt-8 sm:flex-row gap-4">
          <p className="text-xs text-[var(--muted-foreground)] text-center sm:text-left">
            &copy; {currentYear} {getAppName()}. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
             <span className="text-xs text-[var(--color-brand-500)]">Desenvolvido para segurança e conformidade</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
