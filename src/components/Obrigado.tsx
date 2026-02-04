import { CheckCircle2, Home } from 'lucide-react'

type Props = {
  onVoltar?: () => void
}

export function Obrigado({ onVoltar }: Props) {
  return (
    <div className="bg-card-escritorio p-8 text-center sm:p-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-dourado-light" style={{ color: 'var(--escritorio-dourado)' }}>
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-escritorio sm:text-3xl">
        Obrigado por responder
      </h2>
      <p className="mx-auto mt-4 max-w-md text-escritorio/90">
        Suas respostas foram registradas com sucesso. Os resultados do diagnóstico são de acesso restrito à equipe responsável.
      </p>
      <p className="mt-6 text-sm text-escritorio/75">
        Você pode fechar esta página.
      </p>
      {onVoltar && (
        <button
          type="button"
          onClick={onVoltar}
          className="btn-escritorio mt-8 inline-flex items-center gap-2 px-5 py-3 font-semibold transition"
        >
          <Home className="h-4 w-4" />
          Voltar ao início
        </button>
      )}
    </div>
  )
}
