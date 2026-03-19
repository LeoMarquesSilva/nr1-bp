import { motion } from 'motion/react'
import { Shield, Database, Lock, Eye, Users, KeyRound } from 'lucide-react'

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
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Privacidade e uso dos dados
        </h2>
        <p className="mt-4 text-slate-600">
          Saiba quais informações são coletadas, como elas são armazenadas e de que forma são utilizadas nesta pesquisa.
        </p>
      </div>

      {/*
        Ordem: transparência (o quê) → tratamento (agregado) → segurança técnica → onde ficam →
        finalidade → direitos do titular (LGPD).
      */}
      <section className="space-y-6">
        <div className="bg-card-escritorio flex gap-4 rounded-2xl border border-slate-200/60 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">O que é coletado</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              São registrados apenas o <strong>setor</strong> que você escolher e as respostas às 35 perguntas do questionário. Não são solicitados nome, e-mail nem qualquer dado que permita sua identificação pessoal.
            </p>
          </div>
        </div>

        <div className="bg-card-escritorio flex gap-4 rounded-2xl border border-slate-200/60 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Proteção da confidencialidade</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Os resultados são apresentados apenas de forma agregada, por setor ou para a empresa como um todo. Não são gerados relatórios individuais.
            </p>
          </div>
        </div>

        <div className="bg-card-escritorio flex gap-4 rounded-2xl border border-slate-200/60 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Criptografia das respostas</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              As respostas são protegidas por tecnologia de criptografia, que impede o acesso não autorizado às informações durante o envio e o armazenamento dos dados.
            </p>
          </div>
        </div>

        <div className="bg-card-escritorio flex gap-4 rounded-2xl border border-slate-200/60 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Armazenamento</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Os dados ficam armazenados em ambiente seguro. O acesso aos resultados é restrito à área administrativa, protegida por senha.
            </p>
          </div>
        </div>

        <div className="bg-card-escritorio flex gap-4 rounded-2xl border border-slate-200/60 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Finalidade</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              As respostas são utilizadas exclusivamente para análise agregada por setor e para a empresa como um todo, com o objetivo de avaliar o clima e os fatores psicossociais no trabalho e subsidiar ações de melhoria. Não há divulgação individual nem cruzamento com outros dados que permitam identificar o respondente.
            </p>
          </div>
        </div>

        <div className="bg-card-escritorio flex gap-4 rounded-2xl border border-slate-200/60 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Seus direitos</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              A participação na pesquisa é voluntária. Em caso de dúvidas sobre o tratamento dos dados ou pedidos relacionados à LGPD, entre em contato com o setor responsável pelo programa de saúde e bem-estar da organização.
            </p>
          </div>
        </div>
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
