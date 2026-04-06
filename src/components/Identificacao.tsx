import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Shield, Clock, FileCheck, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { SETORES } from '../data/opcoes'
import { getTenantSetores } from '../services/api'
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
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-2xl landing-premium-bg px-6 py-10 shadow-[var(--shadow-md)] sm:px-10 sm:py-14"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative">
          <motion.p
            variants={item}
            className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-100)]"
          >
            Sua opinião é importante para melhorar o bem-estar no trabalho.
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
          >
            Avaliação sobre saúde e bem-estar no trabalho
          </motion.h1>
          <motion.div variants={item} className="mt-4 max-w-2xl space-y-3 text-base text-[var(--color-brand-100)] sm:text-lg">
            <p>Esta pesquisa quer entender como está o seu dia a dia no trabalho.</p>
            <p>
              Suas respostas são anônimas e confidenciais e serão usadas apenas para identificar melhorias no ambiente de trabalho.
            </p>
            <p>
              Não existem respostas certas ou erradas. Responda com sinceridade, considerando sua experiência na empresa.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.div variants={item} className="bg-card-escritorio rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          <span className="rounded-full bg-[var(--color-brand-100)] px-2.5 py-0.5 text-[var(--color-brand-700)]">Passo 1</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Identifique seu setor</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--color-brand-900)] sm:text-2xl">
          Bem-vindo à Pesquisa sobre o Ambiente de Trabalho.
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Antes de começar, selecione o setor onde você trabalha. Essa informação ajuda a entender como está o ambiente de trabalho em cada área da empresa.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="setor" className="mb-2 block text-sm font-semibold text-[var(--color-brand-900)]">
              Setor
            </label>
            <select
              id="setor"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              required
              className="input-escritorio w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 text-[var(--color-brand-900)] transition focus:border-[var(--color-brand-300)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">Selecione o setor</option>
              {opcoesSetor.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="default"
            disabled={!setor}
            className="flex h-12 w-full min-w-[220px] items-center justify-center gap-2 rounded-[var(--radius-pill)] px-8 sm:w-auto"
          >
            Iniciar formulário
            <ArrowRight className="h-5 w-5" />
          </Button>
        </form>
      </motion.div>

      <motion.div variants={container} className="grid gap-4 sm:grid-cols-3">
        {[
          { Icon: Shield, title: 'Confidencial', desc: 'Ninguém saberá o que você respondeu.' },
          { Icon: FileCheck, title: '35 perguntas', desc: 'Perguntas sobre seu dia a dia no trabalho.' },
          { Icon: Clock, title: 'Tempo de resposta', desc: 'Cerca de 3 a 5 minutos.' },
        ].map(({ Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={item}
            whileHover={{ y: -2 }}
            className="bg-card-escritorio flex gap-4 rounded-xl border border-[var(--border)] p-4 transition-shadow hover:shadow-[var(--shadow-sm)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-brand-900)]">{title}</p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
