import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

type Profile = {
  id: string
  name: string
  email: string
  avatar_url?: string | null
  department?: string | null
} | null

type AdminPerfilProps = {
  profile: Profile
  /** Chamado após salvar perfil (para o layout atualizar o avatar/nome). */
  onProfileUpdated?: () => void
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

export function AdminPerfil({ profile, onProfileUpdated }: AdminPerfilProps) {
  const [name, setName] = useState(profile?.name ?? '')
  const [department, setDepartment] = useState(profile?.department ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
      setDepartment(profile.department ?? '')
      setAvatarUrl(profile.avatar_url ?? '')
    }
  }, [profile?.id, profile?.name, profile?.department, profile?.avatar_url])

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Meu Perfil</h2>
        <p className="mt-2 text-slate-500">Carregando...</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSaving(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        setMessage({ type: 'error', text: 'Sessão expirada. Faça login novamente.' })
        setSaving(false)
        return
      }
      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim() || profile.name,
          department: department.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('auth_id', session.user.id)
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Não foi possível salvar.' })
        setSaving(false)
        return
      }
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso.' })
      onProfileUpdated?.()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao salvar.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Meu Perfil</h2>
        <p className="mt-1 text-sm text-slate-500">Ajuste suas informações pessoais.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 text-slate-600">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold">{getInitials(profile.name)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="font-semibold text-slate-900">{profile.name}</p>
            <p className="mt-0.5 text-sm text-slate-500">{profile.email}</p>
            <p className="mt-1 text-xs text-slate-400">E-mail não pode ser alterado aqui.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-100 pt-6">
          <div>
            <label htmlFor="perfil-name" className="mb-1 block text-sm font-medium text-slate-700">
              Nome
            </label>
            <input
              id="perfil-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label htmlFor="perfil-department" className="mb-1 block text-sm font-medium text-slate-700">
              Departamento
            </label>
            <input
              id="perfil-department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Ex.: RH, Jurídico"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label htmlFor="perfil-avatar" className="mb-1 block text-sm font-medium text-slate-700">
              URL do avatar (foto)
            </label>
            <input
              id="perfil-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          {message && (
            <p className={message.type === 'success' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition disabled:opacity-50 hover:bg-slate-800"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
