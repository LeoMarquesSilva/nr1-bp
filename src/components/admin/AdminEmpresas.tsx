import { useState, useEffect } from 'react'
import { Building2, Plus, Pencil, Loader2, Trash2, ImageUp } from 'lucide-react'
import {
  getTenantRegistry,
  logAdminAuditAction,
  upsertTenantRegistry,
  deleteTenantFromRegistry,
  type TenantRegistryItem,
  type TenantGroupCnpj,
} from '@/services/api'
import { slugify, maskCnpj, formatCnpjDisplay } from '@/lib/masks'
import { SETORES } from '@/data/opcoes'
import { cn } from '@/lib/utils'
import { feedback } from '@/lib/feedback'
import { uploadTenantLogoFile, normalizeTenantLogoUrl } from '@/lib/tenantLogoStorage'
import { TenantLogoAvatar } from '@/components/TenantLogoAvatar'

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
  whistleblower_enabled: boolean
  logo_url: string
  cnpj: string
  cnpjs: TenantGroupCnpj[]
  nicho: string
  setores: string[]
}

const emptyForm: FormState = {
  tenant_id: '',
  display_name: '',
  whistleblower_enabled: true,
  logo_url: '',
  cnpj: '',
  cnpjs: [],
  nicho: '',
  setores: [],
}

function displayCnpj(value: string): string {
  const { raw, masked } = maskCnpj(value)
  return raw.length === 14 ? masked : value
}

function normalizeGroupCnpjs(entries: Array<string | TenantGroupCnpj> | undefined): TenantGroupCnpj[] {
  if (!entries || entries.length === 0) return []
  return entries
    .map((entry) => {
      if (typeof entry === 'string') {
        return { cnpj: displayCnpj(entry), razao_social: '' }
      }
      return {
        cnpj: displayCnpj(entry.cnpj ?? ''),
        razao_social: (entry.razao_social ?? '').trim(),
      }
    })
    .filter((entry) => entry.cnpj.replace(/\D/g, '').length > 0)
}

export function AdminEmpresas() {
  const [list, setList] = useState<TenantRegistryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<TenantRegistryItem | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [newSetor, setNewSetor] = useState('')
  const [newCnpj, setNewCnpj] = useState('')
  const [newRazaoSocial, setNewRazaoSocial] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const canAddGroupCnpj = maskCnpj(newCnpj).raw.length === 14 && newRazaoSocial.trim().length > 0

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
    setNewRazaoSocial('')
    setFormError('')
    setFormSuccess('')
  }

  const startEdit = (item: TenantRegistryItem) => {
    const cnpjVal = item.cnpj ?? ''
    const cnpjDisplay = cnpjVal.replace(/\D/g, '').length === 14 ? formatCnpjDisplay(cnpjVal) : cnpjVal
    setEditing(item)
    setForm({
      tenant_id: item.tenant_id,
      display_name: item.display_name ?? '',
      whistleblower_enabled: item.whistleblower_enabled ?? true,
      logo_url: item.logo_url ?? '',
      cnpj: cnpjDisplay,
      cnpjs: normalizeGroupCnpjs(item.cnpjs),
      nicho: item.nicho ?? '',
      setores: item.setores ?? [],
    })
    setNewCnpj('')
    setNewRazaoSocial('')
    setFormError('')
    setFormSuccess('')
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
    const razao = newRazaoSocial.trim()
    if (raw.length < 14 || !razao) return
    setForm((f) => {
      const cnpjPrincipalRaw = f.cnpj.replace(/\D/g, '')
      const exists = f.cnpjs.some((c) => c.cnpj.replace(/\D/g, '') === raw)
      if (exists || cnpjPrincipalRaw === raw) return f
      return { ...f, cnpjs: [...f.cnpjs, { cnpj: masked, razao_social: razao }] }
    })
    setNewCnpj('')
    setNewRazaoSocial('')
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

  const computedSlug = editing ? form.tenant_id : slugify(form.display_name)

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const slug = computedSlug.trim().toLowerCase()
    if (!slug) {
      feedback.error('Informe o nome de exibição para gerar o identificador antes de enviar a imagem.')
      return
    }
    setLogoUploading(true)
    try {
      const url = await uploadTenantLogoFile(slug, file)
      setForm((f) => ({ ...f, logo_url: url }))
      feedback.success('Imagem enviada. Clique em Salvar para gravar no cadastro.')
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Falha ao enviar a imagem.')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    const slug = computedSlug.trim().toLowerCase()
    if (!slug) {
      setFormError('Informe um nome de exibição válido para gerar o identificador.')
      return
    }
    setSaving(true)
    try {
      const cnpjRaw = form.cnpj.replace(/\D/g, '')
      if (form.cnpj && cnpjRaw.length !== 14) {
        setFormError('CNPJ principal inválido. Use o formato 00.000.000/0000-00.')
        setSaving(false)
        return
      }
      const hasMissingRazao = form.cnpjs.some((c) => c.cnpj.replace(/\D/g, '').length === 14 && !c.razao_social.trim())
      if (hasMissingRazao) {
        setFormError('Preencha a razão social de todos os CNPJs adicionais.')
        setSaving(false)
        return
      }
      let logoUrl: string | null
      try {
        logoUrl = normalizeTenantLogoUrl(form.logo_url)
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'URL da logo inválida.')
        setSaving(false)
        return
      }
      const filteredCnpjs = form.cnpjs
        .map((c) => ({ cnpj: displayCnpj(c.cnpj), razao_social: c.razao_social.trim() }))
        .filter((c) => c.cnpj.replace(/\D/g, '').length === 14)
        .filter((c) => c.razao_social.length > 0)
        .filter((c, i, arr) => arr.findIndex((x) => x.cnpj.replace(/\D/g, '') === c.cnpj.replace(/\D/g, '')) === i)
        .filter((c) => c.cnpj.replace(/\D/g, '') !== cnpjRaw)
      await upsertTenantRegistry({
        tenant_id: slug,
        display_name: form.display_name || null,
        whistleblower_enabled: form.whistleblower_enabled,
        logo_url: logoUrl,
        cnpj: cnpjRaw.length === 14 ? form.cnpj : null,
        cnpjs: filteredCnpjs,
        nicho: form.nicho || null,
        setores: form.setores.filter(Boolean),
      })
      startNew()
      await load()
      logAdminAuditAction({ action: editing ? 'tenant_registry_updated' : 'tenant_registry_created', tenantId: slug })
      setFormSuccess('Empresa salva com sucesso. Ela já aparece na lista ao lado e no dashboard.')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tid: string) => {
    const ok = await feedback.confirm({
      title: 'Excluir do registro',
      message: 'Remover esta empresa do registro? Os envios já feitos continuam no sistema.',
      confirmLabel: 'Excluir',
    })
    if (!ok) return
    try {
      await deleteTenantFromRegistry(tid)
      if (editing?.tenant_id === tid) startNew()
      load()
      logAdminAuditAction({ action: 'tenant_registry_deleted', tenantId: tid })
      feedback.success('Empresa removida do registro.')
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Erro ao remover.')
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
                    'flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/55 px-4 py-3 transition',
                    editing?.tenant_id === item.tenant_id
                      ? 'border-[var(--color-brand-300)] ring-2 ring-[var(--color-brand-200)]'
                      : 'hover:border-[var(--color-brand-200)]'
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <TenantLogoAvatar
                      logoUrl={item.logo_url}
                      label={item.display_name || item.tenant_id}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--color-brand-900)] truncate">{item.display_name || item.tenant_id}</p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{item.tenant_id}</p>
                    </div>
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
          <div className="mb-3">
            <span className="inline-flex rounded-full border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] px-2.5 py-1 text-xs font-semibold text-[var(--color-brand-700)]">
              Cadastro
            </span>
          </div>
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-brand-900)]">
            {editing ? 'Editar empresa' : 'Nova empresa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/40 p-4">
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
                className="input-escritorio w-full rounded-xl border border-[var(--color-brand-200)] bg-white px-4 py-2.5 text-sm focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]"
              />
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/40 p-4">
              <label htmlFor="emp-tenant_id" className="mb-1 block text-sm font-medium text-[var(--color-brand-700)]">
                Identificador (slug) *
              </label>
              <input
                id="emp-tenant_id"
                type="text"
                value={computedSlug}
                placeholder="ex: empresa-alpha"
                required
                readOnly
                className="input-escritorio w-full rounded-xl border border-[var(--color-brand-200)] bg-[var(--color-brand-100)] px-4 py-2.5 text-sm text-[var(--color-brand-700)]"
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Gerado automaticamente pelo sistema a partir do nome de exibição.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/40 p-4">
              <label className="flex items-start gap-3 text-sm text-[var(--color-brand-700)]">
                <input
                  type="checkbox"
                  checked={form.whistleblower_enabled}
                  onChange={(e) => setForm((f) => ({ ...f, whistleblower_enabled: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--color-brand-300)] text-[var(--color-brand-700)] focus:ring-[var(--color-brand-300)]"
                />
                <span>
                  <span className="block font-medium text-slate-800">Disponibilizar canal de denúncias</span>
                  <span className="block text-xs text-slate-500">
                    Quando desmarcado, a empresa não aparece na busca pública e o link do canal fica indisponível.
                  </span>
                </span>
              </label>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/40 p-4">
              <label htmlFor="emp-logo-url" className="mb-1 block text-sm font-medium text-[var(--color-brand-700)]">
                Logomarca (opcional)
              </label>
              <p className="mb-3 text-xs text-[var(--muted-foreground)]">
                Cole uma URL <code className="rounded bg-white px-1">https://…</code> ou envie uma imagem (máx. 2 MB). Aparece na lista do painel, na busca de denúncias e no hub da empresa.
              </p>
              <div className="flex flex-wrap items-start gap-4">
                <TenantLogoAvatar
                  logoUrl={form.logo_url || null}
                  label={form.display_name || computedSlug || 'Empresa'}
                  size="lg"
                  rounded="xl"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    id="emp-logo-url"
                    type="url"
                    inputMode="url"
                    value={form.logo_url}
                    onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
                    placeholder="https://exemplo.com/logo.png"
                    className="input-escritorio w-full rounded-xl border border-[var(--color-brand-200)] bg-white px-4 py-2.5 text-sm focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-brand-200)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-brand-700)] transition hover:bg-[var(--color-brand-50)]">
                      <ImageUp className="h-4 w-4" aria-hidden />
                      {logoUploading ? 'Enviando…' : 'Enviar imagem'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="sr-only"
                        disabled={logoUploading || saving}
                        onChange={handleLogoFile}
                      />
                    </label>
                    {form.logo_url.trim() !== '' && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, logo_url: '' }))}
                        className="text-sm font-medium text-slate-600 underline decoration-slate-300 hover:text-slate-900"
                      >
                        Limpar logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/40 p-4">
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
                className="w-full rounded-xl border border-[var(--color-brand-200)] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-brand-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              />
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/40 p-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Outros CNPJs (grupo de empresas)
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  value={newRazaoSocial}
                  onChange={(e) => setNewRazaoSocial(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCnpj())}
                  placeholder="Razão social"
                  className={cn(
                    'rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2',
                    newRazaoSocial.trim().length === 0
                      ? 'border-[var(--color-brand-200)] focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]'
                      : 'border-[var(--color-brand-400)] focus:border-[var(--color-brand-500)] focus:ring-[var(--color-brand-200)]'
                  )}
                />
                <input
                  type="text"
                  value={newCnpj}
                  onChange={(e) => setNewCnpj(maskCnpj(e.target.value).masked)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCnpj())}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className={cn(
                    'flex-1 rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2',
                    maskCnpj(newCnpj).raw.length === 14
                      ? 'border-[var(--color-brand-400)] focus:border-[var(--color-brand-500)] focus:ring-[var(--color-brand-200)]'
                      : 'border-[var(--color-brand-200)] focus:border-[var(--color-brand-400)] focus:ring-[var(--color-brand-200)]'
                  )}
                />
                <button
                  type="button"
                  onClick={addCnpj}
                  disabled={!canAddGroupCnpj}
                  className={cn(
                    'rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:col-span-2',
                    canAddGroupCnpj
                      ? 'border border-[var(--color-brand-700)] bg-[var(--color-brand-700)] text-white hover:bg-[var(--color-brand-800)]'
                      : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                  )}
                >
                  Adicionar
                </button>
              </div>
              <p className={cn('mt-1 text-xs', canAddGroupCnpj ? 'text-[var(--color-brand-700)]' : 'text-slate-500')}>
                {canAddGroupCnpj
                  ? 'Tudo certo: clique em "Adicionar" para incluir este CNPJ.'
                  : 'Para adicionar, preencha a razão social e um CNPJ válido.'}
              </p>
              {form.cnpjs.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {form.cnpjs.map((c, i) => (
                    <li key={i} className="flex items-start justify-between gap-2 rounded-lg border border-[var(--color-brand-200)] bg-white px-3 py-2 text-sm text-slate-700">
                      <div className="min-w-0">
                        <p className="font-mono">{c.cnpj}</p>
                        <p className="truncate text-xs text-slate-500">{c.razao_social || 'Razão social não informada'}</p>
                      </div>
                      <button type="button" onClick={() => removeCnpj(i)} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/40 p-4">
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
                        ? 'border-[var(--color-brand-700)] bg-[var(--color-brand-700)] text-white'
                        : 'border-[var(--color-brand-200)] bg-white text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--color-brand-50)]/40 p-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Opções de setor (formulário de diagnóstico)
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Lista usada no passo de identificação do diagnóstico. Se vazia, usa a lista padrão.
              </p>
              <button
                type="button"
                onClick={useDefaultSetores}
                className="mb-2 rounded-xl border border-[var(--color-brand-200)] bg-[var(--color-brand-100)] px-4 py-2.5 text-sm font-medium text-[var(--color-brand-700)] hover:bg-[var(--color-brand-200)]"
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
                  className="flex-1 rounded-xl border border-[var(--color-brand-200)] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--color-brand-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
                />
                <button type="button" onClick={addSetor} className="rounded-xl border border-[var(--color-brand-200)] bg-[var(--color-brand-100)] px-4 py-2.5 text-sm font-medium text-[var(--color-brand-700)] hover:bg-[var(--color-brand-200)]">
                  Adicionar
                </button>
              </div>
              {form.setores.length > 0 && (
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {form.setores.map((s, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-brand-200)] bg-white px-3 py-2 text-sm text-slate-700">
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
                disabled={saving || !computedSlug.trim()}
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
            {(formError || formSuccess) && (
              <div
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm',
                  formError
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-[var(--color-brand-200)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                )}
              >
                {formError || formSuccess}
              </div>
            )}
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
