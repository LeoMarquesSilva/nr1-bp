import { useState } from 'react'
import { Lock, LogIn } from 'lucide-react'
import { loginAdmin } from '../lib/adminAuth'

type Props = {
  onSuccess: () => void
  onCancel: () => void
}

export function AdminLogin({ onSuccess, onCancel }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (loginAdmin(password)) {
      onSuccess()
    } else {
      setError('Senha incorreta.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-card-escritorio mx-auto max-w-sm rounded-2xl border border-slate-200/60 p-8 shadow-sm">
      <div className="mb-6 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <Lock className="h-6 w-6" />
        </div>
      </div>
      <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
        Acesso administrativo
      </h2>
      <p className="mt-2 text-center text-sm text-slate-600">
        Apenas administradores podem ver os resultados.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="admin-password" className="sr-only">
            Senha
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            autoFocus
            className="input-escritorio w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 transition"
          />
        </div>
        {error && (
          <p className="text-sm font-medium text-red-600">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border-2 border-slate-300 bg-white py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-escritorio flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-semibold transition disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </button>
        </div>
      </form>
    </div>
  )
}
