import { motion } from 'motion/react'
import { ClipboardCheck, Building2, MessageSquareWarning, Lock } from 'lucide-react'
import { DimensionChart } from './DimensionChart'
import { MetricCard } from './MetricCard'

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
        className="hero-dashboard-card rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-sm transition-transform duration-700"
        role="region"
        aria-label="Preview do painel: resultado por dimensão e métricas"
      >
        {/* Card principal — Resultado por Dimensão */}
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="show"
          custom={0}
          className="rounded-2xl border border-slate-100 bg-white p-5"
        >
          <h3 className="text-sm font-semibold text-slate-700">Resultado por Dimensão</h3>
          <p className="text-xs text-slate-400">Última avaliação · 847 respostas</p>
          <div className="mt-3">
            <DimensionChart />
          </div>
        </motion.div>

        {/* Grid 2x2 — mini cards */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <motion.div
            variants={cardStagger}
            initial="hidden"
            animate="show"
            custom={1}
          >
            <MetricCard
              icon={ClipboardCheck}
              iconBgClass="bg-emerald-50"
              iconColorClass="text-emerald-500"
              value="847"
              label="respostas coletadas"
              sparkline
            />
          </motion.div>
          <motion.div
            variants={cardStagger}
            initial="hidden"
            animate="show"
            custom={2}
          >
            <MetricCard
              icon={Building2}
              iconBgClass="bg-violet-50"
              iconColorClass="text-violet-500"
              value="12"
              label="setores avaliados"
            />
          </motion.div>
          <motion.div
            variants={cardStagger}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <MetricCard
              icon={MessageSquareWarning}
              iconBgClass="bg-amber-50"
              iconColorClass="text-amber-500"
              value="23"
              label="relatos recebidos"
              badge="5 em análise"
            />
          </motion.div>
          <motion.div
            variants={cardStagger}
            initial="hidden"
            animate="show"
            custom={4}
          >
            <MetricCard
              icon={Lock}
              iconBgClass="bg-slate-100"
              iconColorClass="text-slate-500"
              value="WB-7X8K2M9P"
              label="último protocolo gerado"
              valueClassName="text-sm font-mono font-bold tracking-widest text-slate-700"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
