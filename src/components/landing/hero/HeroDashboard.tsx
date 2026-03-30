import { motion } from 'motion/react'
import { Sparkles, ShieldCheck, Clock3, CircleAlert, CheckCircle2 } from 'lucide-react'

const cardStagger = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08 },
  }),
}

export function HeroDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative"
    >
      <div
        className="hero-dashboard-card rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[var(--shadow-md)] backdrop-blur-md transition-all duration-500"
        role="region"
        aria-label="Preview do painel operacional de denúncias"
      >
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-4 flex items-center justify-between rounded-2xl border border-white/20 bg-[var(--color-brand-900)]/55 px-4 py-3"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-brand-200)]">Visão Executiva</p>
            <p className="text-sm font-semibold text-white">Painel Confiara</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-400)]/20 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-brand-100)]">
            <Sparkles className="h-3.5 w-3.5" />
            Atualizado agora
          </span>
        </motion.div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <motion.div
            variants={cardStagger}
            initial="hidden"
            animate="show"
            custom={1}
            className="rounded-2xl border border-[var(--border)] bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--color-brand-900)]">Fluxo seguro de denúncia</p>
              <span className="rounded-full bg-[var(--color-success-50)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-success-700)]">
                ISO 37002
              </span>
            </div>
            <ol className="space-y-2 text-xs text-[var(--muted-foreground)]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-brand-700)]" />
                Registro anônimo com protocolo seguro
              </li>
              <li className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5 text-[var(--color-warning-700)]" />
                Triagem e análise por status rastreável
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success-700)]" />
                Conclusão com histórico auditável
              </li>
            </ol>
          </motion.div>

          <motion.div
            variants={cardStagger}
            initial="hidden"
            animate="show"
            custom={2}
            className="rounded-2xl border border-[var(--border)] bg-white p-4"
          >
            <p className="mb-3 text-sm font-semibold text-[var(--color-brand-900)]">Status operacional</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-[var(--color-warning-500)]/25 bg-[var(--color-warning-50)] p-2 text-center">
                <p className="text-[11px] font-semibold text-[var(--color-warning-700)]">Triagem</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">inicial</p>
              </div>
              <div className="rounded-xl border border-[var(--color-info-500)]/25 bg-[var(--color-info-50)] p-2 text-center">
                <p className="text-[11px] font-semibold text-[var(--color-info-700)]">Em análise</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">comitê</p>
              </div>
              <div className="rounded-xl border border-[var(--color-success-500)]/25 bg-[var(--color-success-50)] p-2 text-center">
                <p className="text-[11px] font-semibold text-[var(--color-success-700)]">Concluída</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">resolvida</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] px-3 py-2 text-[11px] text-[var(--color-brand-700)]">
              <span className="mr-1 inline-flex align-middle">
                <CircleAlert className="h-3.5 w-3.5" />
              </span>
              Indicadores em tempo real para decisões rápidas e seguras.
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
