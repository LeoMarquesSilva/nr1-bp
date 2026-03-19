import { CheckCircle2, Copy } from 'lucide-react'

type Props = {
  protocolId: string
  isAnonymous: boolean
  onFechar: () => void
  onConsultar?: () => void
}

export function WhistleblowerThanks({ protocolId, isAnonymous, onFechar, onConsultar }: Props) {
  const copyProtocol = () => {
    navigator.clipboard.writeText(protocolId).then(() => alert('Protocolo copiado.'))
  }

  return (
    <div className="bg-card-escritorio mx-auto max-w-xl rounded-2xl border border-slate-200/60 p-8 text-center shadow-lg sm:p-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Denúncia recebida</h2>
      <p className="mx-auto mt-4 max-w-md text-slate-600">
        {isAnonymous ? (
          <>
            Sua denúncia foi registrada de forma <strong>anônima</strong> e será analisada pelo comitê de ética. Guarde o número do protocolo para
            acompanhar o andamento.
          </>
        ) : (
          <>
            Sua denúncia foi registrada com os dados de contato informados. A organização poderá utilizar essas informações para retorno, quando
            aplicável. Guarde também o protocolo para acompanhar o status.
          </>
        )}
      </p>
      <div className="mt-6 rounded-xl border-2 border-violet-200 bg-violet-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Seu protocolo</p>
        <p className="mt-1 flex items-center justify-center gap-2 font-mono text-lg font-bold tracking-widest text-slate-800">
          {protocolId}
          <button
            type="button"
            onClick={copyProtocol}
            className="rounded p-1 hover:bg-white/60"
            aria-label="Copiar protocolo"
          >
            <Copy className="h-4 w-4" />
          </button>
        </p>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        {isAnonymous ? (
          <>Use este número nesta mesma página (opção &quot;Consultar denúncia&quot;) para ver o status sem precisar se identificar.</>
        ) : (
          <>Você também pode acompanhar o status pelo protocolo, em &quot;Consultar denúncia&quot;, quando desejar.</>
        )}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {onConsultar && (
          <button
            type="button"
            onClick={onConsultar}
            className="rounded-full border-2 border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Consultar denúncia
          </button>
        )}
        <button type="button" onClick={onFechar} className="btn-escritorio rounded-full px-6 py-3 font-semibold">
          Fechar
        </button>
      </div>
    </div>
  )
}
