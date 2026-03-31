import { motion } from 'motion/react'
import {
  Shield,
  FileCheck,
  Scale,
  ArrowRight,
  MessageSquarePlus,
  BarChart3,
  Filter,
  GraduationCap,
  MessageSquareWarning,
  ClipboardCheck,
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

const features = [
  {
    Icon: MessageSquarePlus,
    title: 'Canal de denúncia acessível',
    desc: 'Receba denúncias com opção de anonimato ou identificação. Acesso facilitado via celular e QR Code.',
  },
  {
    Icon: Filter,
    title: 'Triagem inteligente',
    desc: 'Separe denúncias sérias de dúvidas ou reclamações, organizando as demandas e evitando a sobrecarga da equipe de RH.',
  },
  {
    Icon: FileCheck,
    title: 'Gestão de evidências e políticas',
    desc: 'Distribua o Código de Conduta e registre o "Li e Aceito" dos colaboradores, garantindo a comprovação em auditorias exigida pela NR-1.',
  },
  {
    Icon: GraduationCap,
    title: 'Treinamento e conscientização',
    desc: 'Apoio educativo e capacitação de lideranças e colaboradores para garantir a adequação completa à Lei 14.457/22.',
  },
  {
    Icon: BarChart3,
    title: 'Diagnóstico HSE-IT',
    desc: 'Avalie as condições psicossociais da organização em 7 dimensões. 35 perguntas validadas para mapear demandas, controle, apoio e clima.',
  },
  {
    Icon: Scale,
    title: 'Conformidade legal',
    desc: 'Adequação à NR-1 (riscos psicossociais), Lei 14.457/22, LGPD e boas práticas de compliance. Criptografia, não retaliação e comitê de ética.',
  },
]

const pilares = [
  {
    Icon: MessageSquareWarning,
    title: 'Canal de denúncias',
    desc: 'Recepção segura, triagem e trilha de auditoria para o comitê e o RH.',
  },
  {
    Icon: BarChart3,
    title: 'Diagnóstico psicossocial',
    desc: 'HSE-IT em 7 dimensões para apoiar decisões e ações preventivas.',
  },
  {
    Icon: Gavel,
    title: 'Marco legal',
    desc: 'Fluxos e registros alinhados à NR-1, Lei 14.457/22 e boas práticas de compliance.',
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
            Conformidade e confiança
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted-foreground)]">
            A plataforma estrutura a escuta organizacional e o diagnóstico psicossocial para apoiar decisões preventivas de RH e compliance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {['NR-1', 'Lei 14.457/22', 'ISO 37002', 'Gestão de políticas'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-800)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-8 text-left text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-center">
            O <strong className="text-[var(--color-brand-900)]">diagnóstico psicossocial (HSE-IT)</strong> é disponibilizado
            mediante link enviado pela sua empresa após cadastro e contratação dos serviços. Se você recebeu o link, acesse-o
            diretamente para responder.
          </p>
          <p className="mt-4 text-left text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-center">
            Os resultados consolidados contribuem para priorização de ações no GRO/PGR e para demonstrar diligência na gestão da
            organização do trabalho, em linha com a NR-1.
          </p>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-brand-600)]">
            <Shield className="h-4 w-4 shrink-0" aria-hidden />
            Apoia a gestão preventiva exigida pela NR-1
          </p>
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="border-t border-[var(--border)] bg-[var(--color-brand-50)] px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-4xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-xs)] sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-900)] sm:text-3xl">
            Por que Confiara?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            O nome <strong className="text-[var(--color-brand-900)]">Confiara</strong> deriva do verbo confiar no pretérito
            mais-que-perfeito: a confiança que deveria estar presente nas relações de trabalho, mas que muitas vezes se encontra
            fragilizada.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            A plataforma transforma esse desafio em gestão prática ao integrar diagnóstico psicossocial e canal de denúncias para
            reconhecer, estruturar e reconstruir a confiança de forma consciente, técnica e preventiva.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            Na prática, o Confiara permite identificar sinais de risco organizacional mais cedo, priorizar medidas proporcionais e
            monitorar evolução com base em evidências.
          </p>
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
            Um fluxo único para escuta, diagnóstico e demonstração de conformidade.
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
          <p className="mx-auto mt-3 max-w-xl text-center text-[var(--muted-foreground)]">
            Ferramentas integradas para RH e compliance: canal de denúncia, diagnóstico psicossocial e conformidade legal.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--color-brand-50)]/50 p-6 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-sm)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--color-brand-900)]">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{desc}</p>
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
            Encontre sua organização, envie uma denúncia ou acompanhe o andamento pelo código de protocolo.
          </p>
          <button
            type="button"
            onClick={onFazerRelato}
            className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--color-brand-cream)] px-8 py-3.5 text-base font-semibold text-[var(--color-brand-900)] shadow-[var(--shadow-sm)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-brand-900)]"
          >
            Acessar canal de denúncia
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </motion.section>

      {/* 6 — Claro: diagnóstico HSE-IT */}
      <motion.section
        {...sectionMotion}
        className="border-t border-[var(--border)] bg-[var(--color-brand-50)] px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20"
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-xs)] sm:p-10">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                <ClipboardCheck className="h-7 w-7" aria-hidden />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-[var(--color-brand-900)]">Diagnóstico HSE-IT</h3>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  Saúde e bem-estar no trabalho · 35 perguntas · 7 dimensões. Disponibilizado mediante link enviado pela sua
                  empresa após cadastro e contratação dos serviços.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
