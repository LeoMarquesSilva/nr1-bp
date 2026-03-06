import { Lock, Home } from 'lucide-react'

type Props = {
  onVoltar?: () => void
}

export function ColetaEncerrada({ onVoltar }: Props) {
  return (
    <div className="bg-card-escritorio rounded-2xl border border-slate-200/60 p-8 text-center shadow-lg sm:p-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Lock className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Coleta encerrada
      </h2>
      <p className="mx-auto mt-4 max-w-md text-slate-600">
        Esta coleta de respostas foi encerrada. Não é mais possível enviar novos diagnósticos por este link.
      </p>
      {onVoltar && (
        <button
          type="button"
          onClick={onVoltar}
          className="btn-escritorio mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold transition"
        >
          <Home className="h-4 w-4" />
          Voltar
        </button>
      )}
    </div>
  )
}
