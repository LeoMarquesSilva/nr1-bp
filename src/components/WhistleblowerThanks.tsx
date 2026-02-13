import { CheckCircle2 } from 'lucide-react'

type Props = {
  onFechar: () => void
}

export function WhistleblowerThanks({ onFechar }: Props) {
  return (
    <div className="bg-card-escritorio mx-auto max-w-xl rounded-2xl p-8 text-center shadow-lg sm:p-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-dourado-light" style={{ color: 'var(--escritorio-dourado)' }}>
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-escritorio sm:text-3xl">
        Denúncia recebida
      </h2>
      <p className="mx-auto mt-4 max-w-md text-escritorio/80">
        Seu relato foi registrado de forma anônima e será analisado pela área responsável. Você pode fechar esta página.
      </p>
      <button
        type="button"
        onClick={onFechar}
        className="btn-escritorio mt-8 px-6 py-3 font-semibold"
      >
        Fechar
      </button>
    </div>
  )
}
