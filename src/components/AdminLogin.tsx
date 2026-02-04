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
    <div className="bg-card-escritorio mx-auto max-w-sm p-8">
      <div className="mb-6 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dourado-light" style={{ color: 'var(--escritorio-dourado)' }}>
          <Lock className="h-6 w-6" />
        </div>
      </div>
      <h2 className="text-center text-xl font-bold tracking-tight text-escritorio">
        Acesso administrativo
      </h2>
      <p className="mt-2 text-center text-sm text-escritorio/80">
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
            className="input-escritorio w-full rounded-xl border px-4 py-3.5 transition"
            style={{ borderColor: 'rgba(16,31,46,0.12)', background: 'var(--branco-gelo)', color: 'var(--escritorio-escuro)' }}
          />
        </div>
        {error && (
          <p className="text-sm font-medium text-red-600">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border py-3 font-semibold text-escritorio transition hover:bg-black/5"
            style={{ borderColor: 'rgba(16,31,46,0.15)', background: 'var(--branco-gelo)' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-escritorio flex flex-1 items-center justify-center gap-2 py-3 font-semibold transition disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </button>
        </div>
      </form>
    </div>
  )
}
