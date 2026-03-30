import { motion } from 'motion/react'
import { Info, Shield, Clock, ClipboardList, BarChart3 } from 'lucide-react'
import { getAppName } from '../lib/tenant'
import { PageShell, PageShellCard } from './layout/PageShell'

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
    >
      <PageShell
        onBack={onVoltar}
        backLabel="Voltar ao início"
        maxWidth="wide"
        title="Como funciona a pesquisa?"
        subtitle={
          <div className="space-y-3 text-left sm:text-center">
            <p>
              O diagnóstico de clima e fatores psicossociais avalia como os colaboradores percebem o ambiente de trabalho e o bem-estar no dia a dia.
            </p>
            <p>
              As perguntas seguem o modelo internacional de gestão de riscos psicossociais do Health and Safety Executive (HSE), usado em diversos países para
              mapear fatores que podem impactar saúde e bem-estar no trabalho.
            </p>
          </div>
        }
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <PageShellCard padding="sm" className="flex h-full flex-col items-center text-center">
            <div className="brand-icon-tile h-12 w-12 rounded-2xl">
              <Clock className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="mt-4 text-balance text-base font-semibold leading-snug text-[var(--color-brand-900)]">
              Tempo estimado de resposta
            </h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">Cerca de 2 a 5 minutos.</p>
          </PageShellCard>
          <PageShellCard padding="sm" className="flex h-full flex-col items-center text-center">
            <div className="brand-icon-tile h-12 w-12 rounded-2xl">
              <Shield className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="mt-4 text-balance text-base font-semibold leading-snug text-[var(--color-brand-900)]">Confidencialidade</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
              As respostas são anônimas. Os resultados são analisados por setor, sem identificar quem respondeu.
            </p>
          </PageShellCard>
          <PageShellCard padding="sm" className="flex h-full flex-col items-center text-center">
            <div className="brand-icon-tile h-12 w-12 rounded-2xl">
              <ClipboardList className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="mt-4 text-balance text-base font-semibold leading-snug text-[var(--color-brand-900)]">Método</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
              HSE-IT (35 perguntas sobre 7 dimensões / aspectos do trabalho).
            </p>
          </PageShellCard>
        </div>

        <p className="text-center text-[var(--muted-foreground)]">
          A análise desses fatores ajuda a empresa a identificar oportunidades de melhoria no ambiente de trabalho e promover o bem-estar dos colaboradores.
        </p>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-brand-900)]">
            <BarChart3 className="h-5 w-5 text-[var(--color-brand-600)]" aria-hidden />
            As 7 dimensões avaliadas
          </h2>
          <ul className="space-y-3">
            {DIMENSOES.map((d) => (
              <li key={d.id}>
                <PageShellCard padding="sm">
                  <span className="font-medium text-[var(--color-brand-900)]">{d.label}</span>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{d.desc}</p>
                </PageShellCard>
              </li>
            ))}
          </ul>
        </section>

        <PageShellCard>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--color-brand-900)]">
            <Info className="h-5 w-5 text-[var(--color-brand-600)]" aria-hidden />
            {getAppName()}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            Este diagnóstico integra o compromisso da organização com a saúde e o bem-estar de seus colaboradores. Os resultados são utilizados de forma
            agregada para orientar ações internas e melhorias no ambiente de trabalho, sem identificação individual.
          </p>
        </PageShellCard>

        <PageShellCard>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-brand-900)]">Conceito do Confiara</h2>
          <div className="space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <p>
              O nome <strong className="text-[var(--color-brand-900)]">Confiara</strong> deriva do verbo confiar no pretérito
              mais-que-perfeito, evocando a ideia de que a confiança ja deveria estar presente nas relações de trabalho, mas em
              muitos contextos encontra-se fragilizada ou ausente.
            </p>
            <p>
              Partimos de uma premissa central: a ausencia de confiança no ambiente de trabalho nao e apenas um problema cultural,
              mas um indicativo de risco organizacional que pode se refletir em conflitos, afastamentos e passivos trabalhistas.
            </p>
            <p>
              Por isso, o Confiara integra diagnóstico psicossocial estruturado e canal de denúncias com gestão e controle para
              transformar a confiança em elemento mensuravel e gerenciavel, fortalecendo a prevenção, a governança interna e o
              alinhamento com a NR-1.
            </p>
          </div>
        </PageShellCard>
      </PageShell>
    </motion.div>
  )
}
