import { CheckCircle2, Home } from 'lucide-react'

type Props = {
  onVoltar?: () => void
}

export function Obrigado({ onVoltar }: Props) {
  return (
    <div className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Obrigado por responder
      </h2>
      <p className="mx-auto mt-4 max-w-md text-slate-600">
        Suas respostas foram registradas com sucesso. Os resultados do diagnóstico são de acesso restrito à equipe responsável.
      </p>
      <p className="mt-6 text-sm text-slate-500">
        Você pode fechar esta página.
      </p>
      {onVoltar && (
        <button
          type="button"
          onClick={onVoltar}
          className="btn-escritorio mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition"
        >
          <Home className="h-4 w-4" />
          Voltar ao início
        </button>
      )}
    </div>
  )
}
