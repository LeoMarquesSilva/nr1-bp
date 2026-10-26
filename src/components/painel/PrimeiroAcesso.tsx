import { useId, useState } from 'react'
import { Check, Eye, EyeOff, KeyRound, Loader2, LogOut, X } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { checkNewPassword, isPasswordAccepted, passwordErrorMessage } from '@/lib/senha'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/header/logo'
import type { PainelProfile } from './PainelContext'
import { Button, inputCls } from './ui'

/**
 * Tela única do primeiro acesso: enquanto a senha provisória não for trocada, o painel não abre
 * (no banco, a pessoa ainda não conta como admin). A troca é registrada pelo gatilho em auth.users.
 */
export function PrimeiroAcesso({ profile, onDone, onLogout }: { profile: PainelProfile; onDone: () => Promise<boolean>; onLogout: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rulesId = useId()

  const rules = checkNewPassword(password, { email: profile.email, name: profile.name })
  const accepted = isPasswordAccepted(rules)
  const matches = confirm.length > 0 && confirm === password
  const firstName = profile.name.trim().split(/\s+/)[0] || profile.name

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!accepted) {
      setError('A nova senha ainda não atende a todas as regras.')
      return
    }
    if (!matches) {
      setError('A confirmação não é igual à nova senha.')
      return
    }
    setSaving(true)
    try {
      const supabase = getSupabase()
      const { data, error: authError } = await supabase.auth.updateUser({ password })
      if (authError || !data.user) {
        setError(passwordErrorMessage(authError))
        return
      }
      // Sem a migração 027 (gatilho no banco), a flag é desligada por aqui; com ela, isto não muda nada.
      await supabase.from('users').update({ requires_password_change: false }).eq('auth_id', data.user.id)
      const liberado = await onDone()
      if (!liberado) setError('A senha foi trocada, mas o acesso ainda não foi liberado. Saia e entre de novo com a nova senha.')
    } catch {
      setError('Não foi possível trocar a senha. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-brand-900)] px-4 py-10 font-reading">
      <div className="w-full max-w-md">
        <Logo variant="dark" className="mx-auto mb-8 w-fit [&_img]:h-9" onNavigateHome={undefined} />
        <div className="rounded-xl bg-white p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)]" aria-hidden>
            <KeyRound className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-sans text-2xl font-bold tracking-tight text-[var(--color-brand-900)]">Crie sua senha</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-brand-700)]">
            Olá, {firstName}. Você entrou com uma senha provisória. Para proteger os dados das empresas, crie uma senha só sua antes de acessar o painel.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="nova-senha" className="mb-1.5 block text-sm font-medium text-[var(--color-brand-900)]">
                Nova senha
              </label>
              <div className="relative">
                <input
                  id="nova-senha"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={rulesId}
                  className={cn(inputCls, 'pr-11')}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  aria-label={show ? 'Esconder senha' : 'Mostrar senha'}
                  aria-pressed={show}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <ul id={rulesId} className="space-y-1.5 rounded-lg bg-[var(--color-brand-50)] px-3 py-2.5" aria-label="Regras da senha">
              {rules.map((r) => (
                <li key={r.id} className={cn('flex items-center gap-2 text-sm', r.ok ? 'text-[var(--color-success-700)]' : 'text-[var(--color-brand-700)]')}>
                  {r.ok ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : <X className="h-4 w-4 shrink-0 text-[var(--color-brand-400)]" aria-hidden />}
                  <span>
                    {r.label}
                    <span className="sr-only">{r.ok ? ' (atendida)' : ' (pendente)'}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div>
              <label htmlFor="confirmar-senha" className="mb-1.5 block text-sm font-medium text-[var(--color-brand-900)]">
                Confirme a nova senha
              </label>
              <input
                id="confirmar-senha"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputCls}
              />
              {confirm.length > 0 && !matches && <p className="mt-1.5 text-xs text-[var(--color-error-700)]">A confirmação ainda não é igual à nova senha.</p>}
            </div>

            {error && (
              <p className="rounded-lg bg-[var(--color-error-50)] px-3 py-2 text-sm text-[var(--color-error-700)]" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              Salvar senha e entrar
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={onLogout} disabled={saving}>
              <LogOut />
              Sair
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
