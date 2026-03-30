import { motion } from 'motion/react'
import { MessageSquareWarning, ArrowRight } from 'lucide-react'
import { ComplianceBadge } from './ComplianceBadge'

type Props = {
  onFazerRelato: () => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemLeft = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

export function HeroContent({ onFazerRelato }: Props) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col"
    >
      <motion.div variants={itemLeft}>
        <ComplianceBadge />
      </motion.div>

      <motion.h1
        variants={itemLeft}
        className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-white lg:text-5xl"
      >
        Confiara: canal de denúncias e gestão psicossocial com confiança total.
      </motion.h1>

      <motion.p
        variants={itemLeft}
        className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--color-brand-100)]"
      >
        Compliance e cuidado humano num só lugar: denúncias seguras, visibilidade para RH e apoio às exigências legais.
      </motion.p>

      <motion.div variants={itemLeft} className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onFazerRelato}
          aria-label="Abrir canal de denúncias"
          className="inline-flex min-h-[48px] min-w-[44px] items-center justify-center gap-2 rounded-full bg-[var(--color-brand-cream)] px-8 py-3 text-base font-semibold text-[var(--color-brand-900)] shadow-[var(--shadow-md)] transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-brand-900)]"
        >
          <MessageSquareWarning className="h-[18px] w-[18px] shrink-0" aria-hidden />
          Canal de denúncias
        </button>
        <a
          href="#plataforma-funcionalidades"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[var(--color-brand-900)]"
        >
          Ver o que a plataforma oferece
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </motion.div>

      <motion.p
        variants={itemLeft}
        className="mt-4 text-xs text-[var(--color-brand-200)]"
      >
        100% anônimo · Protocolo rastreável · Acessível via celular e QR Code
      </motion.p>
    </motion.div>
  )
}
