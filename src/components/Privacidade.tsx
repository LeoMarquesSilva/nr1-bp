import { motion } from 'motion/react'
import { Shield, Database, Lock, Eye, Users, KeyRound } from 'lucide-react'
import { PageShell, PageShellCard } from './layout/PageShell'

interface PrivacidadeProps {
  onVoltar: () => void
}

export function Privacidade({ onVoltar }: PrivacidadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <PageShell
        onBack={onVoltar}
        backLabel="Voltar ao início"
        maxWidth="medium"
        title="Privacidade e uso dos dados"
        subtitle={
          <p>
            Transparência sobre o que a plataforma coleta, como armazena e para que utiliza os dados — com destaque para o{' '}
            <strong>diagnóstico de clima (questionário HSE)</strong> e para o <strong>canal de denúncias</strong>, quando sua organização os utiliza.
          </p>
        }
      >
        {/*
          Ordem: transparência (o quê) → tratamento (agregado) → segurança técnica → onde ficam →
          finalidade → direitos do titular (LGPD).
        */}
        <section className="space-y-6">
          <PageShellCard className="flex gap-4">
            <div className="brand-icon-tile h-10 w-10 rounded-xl">
              <Database className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-brand-900)]">O que é coletado no questionário de clima</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                No diagnóstico HSE são registrados apenas o <strong>setor</strong> que você escolher e as respostas às 35 perguntas. Não são solicitados nome,
                e-mail nem qualquer dado que permita sua identificação pessoal nesse fluxo.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                No <strong>canal de denúncias</strong>, os campos dependem do que você optar por informar (incluindo denúncia anônima ou identificada) e seguem a
                política da organização e a finalidade da apuração.
              </p>
            </div>
          </PageShellCard>

          <PageShellCard className="flex gap-4">
            <div className="brand-icon-tile h-10 w-10 rounded-xl">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-brand-900)]">Proteção da confidencialidade (questionário)</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Os resultados do diagnóstico são apresentados de forma agregada, por setor ou para a empresa como um todo. Não são gerados relatórios
                individuais a partir das respostas do questionário.
              </p>
            </div>
          </PageShellCard>

          <PageShellCard className="flex gap-4">
            <div className="brand-icon-tile h-10 w-10 rounded-xl">
              <KeyRound className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-brand-900)]">Criptografia e trânsito dos dados</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                As respostas e os envios pela plataforma são protegidos por medidas de segurança, incluindo criptografia em trânsito, que reduzem o risco de
                acesso indevido durante a comunicação com os servidores.
              </p>
            </div>
          </PageShellCard>

          <PageShellCard className="flex gap-4">
            <div className="brand-icon-tile h-10 w-10 rounded-xl">
              <Lock className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-brand-900)]">Armazenamento</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Os dados ficam em ambiente controlado. O acesso administrativo às informações é restrito e protegido por autenticação, conforme a configuração
                da sua organização.
              </p>
            </div>
          </PageShellCard>

          <PageShellCard className="flex gap-4">
            <div className="brand-icon-tile h-10 w-10 rounded-xl">
              <Eye className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-brand-900)]">Finalidade</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                No questionário de clima, as respostas são usadas para análise agregada e para subsidiar ações de melhoria em saúde e segurança no trabalho, sem
                divulgação individual. No canal de denúncias, o tratamento visa apuração e gestão do relato conforme as regras definidas pela organização e pela
                legislação aplicável.
              </p>
            </div>
          </PageShellCard>

          <PageShellCard className="flex gap-4">
            <div className="brand-icon-tile h-10 w-10 rounded-xl">
              <Shield className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-brand-900)]">Seus direitos</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                A participação no diagnóstico é voluntária. Em caso de dúvidas sobre tratamento de dados ou pedidos relacionados à LGPD, entre em contato com
                o setor responsável pelo programa de saúde e bem-estar ou pelo compliance na sua organização.
              </p>
            </div>
          </PageShellCard>
        </section>
      </PageShell>
    </motion.div>
  )
}
