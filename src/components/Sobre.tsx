import { motion } from 'motion/react'
import { Info, Shield, Clock, BarChart3 } from 'lucide-react'
import { getAppName } from '../lib/tenant'

const DIMENSOES = [
  { id: 'demandas', label: 'Demandas', desc: 'Exigências, prazos e intensidade do trabalho.' },
  { id: 'controle', label: 'Controle', desc: 'Autonomia, flexibilidade e participação nas decisões.' },
  { id: 'apoio_chefia', label: 'Apoio da chefia', desc: 'Suporte, confiança e incentivo da liderança.' },
  { id: 'apoio_colega', label: 'Apoio dos colegas', desc: 'Relação e suporte entre pares.' },
  { id: 'relacionamentos', label: 'Relacionamentos', desc: 'Clima e tratamento interpessoal no trabalho.' },
  { id: 'cargo_papel', label: 'Cargo / Papel', desc: 'Clareza de funções e expectativas.' },
  { id: 'comunicacao_mudancas', label: 'Comunicação e mudanças', desc: 'Informação e transparência em mudanças organizacionais.' },
]

interface SobreProps {
  onVoltar: () => void
}

export function Sobre({ onVoltar }: SobreProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-10"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--escritorio-escuro)] sm:text-3xl">
          Sobre o diagnóstico
        </h2>
        <p className="mt-3 text-[var(--escritorio-escuro)]/80">
          Avaliação psicossocial baseada no instrumento HSE-IT, utilizada para mapear o bem-estar e os fatores de risco no ambiente de trabalho.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-card-escritorio flex gap-4 rounded-2xl p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--escritorio-dourado-light)] text-[var(--escritorio-dourado)]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--escritorio-escuro)]">Tempo estimado</h3>
            <p className="mt-1 text-sm text-[var(--escritorio-escuro)]/70">Cerca de 5 a 10 minutos para responder às 35 perguntas.</p>
          </div>
        </div>
        <div className="bg-card-escritorio flex gap-4 rounded-2xl p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--escritorio-dourado-light)] text-[var(--escritorio-dourado)]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--escritorio-escuro)]">Confidencialidade</h3>
            <p className="mt-1 text-sm text-[var(--escritorio-escuro)]/70">Suas respostas são anônimas; apenas setores são identificados para análise agregada.</p>
          </div>
        </div>
      </div>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--escritorio-escuro)]">
          <BarChart3 className="h-5 w-5 text-[var(--escritorio-dourado)]" />
          As 7 dimensões avaliadas
        </h3>
        <ul className="space-y-3">
          {DIMENSOES.map((d) => (
            <li key={d.id} className="bg-card-escritorio rounded-xl border border-[rgba(16,31,46,0.06)] p-4">
              <span className="font-medium text-[var(--escritorio-escuro)]">{d.label}</span>
              <p className="mt-1 text-sm text-[var(--escritorio-escuro)]/70">{d.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-card-escritorio rounded-2xl border border-[rgba(16,31,46,0.06)] p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-[var(--escritorio-escuro)]">
          <Info className="h-5 w-5 text-[var(--escritorio-dourado)]" />
          {getAppName()}
        </h3>
        <p className="text-sm leading-relaxed text-[var(--escritorio-escuro)]/80">
          Este diagnóstico faz parte do compromisso da organização com a saúde e o bem-estar de seus colaboradores. Os resultados são utilizados de forma agregada para orientar ações internas e melhorias no ambiente de trabalho, sem identificação individual.
        </p>
      </section>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onVoltar}
          className="btn-escritorio px-6 py-3 text-sm font-medium"
        >
          Voltar ao início
        </button>
      </div>
    </motion.div>
  )
}
