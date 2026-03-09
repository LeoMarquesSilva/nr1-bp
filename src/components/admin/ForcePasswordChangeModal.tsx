import { useState } from 'react'
import { Lock, Loader2, LogOut } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { logoutAdmin } from '@/lib/adminAuth'
import { cn } from '@/lib/utils'

type ForcePasswordChangeModalProps = {
  onSuccess: () => void
  onLogout: () => void
}

export function ForcePasswordChangeModal({ onSuccess, onLogout }: ForcePasswordChangeModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabase()
      
      // Atualiza a senha no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        password: password
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Usuário não encontrado.')
      }

      // Atualiza a flag na tabela public.users
      const { error: updateError } = await supabase
        .from('users')
        .update({ requires_password_change: false })
        .eq('auth_id', authData.user.id)

      if (updateError) {
        throw new Error('Erro ao atualizar status do perfil.')
      }

      // Conclui o processo com sucesso
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao redefinir a senha.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
    } finally {
      logoutAdmin()
      onLogout()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Segurança da Conta
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Como este é seu primeiro acesso, por favor, defina uma nova senha para sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-slate-700">
              Nova senha
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700">
              Confirmar nova senha
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || password.length < 6 || password !== confirmPassword}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition disabled:opacity-50 hover:bg-slate-800"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Redefinindo...' : 'Redefinir senha e acessar'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
