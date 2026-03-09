import { useState, useEffect } from 'react'
import { Users, Plus, Loader2, Power, PowerOff, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type AdminUser = {
  id: string
  auth_id: string
  name: string
  email: string
  department: string | null
  role: string
  is_active: boolean
  avatar_url: string | null
  requires_password_change: boolean
  created_at: string
}

const emptyForm = {
  name: '',
  email: '',
  password: '',
  department: '',
}

type ModalState = {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
}

export function AdminUsuarios() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [currentUserAuthId, setCurrentUserAuthId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'success', title: '', message: '' })

  const showModal = (type: 'success' | 'error' | 'confirm', title: string, message: string, onConfirm?: () => void) => {
    setModal({ isOpen: true, type, title, message, onConfirm })
  }

  const load = async () => {
    setLoading(true)
    const supabase = getSupabase()
    
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session?.user) {
      setCurrentUserAuthId(sessionData.session.user.id)
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erro ao carregar usuários: ' + error.message)
    } else {
      setUsers(data as AdminUser[])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = getSupabase()
      const { data: sessionData } = await supabase.auth.getSession()
    
      if (!sessionData.session?.access_token) {
        throw new Error('Você precisa estar logado para criar um usuário.')
      }

      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: form,
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      })

      if (error) {
        throw new Error(error.message || 'Erro na requisição')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      setForm(emptyForm)
      await load()
      showModal('success', 'Usuário criado', 'O novo administrador foi registrado com sucesso.')
    } catch (err) {
      showModal('error', 'Erro na criação', err instanceof Error ? err.message : 'Não foi possível criar o usuário.')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (user: AdminUser) => {
    if (user.auth_id === currentUserAuthId) {
      showModal('error', 'Ação não permitida', 'Você não pode alterar o status do seu próprio usuário.')
      return
    }

    showModal(
      'confirm',
      user.is_active ? 'Desativar usuário' : 'Ativar usuário',
      `Deseja ${user.is_active ? 'desativar' : 'ativar'} o usuário ${user.name}?`,
      async () => {
        setModal({ ...modal, isOpen: false })
        try {
          const supabase = getSupabase()
          const { error } = await supabase
            .from('users')
            .update({ is_active: !user.is_active })
            .eq('id', user.id)

          if (error) throw error
          
          await load()
        } catch (err) {
          showModal('error', 'Erro na alteração', err instanceof Error ? err.message : 'Não foi possível alterar o status do usuário.')
        }
      }
    )
  }

  const deleteUser = async (user: AdminUser) => {
    if (user.auth_id === currentUserAuthId) {
      showModal('error', 'Ação não permitida', 'Você não pode excluir o seu próprio usuário.')
      return
    }

    showModal(
      'confirm',
      'Excluir usuário',
      `Deseja realmente excluir permanentemente o usuário ${user.name}? Esta ação não pode ser desfeita.`,
      async () => {
        setModal({ ...modal, isOpen: false })
        
        // Ocultar da tela temporariamente para parecer rápido
        setUsers((current) => current.filter((u) => u.id !== user.id))

        try {
          const supabase = getSupabase()
          const { data: sessionData } = await supabase.auth.getSession()
          
          if (!sessionData.session?.access_token) {
            throw new Error('Sessão expirada. Faça login novamente.')
          }

          const { data, error } = await supabase.functions.invoke('delete-admin-user', {
            body: { userId: user.auth_id },
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`
            }
          })

          if (error) {
            throw new Error(error.message || 'Erro na requisição')
          }

          if (data?.error) {
            throw new Error(data.error)
          }

          showModal('success', 'Usuário excluído', 'O administrador foi removido permanentemente do sistema.')
        } catch (err) {
          // Reverter a exclusão visual se deu erro
          await load()
          showModal('error', 'Erro na exclusão', err instanceof Error ? err.message : 'Não foi possível excluir o usuário.')
        }
      }
    )
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Gerencie os administradores que têm acesso ao painel.
          </p>
        </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Users className="h-5 w-5 text-slate-500" />
            Usuários Cadastrados
          </h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nenhum usuário cadastrado.</p>
          ) : (
            <ul className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover shadow-sm ring-1 ring-slate-200" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                          {user.name.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'A'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 truncate">{user.name}</p>
                          {!user.is_active && (
                            <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                              Inativo
                            </span>
                          )}
                          {user.auth_id === currentUserAuthId && (
                            <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                              Você
                            </span>
                          )}
                          {user.requires_password_change && user.auth_id !== currentUserAuthId && (
                            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                              Pendente 1º Acesso
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        {user.department && <p className="text-[10px] text-slate-400 mt-0.5">{user.department}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {user.auth_id !== currentUserAuthId && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleStatus(user)}
                          className={cn(
                            "rounded-lg p-2 transition",
                            user.is_active 
                              ? "text-slate-400 hover:bg-amber-100 hover:text-amber-600" 
                              : "text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                          )}
                          title={user.is_active ? "Desativar usuário" : "Ativar usuário"}
                        >
                          {user.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(user)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                          title="Excluir usuário permanentemente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Novo Usuário Admin
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="usr-name" className="mb-1 block text-sm font-medium text-slate-700">
                Nome completo *
              </label>
              <input
                id="usr-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex.: João Silva"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label htmlFor="usr-email" className="mb-1 block text-sm font-medium text-slate-700">
                E-mail *
              </label>
              <input
                id="usr-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="joao@empresa.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label htmlFor="usr-password" className="mb-1 block text-sm font-medium text-slate-700">
                Senha inicial *
              </label>
              <input
                id="usr-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label htmlFor="usr-department" className="mb-1 block text-sm font-medium text-slate-700">
                Departamento (Opcional)
              </label>
              <input
                id="usr-department"
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Ex.: TI, RH"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition disabled:opacity-50 hover:bg-slate-800"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Criar administrador
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feedback Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex flex-col items-center text-center">
              {modal.type === 'success' && (
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              )}
              {modal.type === 'error' && (
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
              )}
              {modal.type === 'confirm' && (
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-slate-900">{modal.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{modal.message}</p>
            </div>
            
            {modal.type === 'confirm' ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => modal.onConfirm?.()}
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setModal({ ...modal, isOpen: false })}
                className={cn(
                  "w-full rounded-xl py-2.5 text-sm font-semibold text-white transition",
                  modal.type === 'success' 
                    ? "bg-slate-900 hover:bg-slate-800" 
                    : "bg-red-600 hover:bg-red-700"
                )}
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
