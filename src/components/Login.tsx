import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { LogIn, Mail, Lock } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { setAdminSession } from "@/lib/adminAuth"

interface LoginProps {
  onSuccess?: () => void
  onCancel: () => void
}

export function Login({ onSuccess, onCancel }: LoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Se já existir sessão válida de admin, redireciona para o painel (evita pedir login de novo ao clicar "Voltar ao site" e depois "Entrar")
  useEffect(() => {
    let cancelled = false
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || !session?.user?.id) {
        setCheckingSession(false)
        return
      }
      supabase
        .from("users")
        .select("id, role, is_active")
        .eq("auth_id", session.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (cancelled) return
          setCheckingSession(false)
          if (profile && profile.is_active && profile.role === "admin") {
            setAdminSession()
            onSuccess?.()
          }
        })
    })
    return () => { cancelled = true }
  }, [onSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (authError) {
        setError(authError.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : authError.message)
        setLoading(false)
        return
      }
      const userId = authData.user?.id
      if (!userId) {
        setError("Falha ao obter usuário.")
        setLoading(false)
        return
      }
      const { data: profile, error: profileError } = await supabase.from("users").select("id, role, is_active").eq("auth_id", userId).maybeSingle()
      if (profileError || !profile || !profile.is_active || profile.role !== "admin") {
        await supabase.auth.signOut()
        setError("Acesso não autorizado. Entre em contato com o administrador.")
        setLoading(false)
        return
      }
      setAdminSession()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="mx-auto flex max-w-sm items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-300)] border-t-[var(--color-brand-700)]" aria-label="Verificando sessão" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-sm"
    >
      <div className="bg-card-escritorio rounded-2xl border border-[var(--border)] p-8 shadow-[var(--shadow-sm)]">
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
            <LogIn className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-[var(--color-brand-900)]">
          Entrar
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
          Use suas credenciais para acessar sua conta.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="sr-only">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                required
                autoComplete="email"
                className="input-escritorio w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-[var(--color-brand-900)] transition"
              />
            </div>
          </div>
          <div>
            <label htmlFor="login-password" className="sr-only">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                autoComplete="current-password"
                className="input-escritorio w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-[var(--color-brand-900)] transition"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-full border-2 border-[var(--color-brand-300)] bg-white py-3 font-semibold text-[var(--color-brand-700)] transition hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)]"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-escritorio flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-semibold transition disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
