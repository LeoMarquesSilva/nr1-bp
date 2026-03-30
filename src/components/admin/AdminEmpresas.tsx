import { useState, useEffect } from 'react'
import { Building2, Plus, Pencil, Loader2, Trash2 } from 'lucide-react'
import { getTenantRegistry, upsertTenantRegistry, deleteTenantFromRegistry, type TenantRegistryItem } from '@/types/submission'
import { slugify, maskCnpj, formatCnpjDisplay } from '@/lib/masks'
import { SETORES } from '@/data/opcoes'
import { cn } from '@/lib/utils'

const NICHOS = [
  'Indústria',
  'Serviços',
  'Comércio',
  'Construção Civil',
  'Saúde',
  'Educação',
  'Tecnologia',
  'Agronegócio',
  'Financeiro',
  'Energia',
  'Transporte e Logística',
  'Mineração',
  'Alimentício',
  'Químico',
  'Outro',
] as const

type FormState = {
  tenant_id: string
  display_name: string
  cnpj: string
  cnpjs: string[]
  nicho: string
  setores: string[]
}

const emptyForm: FormState = {
  tenant_id: '',
  display_name: '',
  cnpj: '',
  cnpjs: [],
  nicho: '',
  setores: [],
}

export function AdminEmpresas() {
  const [list, setList] = useState<TenantRegistryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<TenantRegistryItem | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [newSetor, setNewSetor] = useState('')
  const [newCnpj, setNewCnpj] = useState('')

  const load = () => {
    setLoading(true)
    return getTenantRegistry().then((data) => {
      setList(data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const startNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setNewCnpj('')
  }

  const startEdit = (item: TenantRegistryItem) => {
    const cnpjVal = item.cnpj ?? ''
    const cnpjDisplay = cnpjVal.replace(/\D/g, '').length === 14 ? formatCnpjDisplay(cnpjVal) : cnpjVal
    setEditing(item)
    setForm({
      tenant_id: item.tenant_id,
      display_name: item.display_name ?? '',
      cnpj: cnpjDisplay,
      cnpjs: item.cnpjs ?? [],
      nicho: item.nicho ?? '',
      setores: item.setores ?? [],
    })
    setNewCnpj('')
  }

  // Slug automático a partir do nome (apenas ao criar nova empresa)
  const handleDisplayNameChange = (value: string) => {
    setForm((f) => ({
      ...f,
      display_name: value,
      ...(editing ? {} : { tenant_id: slugify(value) }),
    }))
  }

  const handleCnpjChange = (value: string) => {
    const { masked } = maskCnpj(value)
    setForm((f) => ({ ...f, cnpj: masked }))
  }

  const addCnpj = () => {
    const { raw, masked } = maskCnpj(newCnpj)
    if (raw.length < 14) return
    setForm((f) => ({ ...f, cnpjs: [...f.cnpjs, masked] }))
    setNewCnpj('')
  }

  const removeCnpj = (index: number) => {
    setForm((f) => ({ ...f, cnpjs: f.cnpjs.filter((_, i) => i !== index) }))
  }

  const addSetor = () => {
    const s = newSetor.trim()
    if (!s) return
    setForm((f) => ({ ...f, setores: [...f.setores, s] }))
    setNewSetor('')
  }

  const useDefaultSetores = () => {
    setForm((f) => ({ ...f, setores: [...SETORES] }))
  }

  const removeSetor = (index: number) => {
    setForm((f) => ({ ...f, setores: f.setores.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const slug = form.tenant_id.trim().toLowerCase()
    if (!slug) return
    setSaving(true)
    try {
      const cnpjRaw = form.cnpj.replace(/\D/g, '')
      await upsertTenantRegistry({
        tenant_id: slug,
        display_name: form.display_name || null,
        cnpj: cnpjRaw.length === 14 ? form.cnpj : null,
        cnpjs: form.cnpjs.filter((c) => c.replace(/\D/g, '').length === 14),
        nicho: form.nicho || null,
        setores: form.setores.filter(Boolean),
      })
      startNew()
      await load()
      alert('Empresa criada com sucesso. Ela já aparece na lista ao lado e no Dashboard.')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tid: string) => {
    if (!window.confirm('Remover esta empresa do registro? Os envios já feitos continuam no sistema.')) return
    try {
      await deleteTenantFromRegistry(tid)
      if (editing?.tenant_id === tid) startNew()
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          Cadastre empresas e defina as opções de setor para o formulário de diagnóstico de cada uma.
        </p>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:bg-[var(--primary-hover)]"
        >
          <Plus className="h-4 w-4" />
          Nova empresa
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-xs)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-brand-900)]">
            <Building2 className="h-5 w-5 text-[var(--muted-foreground)]" />
            Empresas no registro
          </h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : list.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">Nenhuma empresa cadastrada.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((item) => (
                <li
                  key={item.tenant_id}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/60 px-4 py-3',
                    editing?.tenant_id === item.tenant_id && 'ring-2 ring-[var(--color-brand-300)]'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-brand-900)] truncate">{item.display_name || item.tenant_id}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">{item.tenant_id}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--color-brand-100)] hover:text-[var(--color-brand-700)]"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.tenant_id)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--color-error-50)] hover:text-[var(--color-error-700)]"
                      title="Excluir do registro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-xs)]">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-brand-900)]">
            {editing ? 'Editar empresa' : 'Nova empresa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="emp-display_name" className="mb-1 block text-sm font-medium text-[var(--color-brand-700)]">
                Nome de exibição *
              </label>
              <input
                id="emp-display_name"
                type="text"
                value={form.display_name}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="Ex.: Empresa Alpha"
                required
                className="input-escritorio w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="emp-tenant_id" className="mb-1 block text-sm font-medium text-[var(--color-brand-700)]">
                Identificador (slug) *
              </label>
              <input
                id="emp-tenant_id"
                type="text"
                value={form.tenant_id}
                onChange={(e) => !editing && setForm((f) => ({ ...f, tenant_id: e.target.value }))}
                placeholder="ex: empresa-alpha"
                required
                disabled={!!editing}
                className="input-escritorio w-full rounded-xl px-4 py-2.5 text-sm disabled:bg-[var(--color-brand-50)] disabled:text-[var(--muted-foreground)]"
              />
              {!editing && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Gerado automaticamente pelo nome. Você pode editar.</p>
              )}
              {editing && <p className="mt-1 text-xs text-[var(--muted-foreground)]">Não é possível alterar o identificador.</p>}
            </div>
            <div>
              <label htmlFor="emp-cnpj" className="mb-1 block text-sm font-medium text-slate-700">
                CNPJ principal
              </label>
              <input
                id="emp-cnpj"
                type="text"
                value={form.cnpj}
                onChange={(e) => handleCnpjChange(e.target.value)}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Outros CNPJs (grupo de empresas)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCnpj}
                  onChange={(e) => setNewCnpj(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCnpj())}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={addCnpj}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Adicionar CNPJ
                </button>
              </div>
              {form.cnpjs.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {form.cnpjs.map((c, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <span className="font-mono">{c}</span>
                      <button type="button" onClick={() => removeCnpj(i)} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nicho
              </label>
              <div className="flex flex-wrap gap-2">
                {NICHOS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, nicho: form.nicho === n ? '' : n }))}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-sm font-medium transition',
                      form.nicho === n
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Opções de setor (formulário de diagnóstico)
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Lista usada no passo de identificação do diagnóstico. Se vazia, usa a lista padrão.
              </p>
              <button
                type="button"
                onClick={useDefaultSetores}
                className="mb-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Usar setores padrão do diagnóstico
              </button>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSetor}
                  onChange={(e) => setNewSetor(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSetor())}
                  placeholder="Ex.: Diretoria"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
                <button type="button" onClick={addSetor} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Adicionar
                </button>
              </div>
              {form.setores.length > 0 && (
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {form.setores.map((s, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <span>{s}</span>
                      <button type="button" onClick={() => removeSetor(i)} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving || !form.tenant_id.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition disabled:opacity-50 hover:bg-slate-800"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? 'Salvar' : 'Criar empresa'}
              </button>
              {editing && (
                <button type="button" onClick={startNew} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancelar
                </button>
              )}
            </div>
            {editing && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-red-800">Excluir empresa do registro</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Remove a empresa da lista. Os envios já feitos continuam no sistema.
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(editing.tenant_id)}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir do registro
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
