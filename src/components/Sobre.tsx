import { useState } from 'react'
import { motion } from 'motion/react'
import { Shield, Clock, ClipboardList, BarChart3, MessageSquareWarning, Building2 } from 'lucide-react'
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

type SobreTab = 'confiara' | 'canal' | 'diagnostico'

export function Sobre({ onVoltar }: SobreProps) {
  const [activeTab, setActiveTab] = useState<SobreTab>('confiara')

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
        title="Painel sobre"
        subtitle={
          <div className="mx-auto flex w-full max-w-3xl flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('confiara')}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'confiara'
                  ? 'border-[var(--color-brand-700)] bg-[var(--color-brand-700)] text-white'
                  : 'border-[var(--border)] bg-white text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Confiara
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('canal')}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'canal'
                  ? 'border-[var(--color-brand-700)] bg-[var(--color-brand-700)] text-white'
                  : 'border-[var(--border)] bg-white text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]'
              }`}
            >
              <MessageSquareWarning className="h-4 w-4" />
              Canal de denúncias
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('diagnostico')}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'diagnostico'
                  ? 'border-[var(--color-brand-700)] bg-[var(--color-brand-700)] text-white'
                  : 'border-[var(--border)] bg-white text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Diagnóstico de riscos psicossociais
            </button>
          </div>
        }
      >
        {activeTab === 'confiara' && (
          <>
            <PageShellCard>
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-brand-900)]">Conceito</h2>
              <div className="space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                <p>
                  O nome <strong className="text-[var(--color-brand-900)]">Confiara</strong> deriva do verbo confiar no pretérito mais-que-perfeito,
                  representando a confiança que deveria existir nas relações de trabalho, mas que, na prática, muitas vezes está fragilizada ou ausente.
                </p>
                <p>
                  Parte-se de uma premissa central: a ausência de confiança no ambiente de trabalho não representa apenas um aspecto cultural, mas um
                  relevante indicativo de risco organizacional, capaz de se refletir em conflitos internos, afastamentos, queda de produtividade e
                  engajamento, além da ampliação da exposição a passivos trabalhistas.
                </p>
                <p>
                  Nesse contexto, o Confiara integra diagnóstico estruturado de riscos psicossociais e canal de denúncias com gestão e controle das
                  informações, permitindo transformar a confiança em elemento mensurável e gerenciável, com foco na prevenção, no fortalecimento da
                  governança interna e na aderência às diretrizes da NR-1.
                </p>
              </div>
            </PageShellCard>

            <PageShellCard>
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-brand-900)]">Foco</h2>
              <div className="space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                <p>
                  O diagnóstico de riscos psicossociais e o canal de denúncias integram o compromisso da organização com a promoção da saúde mental e do
                  bem-estar no ambiente de trabalho.
                </p>
                <p>
                  As informações obtidas são tratadas de forma agregada e não individualizada, sendo utilizadas para orientar ações internas e aprimorar as
                  condições organizacionais, com preservação da confidencialidade.
                </p>
              </div>
            </PageShellCard>
          </>
        )}

        {activeTab === 'diagnostico' && (
          <>
            <PageShellCard>
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-brand-900)]">Como funciona a pesquisa?</h2>
              <div className="space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                <p>Esta pesquisa avalia como os colaboradores percebem o ambiente de trabalho e o bem-estar no dia a dia.</p>
                <p>
                  As perguntas são baseadas no modelo internacional de gestão de riscos psicossociais desenvolvido pelo Health and Safety Executive (HSE),
                  utilizado em diversos países para avaliar fatores que podem impactar a saúde e o bem-estar no trabalho.
                </p>
              </div>
            </PageShellCard>

            <div className="grid gap-5 sm:grid-cols-3">
              <PageShellCard padding="sm" className="flex h-full flex-col items-center text-center">
                <div className="brand-icon-tile h-12 w-12 rounded-2xl">
                  <Clock className="h-6 w-6" aria-hidden />
                </div>
                <h2 className="mt-4 text-balance text-base font-semibold leading-snug text-[var(--color-brand-900)]">Tempo estimado de resposta</h2>
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
                <h2 className="mt-4 text-balance text-base font-semibold leading-snug text-[var(--color-brand-900)]">Metodologia</h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                  HSE-IT (São 35 perguntas sobre 7 dimensões / aspectos do trabalho).
                </p>
              </PageShellCard>
            </div>

            <p className="text-center text-[var(--muted-foreground)]">
              A análise desses fatores ajuda a empresa a identificar oportunidades de melhoria no ambiente de trabalho e promover o bem-estar dos
              colaboradores.
            </p>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-brand-900)]">
                <BarChart3 className="h-5 w-5 text-[var(--color-brand-600)]" aria-hidden />
                São as 7 dimensões avaliadas
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
          </>
        )}

        {activeTab === 'canal' && (
          <>
            <PageShellCard>
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-brand-900)]">Como funciona o canal?</h2>
              <div className="space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                <p>
                  O canal de denúncias permite que colaboradores registrem relatos relacionados ao ambiente de trabalho de forma segura e acessível.
                </p>
                <p>
                  As comunicações podem envolver situações como conflitos internos, condutas inadequadas, assédio moral ou sexual, além de outros fatores
                  que impactem o ambiente organizacional.
                </p>
              </div>
            </PageShellCard>

            <PageShellCard>
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-brand-900)]">Estabilidade organizacional e segurança jurídica</h2>
              <div className="space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                <p>
                  Ao disponibilizar um canal seguro e confidencial, a organização fortalece a confiança dos colaboradores e amplia sua capacidade de
                  identificar, de forma antecipada, situações de risco no ambiente de trabalho.
                </p>
                <p>
                  Esse mecanismo contribui para a prevenção de conflitos, o aprimoramento das condições organizacionais e a mitigação da exposição jurídica.
                </p>
              </div>
            </PageShellCard>

            <div className="grid gap-4 sm:grid-cols-3">
              <PageShellCard padding="sm">
                <h3 className="text-base font-semibold text-[var(--color-brand-900)]">Acesso</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  O canal pode ser acessado de forma simples por meio de link ou QR Code, permitindo o envio de relatos a qualquer momento.
                </p>
              </PageShellCard>
              <PageShellCard padding="sm">
                <h3 className="text-base font-semibold text-[var(--color-brand-900)]">Confidencialidade</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  As denúncias podem ser realizadas de forma anônima ou, se o empregado preferir, com sua identificação. As informações são tratadas com
                  confidencialidade, garantindo a proteção do colaborador.
                </p>
              </PageShellCard>
              <PageShellCard padding="sm">
                <h3 className="text-base font-semibold text-[var(--color-brand-900)]">Gestão do canal</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Os relatos são recebidos, organizados e encaminhados à empresa de forma estruturada e célere, possibilitando o adequado direcionamento
                  interno das demandas. A condução das apurações e a adoção de medidas cabíveis são de responsabilidade exclusiva da organização.
                </p>
              </PageShellCard>
            </div>
          </>
        )}
      </PageShell>
    </motion.div>
  )
}
