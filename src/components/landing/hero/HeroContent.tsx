import { motion } from 'motion/react'
import { MessageSquareWarning } from 'lucide-react'
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
        className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 lg:text-5xl"
      >
        Diagnóstico Psicossocial e Canal de Denúncias em{' '}
        <span className="relative inline-block">
          <span className="relative z-10 rounded bg-violet-100 px-2">uma única plataforma</span>
        </span>
        .
      </motion.h1>

      <motion.p
        variants={itemLeft}
        className="mt-6 max-w-lg text-lg leading-relaxed text-slate-500"
      >
        Avalie riscos psicossociais com o método HSE-IT, receba relatos anônimos com protocolo seguro e gerencie tudo em um painel centralizado. Multi-tenant, pronto para sua organização.
      </motion.p>

      <motion.div variants={itemLeft} className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onFazerRelato}
          aria-label="Abrir canal para fazer relato ou denúncia anônima"
          className="inline-flex min-h-[48px] min-w-[44px] items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          <MessageSquareWarning className="h-[18px] w-[18px] shrink-0" aria-hidden />
          Fazer Relato Anônimo
        </button>
      </motion.div>

      <motion.p
        variants={itemLeft}
        className="mt-3 text-xs text-slate-400"
      >
        🔒 100% anônimo · Protocolo rastreável · Dados isolados por empresa
      </motion.p>

      <motion.p variants={itemLeft} className="mt-6 rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-600">
        O <strong>diagnóstico psicossocial (HSE-IT)</strong> é disponibilizado mediante link enviado pela sua empresa após cadastro e contratação dos serviços. Se você recebeu o link, acesse-o diretamente para responder.
      </motion.p>

      <motion.div variants={itemLeft} className="mt-12 flex flex-wrap gap-3">
        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          NR-1
        </span>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          Lei 14.457/22
        </span>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          ISO 37002
        </span>
      </motion.div>
      <motion.p variants={itemLeft} className="mt-2 text-xs text-slate-400">
        Atende às exigências do MTE a partir de maio/2025
      </motion.p>
    </motion.div>
  )
}
