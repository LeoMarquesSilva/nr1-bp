import { motion } from 'motion/react'
import { Shield, Database, Lock, Eye } from 'lucide-react'

interface PrivacidadeProps {
  onVoltar: () => void
}

export function Privacidade({ onVoltar }: PrivacidadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-10"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--escritorio-escuro)] sm:text-3xl">
          Privacidade e uso dos dados
        </h2>
        <p className="mt-3 text-[var(--escritorio-escuro)]/80">
          Informações sobre como seus dados são coletados, armazenados e utilizados neste diagnóstico.
        </p>
      </div>

      <section className="space-y-6">
        <div className="bg-card-escritorio flex gap-4 rounded-2xl p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--escritorio-dourado-light)] text-[var(--escritorio-dourado)]">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--escritorio-escuro)]">O que é coletado</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--escritorio-escuro)]/80">
              São registrados apenas o <strong>setor</strong> que você escolher e as respostas às 35 perguntas do questionário. Não são solicitados nome, e-mail nem qualquer dado que permita sua identificação pessoal.
            </p>
          </div>
        </div>

        <div className="bg-card-escritorio flex gap-4 rounded-2xl p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--escritorio-dourado-light)] text-[var(--escritorio-dourado)]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--escritorio-escuro)]">Armazenamento</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--escritorio-escuro)]/80">
              Os dados ficam armazenados localmente no dispositivo em que o formulário é preenchido (navegador), até que sejam eventualmente consolidados em ambiente controlado pelo escritório. O acesso aos resultados é restrito à área administrativa, protegida por senha.
            </p>
          </div>
        </div>

        <div className="bg-card-escritorio flex gap-4 rounded-2xl p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--escritorio-dourado-light)] text-[var(--escritorio-dourado)]">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--escritorio-escuro)]">Finalidade</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--escritorio-escuro)]/80">
              As respostas são utilizadas exclusivamente para análise agregada por setor e para a empresa como um todo, com o objetivo de avaliar o clima e os fatores psicossociais no trabalho e subsidiar ações de melhoria. Não há divulgação individual nem cruzamento com outros dados que permitam identificar o respondente.
            </p>
          </div>
        </div>

        <div className="bg-card-escritorio flex gap-4 rounded-2xl p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--escritorio-dourado-light)] text-[var(--escritorio-dourado)]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--escritorio-escuro)]">Seus direitos</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--escritorio-escuro)]/80">
              A participação no diagnóstico é voluntária. Em caso de dúvidas sobre o tratamento dos dados ou pedidos relacionados à LGPD, entre em contato com o setor responsável pelo programa de saúde e bem-estar da organização.
            </p>
          </div>
        </div>
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
