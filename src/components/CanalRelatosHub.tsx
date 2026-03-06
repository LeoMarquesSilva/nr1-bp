import { MessageSquarePlus, FileQuestion, ArrowRight, Shield } from 'lucide-react'

type Props = {
  orgSlug: string
  orgDisplayName?: string | null
  onEnviarRelato: () => void
  onAcompanharCodigo: () => void
}

export function CanalRelatosHub({ orgSlug, orgDisplayName, onEnviarRelato, onAcompanharCodigo }: Props) {
  const orgName = orgDisplayName || orgSlug

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Canal de relatos
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {orgName}
            </h1>
          </div>
        </div>

        <p className="mt-6 text-slate-600">
          Comunique-se de forma anônima ou identificada para relatar alguma situação. Escolha uma das opções abaixo.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onEnviarRelato}
            className="group flex flex-col items-start rounded-xl border-2 border-slate-200 bg-white p-5 text-left transition hover:border-violet-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">Enviar relato</h2>
            <p className="mt-1 text-sm text-slate-600">
              Envie uma nova denúncia ou relato de forma anônima ou identificada.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all">
              Acessar
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>

          <button
            type="button"
            onClick={onAcompanharCodigo}
            className="group flex flex-col items-start rounded-xl border-2 border-slate-200 bg-white p-5 text-left transition hover:border-violet-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <FileQuestion className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">Acompanhar relato por código</h2>
            <p className="mt-1 text-sm text-slate-600">
              Cole o código de protocolo abaixo para acompanhar o andamento e enviar informações adicionais.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all">
              Acessar
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
