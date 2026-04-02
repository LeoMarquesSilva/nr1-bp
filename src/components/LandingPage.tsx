import { motion } from 'motion/react'
import {
  Shield,
  ArrowRight,
  MessageSquarePlus,
  BarChart3,
  MessageSquareWarning,
  Gavel,
} from 'lucide-react'
import { HeroSection } from './landing/hero/HeroSection'

type Props = {
  onFazerRelato: () => void
}

const sectionMotion = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.45 },
}

const solutionGroups = [
  {
    Icon: MessageSquarePlus,
    title: 'Canal de denúncias',
    items: [
      {
        title: 'Canal acessível e confidencial',
        desc: 'Recebimento de denúncias anônimas, com acesso facilitado via celular e QR Code.',
      },
      {
        title: 'Triagem inteligente',
        desc: 'Organização das denúncias conforme natureza e nível de criticidade, facilitando a visualização e o direcionamento interno pela empresa.',
      },
      {
        title: 'Gestão estruturada das denúncias',
        desc: 'Recebimento, registro e organização das denúncias, com encaminhamento estruturado à empresa para adoção das providências cabíveis.',
      },
    ],
  },
  {
    Icon: BarChart3,
    title: 'Diagnóstico de riscos psicossociais',
    items: [
      {
        title: 'Identificação de fatores de riscos',
        desc: 'Mapeamento de aspectos do ambiente de trabalho que podem impactar a saúde dos colaboradores e a exposição jurídica da empresa.',
      },
      {
        title: 'Análise por setor',
        desc: 'Identificação dos setores mais expostos e dos principais fatores de risco organizacionais.',
      },
      {
        title: 'Plano de ação',
        desc: 'Indicação de medidas preventivas, fundamentadas nos dados coletados, voltadas à adequação normativa e à mitigação de riscos.',
      },
    ],
  },
  {
    Icon: Gavel,
    title: 'Vantagens',
    items: [
      {
        title: 'Prevenção',
        desc: 'Atuação antecipada para evitar passivos trabalhistas e exposições jurídicas.',
      },
      {
        title: 'Economia',
        desc: 'Diminuição de impactos financeiros decorrentes de afastamentos, multas, ações judiciais e tributos.',
      },
      {
        title: 'Sustentabilidade organizacional',
        desc: 'Ambiente de trabalho mais estruturado, com ganhos de eficiência, produtividade e qualidade na gestão interna.',
      },
    ],
  },
]

const pilares = [
  {
    Icon: MessageSquareWarning,
    title: 'Canal de denúncias',
    desc: 'Gestão de denúncias com confidencialidade e segurança jurídica.',
  },
  {
    Icon: BarChart3,
    title: 'Diagnóstico de riscos psicossociais',
    desc: 'Análise de fatores que impactam o ambiente de trabalho para orientar decisões e ações preventivas.',
  },
  {
    Icon: Gavel,
    title: 'Segurança jurídica',
    desc: 'Plataforma para prevenir riscos e proteger a empresa.',
  },
]

export function LandingPage({ onFazerRelato }: Props) {
  return (
    <div className="min-h-screen">
      {/* 1 — Azul: hero */}
      <HeroSection onFazerRelato={onFazerRelato} />

      {/* 2 — Branco: normas e confiança (conteúdo vindo do hero) */}
      <motion.section
        {...sectionMotion}
        className="border-t border-[var(--border)] bg-white px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-900)] sm:text-3xl">
            Confiança estruturada com segurança jurídica.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted-foreground)]">
            A Confiara contribui para a identificação dos riscos psicossociais, organização de denúncias e redução da exposição jurídica da sua empresa.
          </p>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-[var(--color-brand-600)]">
            <Shield className="h-4 w-4 shrink-0" aria-hidden />
            Em conformidade com a atualização da NR-1, vigente a partir de maio/2026.
          </p>
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="border-t border-[var(--border)] bg-[var(--color-brand-50)] px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--color-brand-200)] bg-gradient-to-b from-white to-[var(--color-brand-50)] p-6 shadow-[var(--shadow-sm)] sm:p-10">
          <div className="mb-4 inline-flex items-center rounded-full border border-[var(--color-brand-200)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-brand-700)]">
            Confiança organizacional
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-900)] sm:text-3xl">Por que Confiara?</h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            O nome <strong className="text-[var(--color-brand-900)]">Confiara</strong> deriva do verbo confiar no pretérito
            mais-que-perfeito, representando a confiança que deveria existir nas relações de trabalho, mas que, na prática, muitas
            vezes está fragilizada ou ausente.
          </p>
          <div className="mt-5 rounded-2xl border border-[var(--color-brand-200)] bg-white/80 p-4 sm:p-5">
            <p className="text-sm leading-relaxed text-[var(--color-brand-800)] sm:text-base">
              O Confiara transforma essa lacuna em gestão estruturada, integrando diagnóstico psicossocial e canal de denúncias
              para identificar riscos, gerar evidências e fortalecer a segurança jurídica da empresa.
            </p>
          </div>
        </div>
      </motion.section>

      {/* 3 — Azul: três pilares */}
      <motion.section
        {...sectionMotion}
        className="border-t border-white/10 landing-premium-bg px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Três frentes integradas
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--color-brand-100)]">
            Uma plataforma integrada de escuta estruturada, diagnóstico de riscos psicossociais e gestão com segurança jurídica.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {pilares.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-brand-100)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 4 — Branco: funcionalidades detalhadas */}
      <motion.section
        {...sectionMotion}
        id="plataforma-funcionalidades"
        className="scroll-mt-24 border-t border-[var(--border)] bg-white px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--color-brand-900)] sm:text-3xl">
            Por que usar nossa plataforma
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-[var(--muted-foreground)] sm:text-lg">
            Estrutura segura, confiável, anônima e auditável, orientada à prevenção de riscos e ao fortalecimento da governança corporativa.
          </p>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {solutionGroups.map(({ Icon, title, items }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--color-brand-50)]/50 p-6 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-brand-900)]">{title}</h3>
                </div>
                <div className="mt-5 space-y-4">
                  {items.map((item) => (
                    <div key={item.title} className="rounded-xl border border-[var(--border)] bg-white/70 p-4">
                      <p className="text-base font-semibold text-[var(--color-brand-900)]">{item.title}</p>
                      <p className="mt-1 text-base leading-relaxed text-[var(--muted-foreground)]">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 5 — Azul: CTA canal */}
      <motion.section
        {...sectionMotion}
        className="border-t border-white/10 landing-premium-bg px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-3xl text-center">
          <Shield className="mx-auto h-12 w-12 text-white/90" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">Nova denúncia</h2>
          <p className="mx-auto mt-3 max-w-lg text-[var(--color-brand-100)]">
            Encontre sua organização, envie uma denúncia e acompanhe o andamento através do código de protocolo.
          </p>
          <button
            type="button"
            onClick={onFazerRelato}
            className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--color-brand-cream)] px-8 py-3.5 text-base font-semibold text-[var(--color-brand-900)] shadow-[var(--shadow-sm)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-brand-900)]"
          >
            Acesse o canal e faça sua denúncia.
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </motion.section>

    </div>
  )
}
