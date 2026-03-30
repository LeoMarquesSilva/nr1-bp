import { useState } from 'react'
import { Paperclip, ExternalLink, Loader2 } from 'lucide-react'
import { getWhistleblowerEvidenceSignedUrl } from '../types/whistleblower'
import type { EvidencePathEntry } from '../types/whistleblower'

type Props = {
  items: EvidencePathEntry[] | null | undefined
}

export function WhistleblowerEvidenceLinks({ items }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!items || !Array.isArray(items) || items.length === 0) return null

  const open = async (path: string) => {
    setLoading(path)
    try {
      const url = await getWhistleblowerEvidenceSignedUrl(path)
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
      else alert('Não foi possível gerar o link do arquivo. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <Paperclip className="h-3.5 w-3.5" />
        Provas anexadas
      </p>
      <ul className="mt-2 space-y-2">
        {items.map((e) => (
          <li key={e.path}>
            <button
              type="button"
              onClick={() => open(e.path)}
              disabled={loading === e.path}
              className="inline-flex items-center gap-1.5 text-left text-sm font-medium text-violet-600 hover:underline disabled:opacity-60"
            >
              {loading === e.path ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              )}
              {e.original_name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
