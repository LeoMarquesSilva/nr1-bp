import { motion } from 'motion/react'
import { Shield, FileCheck, Scale, ArrowRight, MessageSquarePlus, BarChart3, Filter, GraduationCap } from 'lucide-react'
import { HeroSection } from './landing/hero/HeroSection'

type Props = {
  onFazerRelato: () => void
}

export function LandingPage({ onFazerRelato }: Props) {
  return (
    <div className="min-h-screen">
      <HeroSection onFazerRelato={onFazerRelato} />

      {/* Features - 3 cards (design hero: slate + violet destaque) */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Por que usar nossa plataforma
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
            Ferramentas integradas para RH e compliance: canal de relatos, diagnóstico psicossocial e conformidade legal.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                Icon: MessageSquarePlus,
                title: 'Canal de relatos acessível',
                desc: 'Receba relatos anônimos ou identificados. Acesso facilitado via celular e QR Code, sem necessidade de e-mail corporativo para promover inclusão digital.',
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
            ].map(({ Icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="flex flex-col rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Canal de relatos (hero: slate escuro + CTA branco) */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center shadow-2xl shadow-slate-900/20 sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
          <div className="relative">
            <Shield className="mx-auto h-12 w-12 text-white/90" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Fazer relato ou nova denúncia
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-300">
              Encontre sua organização, envie um relato de forma anônima ou acompanhe o andamento pelo código de protocolo.
            </p>
            <button
              type="button"
              onClick={onFazerRelato}
              className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Acessar canal de relatos
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Diagnóstico — apenas via link enviado pela empresa */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 pb-20 sm:px-6 sm:pb-28"
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <FileCheck className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Diagnóstico HSE-IT</h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Saúde e bem-estar no trabalho · 35 perguntas · 7 dimensões. Disponibilizado mediante link enviado pela sua empresa após cadastro e contratação dos serviços.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
