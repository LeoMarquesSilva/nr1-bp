import { motion } from 'motion/react'
import { Info, Shield, Clock, ClipboardList, BarChart3 } from 'lucide-react'
import { getAppName } from '../lib/tenant'

const DIMENSOES = [
  {
    id: 'demandas',
    label: 'Demandas',
    desc: 'Avalia o volume de trabalho e a pressão por prazos. Envolve aspectos como quantidade de tarefas, ritmo de trabalho, prazos e intensidade das atividades no dia a dia.',
  },
  {
    id: 'controle',
    label: 'Controle',
    desc: 'Avalia o nível de autonomia que o trabalhador tem para realizar suas atividades. Trata-se da possibilidade de organizar o próprio trabalho, tomar decisões e participar de escolhas relacionadas às tarefas.',
  },
  {
    id: 'apoio_chefia',
    label: 'Apoio da chefia',
    desc: 'Avalia o suporte oferecido pela liderança. Inclui orientação, confiança, disponibilidade para ajudar, reconhecimento e incentivo da chefia.',
  },
  {
    id: 'apoio_colega',
    label: 'Apoio dos colegas',
    desc: 'Avalia o nível de cooperação entre os colegas de trabalho. Considera ajuda mútua, respeito, colaboração e disposição para apoiar uns aos outros.',
  },
  {
    id: 'relacionamentos',
    label: 'Relacionamentos',
    desc: 'Avalia como são as relações no ambiente de trabalho. Se refere a respeito, tratamento entre as pessoas, clima de convivência e possíveis conflitos no dia a dia.',
  },
  {
    id: 'cargo_papel',
    label: 'Cargo / Papel',
    desc: 'Avalia se o trabalhador tem clareza sobre suas responsabilidades e expectativas no trabalho. Inclui entendimento das tarefas, objetivos da função e responsabilidades dentro da equipe.',
  },
  {
    id: 'comunicacao_mudancas',
    label: 'Comunicação e mudanças',
    desc: 'Avalia como as mudanças no trabalho são comunicadas e conduzidas. Considera a forma como informações são compartilhadas, o preparo das equipes e o suporte durante mudanças organizacionais.',
  },
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
      className="mx-auto max-w-3xl space-y-10"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Como funciona a pesquisa?
        </h2>
        <p className="mt-4 text-left text-slate-600 sm:text-center">
          Esta pesquisa avalia como os colaboradores percebem o ambiente de trabalho e o bem-estar no dia a dia.
        </p>
        <p className="mt-3 text-left text-slate-600 sm:text-center">
          As perguntas são baseadas no modelo internacional de gestão de riscos psicossociais desenvolvido pelo Health and Safety Executive (HSE), utilizado em diversos países para avaliar fatores que podem impactar a saúde e o bem-estar no trabalho.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="bg-card-escritorio flex h-full flex-col items-center rounded-2xl border border-slate-200/60 px-5 py-6 text-center shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-balance text-base font-semibold leading-snug text-slate-900">
            Tempo estimado de resposta
          </h3>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-600">Cerca de 2 a 5 minutos.</p>
        </div>
        <div className="bg-card-escritorio flex h-full flex-col items-center rounded-2xl border border-slate-200/60 px-5 py-6 text-center shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-balance text-base font-semibold leading-snug text-slate-900">Confidencialidade</h3>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-600">
            As respostas são anônimas. Os resultados são analisados por setor, sem identificar quem respondeu.
          </p>
        </div>
        <div className="bg-card-escritorio flex h-full flex-col items-center rounded-2xl border border-slate-200/60 px-5 py-6 text-center shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-balance text-base font-semibold leading-snug text-slate-900">Método</h3>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-600">
            HSE-IT (São 35 perguntas sobre 7 dimensões / aspectos do trabalho).
          </p>
        </div>
      </div>

      <p className="text-center text-slate-600">
        A análise desses fatores ajuda a empresa a identificar oportunidades de melhoria no ambiente de trabalho e promover o bem-estar dos colaboradores.
      </p>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <BarChart3 className="h-5 w-5 text-violet-600" />
          São as 7 dimensões avaliadas
        </h3>
        <ul className="space-y-3">
          {DIMENSOES.map((d) => (
            <li key={d.id} className="bg-card-escritorio rounded-xl border border-slate-200/60 p-4">
              <span className="font-medium text-slate-900">{d.label}</span>
              <p className="mt-1 text-sm text-slate-600">{d.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
          <Info className="h-5 w-5 text-violet-600" />
          {getAppName()}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          Esta pesquisa faz parte do compromisso da organização com a saúde e o bem-estar de seus colaboradores. Os resultados são utilizados de forma agregada para orientar ações internas e melhorias no ambiente de trabalho, sem identificação individual.
        </p>
      </section>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onVoltar}
          className="btn-escritorio rounded-full px-6 py-3 text-sm font-medium"
        >
          Voltar ao início
        </button>
      </div>
    </motion.div>
  )
}
