import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Shield, Clock, FileCheck, ChevronRight } from 'lucide-react'
import { SETORES } from '../data/opcoes'
import { getTenantSetores } from '../types/submission'
import { getTenantId } from '../lib/tenant'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

type Props = {
  onIniciar: (setor: string) => void
}

export function Identificacao({ onIniciar }: Props) {
  const [setor, setSetor] = useState('')
  const [opcoesSetor, setOpcoesSetor] = useState<string[]>(SETORES as unknown as string[])

  useEffect(() => {
    getTenantSetores(getTenantId()).then((tenantSetores) => {
      setOpcoesSetor(tenantSetores.length > 0 ? tenantSetores : (SETORES as unknown as string[]))
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (setor) onIniciar(setor)
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 sm:space-y-10"
    >
      {/* Hero (design LP: slate-900 + texto branco) */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 shadow-xl shadow-slate-900/20 sm:px-10 sm:py-14"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
        <div className="relative">
          <motion.p
            variants={item}
            className="text-xs font-semibold uppercase tracking-widest text-violet-300"
          >
            Avaliação psicossocial
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem]"
          >
            Saúde e bem-estar no trabalho
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg"
          >
            O diagnóstico HSE-IT mapeia as condições psicossociais da sua organização em 7 dimensões. Respostas confidenciais e uso exclusivo para melhorias internas.
          </motion.p>
        </div>
      </motion.section>

      {/* Card principal: identificação (hero: card branco, bordas slate) */}
      <motion.div variants={item} className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-6 shadow-lg sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-violet-700">Passo 1</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Identificação</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Bem-vindo ao Diagnóstico HSE-IT
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Antes de começar, informe seu setor. Suas respostas são confidenciais e contribuem para o mapeamento psicossocial da empresa.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="setor" className="mb-2 block text-sm font-semibold text-slate-900">
              Setor
            </label>
            <select
              id="setor"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              required
              className="input-escritorio w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Selecione o setor</option>
              {opcoesSetor.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <motion.button
            type="submit"
            disabled={!setor}
            whileHover={{ scale: setor ? 1.02 : 1 }}
            whileTap={{ scale: setor ? 0.98 : 1 }}
            className="btn-escritorio flex w-full items-center justify-center gap-2 py-3.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px] sm:px-8"
          >
            Iniciar formulário
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </form>
      </motion.div>

      {/* Cards de contexto / confiança (hero: violet ícones, texto slate) */}
      <motion.div
        variants={container}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          { Icon: Shield, title: 'Confidencial', desc: 'Resultados restritos à equipe responsável' },
          { Icon: FileCheck, title: '35 perguntas', desc: '7 dimensões do estudo HSE-IT' },
          { Icon: Clock, title: '~5 a 10 min', desc: 'Tempo médio para responder' },
        ].map(({ Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={item}
            whileHover={{ y: -2 }}
            className="bg-card-escritorio flex gap-4 rounded-xl border border-slate-200/60 p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
