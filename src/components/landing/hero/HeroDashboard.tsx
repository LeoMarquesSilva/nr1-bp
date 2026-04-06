import { useState } from 'react'
import { motion } from 'motion/react'
import { ShieldCheck, Clock3, CheckCircle2, ClipboardCheck, ChevronRight, MousePointerClick } from 'lucide-react'
import { DimensionChart } from './DimensionChart'

const cardStagger = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08 },
  }),
}

export function HeroDashboard() {
  const [activeTab, setActiveTab] = useState<'tab01' | 'tab02'>('tab01')

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
          className="mb-4 rounded-2xl border border-white/20 bg-[var(--color-brand-900)]/55 p-2"
        >
          <p className="px-2 pb-2 text-xs font-medium text-[var(--color-brand-200)]">
            Clique para alternar as informações
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('tab01')}
              aria-pressed={activeTab === 'tab01'}
              className={`rounded-xl px-3 py-2 text-left transition ${
                activeTab === 'tab01'
                  ? 'bg-white text-[var(--color-brand-900)] shadow-[var(--shadow-xs)]'
                  : 'bg-transparent text-[var(--color-brand-100)] hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Canal de denúncia</p>
                {activeTab === 'tab01' ? (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                ) : (
                  <MousePointerClick className="h-4 w-4 shrink-0" />
                )}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tab02')}
              aria-pressed={activeTab === 'tab02'}
              className={`rounded-xl px-3 py-2 text-left transition ${
                activeTab === 'tab02'
                  ? 'bg-white text-[var(--color-brand-900)] shadow-[var(--shadow-xs)]'
                  : 'bg-transparent text-[var(--color-brand-100)] hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Diagnóstico de riscos psicossociais</p>
                {activeTab === 'tab02' ? (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                ) : (
                  <MousePointerClick className="h-4 w-4 shrink-0" />
                )}
              </div>
            </button>
          </div>
        </motion.div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          {activeTab === 'tab01' ? (
            <>
              <motion.div
                variants={cardStagger}
                initial="hidden"
                animate="show"
                custom={1}
                className="rounded-2xl border border-[var(--border)] bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--color-brand-900)]">Canal de denúncia</p>
                  <span className="rounded-full bg-[var(--color-success-50)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-success-700)]">
                    ISO 37002
                  </span>
                </div>
                <ol className="space-y-2 text-xs text-[var(--muted-foreground)]">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-brand-700)]" />
                    Registro anônimo
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5 text-[var(--color-warning-700)]" />
                    Acompanhamento seguro por número de protocolo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success-700)]" />
                    100% auditável
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
                    <p className="text-[10px] text-[var(--muted-foreground)]">Análise inicial</p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-info-500)]/25 bg-[var(--color-info-50)] p-2 text-center">
                    <p className="text-[11px] font-semibold text-[var(--color-info-700)]">Em análise</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Investigação em andamento</p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-success-500)]/25 bg-[var(--color-success-50)] p-2 text-center">
                    <p className="text-[11px] font-semibold text-[var(--color-success-700)]">Concluída</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Investigação finalizada</p>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              variants={cardStagger}
              initial="hidden"
              animate="show"
              custom={1}
              className="rounded-2xl border border-[var(--border)] bg-white p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-[var(--color-brand-700)]" />
                <p className="text-base font-semibold text-[var(--color-brand-900)]">Diagnóstico de riscos psicossociais</p>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Exemplo de informações que o diagnóstico entrega para apoiar decisões preventivas:
              </p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Médias por dimensão
                  </p>
                  <DimensionChart />
                </div>
                <div className="rounded-xl border border-[var(--color-success-500)]/25 bg-[var(--color-success-50)] p-3">
                  <p className="text-sm font-semibold text-[var(--color-success-700)]">Resumo executivo</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Indicação dos setores e temas críticos, e recomendação do plano de ação.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
