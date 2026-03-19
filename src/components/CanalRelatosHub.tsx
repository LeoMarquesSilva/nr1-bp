import { MessageSquarePlus, FileQuestion, ArrowRight, Shield } from 'lucide-react'

type Props = {
  orgSlug: string
  orgDisplayName?: string | null
  onEnviarDenuncia: () => void
  onAcompanharCodigo: () => void
}

export function CanalRelatosHub({ orgSlug, orgDisplayName, onEnviarDenuncia, onAcompanharCodigo }: Props) {
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
              Canal de denúncia
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {orgName}
            </h1>
          </div>
        </div>

        <p className="mt-6 text-slate-600">
          Registre uma denúncia de forma anônima ou informando seus dados, ou acompanhe uma denúncia já enviada pelo código de protocolo.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onEnviarDenuncia}
            className="group flex flex-col items-start rounded-xl border-2 border-slate-200 bg-white p-5 text-left transition hover:border-violet-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">Enviar denúncia</h2>
            <p className="mt-1 text-sm text-slate-600">
              Nova denúncia, com opção de anonimato ou identificação.
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
            <h2 className="mt-4 font-semibold text-slate-900">Acompanhar denúncia por código</h2>
            <p className="mt-1 text-sm text-slate-600">
              Informe o protocolo para ver o status da sua denúncia.
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
