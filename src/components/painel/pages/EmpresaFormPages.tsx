import { useEffect, useState } from 'react'
import { ImageUp, Loader2, Plus, Trash2, X } from 'lucide-react'
import { upsertTenantRegistry, deleteTenantFromRegistry, type TenantGroupCnpj, type TenantRegistryItem } from '@/types/submission'
import { logAdminAuditAction } from '@/services/api/audit'
import { slugify, maskCnpj, formatCnpjDisplay } from '@/lib/masks'
import { SETORES } from '@/data/opcoes'
import { feedback } from '@/lib/feedback'
import { cn } from '@/lib/utils'
import { uploadTenantLogoFile, normalizeTenantLogoUrl } from '@/lib/tenantLogoStorage'
import { TenantLogoAvatar } from '@/components/TenantLogoAvatar'
import { usePainel, companyName } from '../PainelContext'
import { navigate, paths, useSearchParam } from '../router'
import { Button, Field, PageHeader, PainelLink, Panel, Switch, inputCls } from '../ui'

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
  display_name: string
  tenant_id: string
  logo_url: string
  cnpj: string
  cnpjs: TenantGroupCnpj[]
  nicho: string
  setores: string[]
  active: boolean
  whistleblower_enabled: boolean
}

function displayCnpj(value: string): string {
  const { raw, masked } = maskCnpj(value)
  return raw.length === 14 ? masked : value
}

function toForm(item: TenantRegistryItem): FormState {
  const cnpj = item.cnpj ?? ''
  return {
    display_name: item.display_name ?? '',
    tenant_id: item.tenant_id,
    logo_url: item.logo_url ?? '',
    cnpj: cnpj.replace(/\D/g, '').length === 14 ? formatCnpjDisplay(cnpj) : cnpj,
    cnpjs: (item.cnpjs ?? [])
      .map((e) => (typeof e === 'string' ? { cnpj: displayCnpj(e), razao_social: '' } : { cnpj: displayCnpj(e.cnpj ?? ''), razao_social: (e.razao_social ?? '').trim() }))
      .filter((e) => e.cnpj.replace(/\D/g, '').length > 0),
    nicho: item.nicho ?? '',
    setores: item.setores ?? [],
    active: item.active,
    whistleblower_enabled: item.whistleblower_enabled,
  }
}

export function EmpresaNovaPage() {
  const prefillSlug = useSearchParam('slug')
  const initial: FormState = {
    display_name: '',
    tenant_id: prefillSlug ?? '',
    logo_url: '',
    cnpj: '',
    cnpjs: [],
    nicho: '',
    setores: [...SETORES],
    active: true,
    whistleblower_enabled: true,
  }
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Empresas', to: paths.empresas() }, { label: 'Nova empresa' }]}
        title="Nova empresa"
        description="Depois de criar, a empresa ganha o link do diagnóstico NR-1 e do canal de denúncias, e você já pode criar pesquisas para ela."
      />
      <EmpresaForm mode="nova" initial={initial} lockedSlug={prefillSlug} />
    </>
  )
}

export function EmpresaConfiguracoesPage({ slug }: { slug: string }) {
  const { companyBySlug } = usePainel()
  const company = companyBySlug(slug)
  if (!company) return null
  const name = companyName(company, slug)
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Empresas', to: paths.empresas() }, { label: name, to: paths.empresa(slug) }, { label: 'Configurações' }]}
        title="Configurações"
        description="Dados cadastrais, marca, setores do diagnóstico e módulos ativos desta empresa."
      />
      <EmpresaForm key={slug} mode="editar" initial={toForm(company)} extra={<DangerZone slug={slug} name={name} />} />
    </>
  )
}

function EmpresaForm({
  mode,
  initial,
  lockedSlug,
  extra,
}: {
  mode: 'nova' | 'editar'
  initial: FormState
  lockedSlug?: string | null
  /** Conteúdo após as seções (ex.: zona de risco), antes da barra de salvar. */
  extra?: React.ReactNode
}) {
  const { reloadCompanies, companyBySlug } = usePainel()
  const [form, setForm] = useState<FormState>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [newSetor, setNewSetor] = useState('')
  const [newCnpj, setNewCnpj] = useState('')
  const [newRazao, setNewRazao] = useState('')
  const isNew = mode === 'nova'
  const slug = isNew ? lockedSlug || slugify(form.display_name) : form.tenant_id
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)

  useEffect(() => {
    if (isNew || !dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty, isNew])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))
  const canAddCnpj = maskCnpj(newCnpj).raw.length === 14 && newRazao.trim().length > 0

  const addCnpj = () => {
    const { raw, masked } = maskCnpj(newCnpj)
    if (!canAddCnpj) return
    if (form.cnpjs.some((c) => c.cnpj.replace(/\D/g, '') === raw) || form.cnpj.replace(/\D/g, '') === raw) {
      feedback.info('Esse CNPJ já está na lista.')
      return
    }
    set('cnpjs', [...form.cnpjs, { cnpj: masked, razao_social: newRazao.trim() }])
    setNewCnpj('')
    setNewRazao('')
  }

  const addSetor = () => {
    const s = newSetor.trim()
    if (!s) return
    if (!form.setores.includes(s)) set('setores', [...form.setores, s])
    setNewSetor('')
  }

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!slug) {
      feedback.error('Preencha o nome da empresa antes de enviar a logo.')
      return
    }
    setLogoUploading(true)
    try {
      set('logo_url', await uploadTenantLogoFile(slug, file))
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Falha ao enviar a imagem.')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.display_name.trim() || !slug) {
      setError('Informe o nome da empresa.')
      return
    }
    if (isNew && companyBySlug(slug)) {
      setError(`Já existe uma empresa com o identificador “${slug}”. Use um nome diferente.`)
      return
    }
    const cnpjRaw = form.cnpj.replace(/\D/g, '')
    if (form.cnpj && cnpjRaw.length !== 14) {
      setError('CNPJ principal inválido. Use o formato 00.000.000/0000-00.')
      return
    }
    let logoUrl: string | null
    try {
      logoUrl = normalizeTenantLogoUrl(form.logo_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'URL da logo inválida.')
      return
    }
    setSaving(true)
    try {
      await upsertTenantRegistry({
        tenant_id: slug,
        display_name: form.display_name.trim(),
        active: form.active,
        whistleblower_enabled: form.whistleblower_enabled,
        logo_url: logoUrl,
        cnpj: cnpjRaw.length === 14 ? form.cnpj : null,
        cnpjs: form.cnpjs.filter((c) => c.cnpj.replace(/\D/g, '').length === 14 && c.cnpj.replace(/\D/g, '') !== cnpjRaw),
        nicho: form.nicho || null,
        setores: form.setores.filter(Boolean),
      })
      logAdminAuditAction({ action: isNew ? 'tenant_registry_created' : 'tenant_registry_updated', tenantId: slug })
      await reloadCompanies()
      if (isNew) {
        feedback.success('Empresa criada.')
        navigate(paths.empresa(slug))
      } else {
        feedback.success('Alterações salvas.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <Panel title="Identificação">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome da empresa" htmlFor="emp-nome">
            <input id="emp-nome" value={form.display_name} onChange={(e) => set('display_name', e.target.value)} placeholder="Empresa Alpha Ltda." required className={inputCls} />
          </Field>
          <Field
            label="Identificador"
            htmlFor="emp-slug"
            hint={isNew ? 'Gerado a partir do nome. Aparece nos links enviados aos colaboradores.' : 'Não pode ser alterado: já está nos links enviados.'}
          >
            <input id="emp-slug" value={slug} readOnly className={cn(inputCls, 'bg-[var(--color-brand-50)] font-mono')} />
          </Field>
        </div>
        <div className="mt-5 flex flex-wrap items-start gap-4 border-t border-[var(--border)] pt-5">
          <TenantLogoAvatar logoUrl={form.logo_url || null} label={form.display_name || slug || 'Empresa'} size="xl" rounded="xl" />
          <Field
            label="Logomarca"
            htmlFor="emp-logo"
            className="min-w-0 flex-1"
            hint="Cole um link https:// ou envie uma imagem de até 2 MB. Aparece no painel e nas páginas da empresa."
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="emp-logo" type="url" inputMode="url" value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://empresa.com.br/logo.png" className={inputCls} />
              <label className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--ring)]">
                {logoUploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImageUp className="h-4 w-4" aria-hidden />}
                {logoUploading ? 'Enviando…' : 'Enviar imagem'}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="sr-only" disabled={logoUploading} onChange={handleLogoFile} />
              </label>
              {form.logo_url && (
                <Button type="button" variant="ghost" onClick={() => set('logo_url', '')}>
                  Remover
                </Button>
              )}
            </div>
          </Field>
        </div>
      </Panel>

      <Panel title="Dados cadastrais">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="CNPJ principal" htmlFor="emp-cnpj">
            <input id="emp-cnpj" value={form.cnpj} onChange={(e) => set('cnpj', maskCnpj(e.target.value).masked)} placeholder="00.000.000/0000-00" maxLength={18} className={cn(inputCls, 'font-mono')} />
          </Field>
          <Field label="Nicho" htmlFor="emp-nicho">
            <select id="emp-nicho" value={form.nicho} onChange={(e) => set('nicho', e.target.value)} className={inputCls}>
              <option value="">Não informado</option>
              {NICHOS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <p className="text-sm font-medium text-[var(--color-brand-900)]">Outros CNPJs do grupo</p>
          {form.cnpjs.length > 0 && (
            <ul className="mt-2 divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
              {form.cnpjs.map((c, i) => (
                <li key={c.cnpj} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-mono">{c.cnpj}</span>
                    <span className="ml-2 text-[var(--color-brand-700)]">{c.razao_social}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => set('cnpjs', form.cnpjs.filter((_, j) => j !== i))}
                    className="rounded p-1.5 text-[var(--color-brand-600)] hover:bg-[var(--color-error-50)] hover:text-[var(--color-error-700)]"
                    aria-label={`Remover CNPJ ${c.cnpj}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_12rem_auto]">
            <input value={newRazao} onChange={(e) => setNewRazao(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCnpj())} placeholder="Razão social" aria-label="Razão social do CNPJ adicional" className={inputCls} />
            <input
              value={newCnpj}
              onChange={(e) => setNewCnpj(maskCnpj(e.target.value).masked)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCnpj())}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              aria-label="CNPJ adicional"
              className={cn(inputCls, 'font-mono')}
            />
            <Button type="button" variant="outline" onClick={addCnpj} disabled={!canAddCnpj}>
              <Plus />
              Adicionar
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Diagnóstico NR-1" description="Opções que o colaborador escolhe no passo de identificação do diagnóstico.">
        <Switch
          id="emp-active"
          checked={form.active}
          onChange={(v) => set('active', v)}
          label="Coleta aberta"
          description="Quando desligada, quem abrir o link do diagnóstico vê o aviso de coleta encerrada."
        />
        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-[var(--color-brand-900)]">Setores ({form.setores.length})</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => set('setores', [...SETORES])}>
              Restaurar lista padrão
            </Button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {form.setores.map((s) => (
              <li key={s} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--color-brand-50)] py-1 pl-3 pr-1 text-sm">
                {s}
                <button
                  type="button"
                  onClick={() => set('setores', form.setores.filter((x) => x !== s))}
                  className="rounded-full p-1 text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)] hover:text-[var(--color-brand-900)]"
                  aria-label={`Remover setor ${s}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            {form.setores.length === 0 && <li className="text-sm text-[var(--color-brand-700)]">Sem setores: o diagnóstico usará a lista padrão.</li>}
          </ul>
          <div className="mt-3 flex max-w-md gap-2">
            <input value={newSetor} onChange={(e) => setNewSetor(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSetor())} placeholder="Novo setor" aria-label="Novo setor" className={inputCls} />
            <Button type="button" variant="outline" onClick={addSetor}>
              <Plus />
              Adicionar
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Canal de denúncias">
        <Switch
          id="emp-canal"
          checked={form.whistleblower_enabled}
          onChange={(v) => set('whistleblower_enabled', v)}
          label="Canal disponível"
          description="Quando desligado, a empresa some da busca pública e o link do canal fica indisponível."
        />
      </Panel>

      {extra}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--border)] bg-white/95 backdrop-blur-sm md:left-[var(--painel-sidebar-w)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <p className={cn('text-sm', error ? 'text-[var(--color-error-700)]' : 'text-[var(--color-brand-700)]')} role={error ? 'alert' : undefined}>
            {error ?? (isNew ? 'Revise os dados e crie a empresa.' : dirty ? 'Há alterações não salvas.' : 'Tudo salvo.')}
          </p>
          <div className="flex gap-2">
            {isNew ? (
              <Button asChild variant="ghost">
                <PainelLink to={paths.empresas()}>Cancelar</PainelLink>
              </Button>
            ) : (
              dirty && (
                <Button type="button" variant="ghost" onClick={() => setForm(initial)}>
                  Descartar
                </Button>
              )
            )}
            <Button type="submit" disabled={saving || (!isNew && !dirty)}>
              {saving && <Loader2 className="animate-spin" />}
              {isNew ? 'Criar empresa' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

function DangerZone({ slug, name }: { slug: string; name: string }) {
  const { reloadCompanies } = usePainel()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    const ok = await feedback.confirm({
      title: 'Excluir empresa do cadastro',
      message: `Remover “${name}” do cadastro? Ela some do painel e dos links públicos de busca. As respostas e denúncias já registradas continuam guardadas no banco.`,
      confirmLabel: 'Excluir empresa',
      cancelLabel: 'Cancelar',
    })
    if (!ok) return
    setDeleting(true)
    try {
      await deleteTenantFromRegistry(slug)
      logAdminAuditAction({ action: 'tenant_registry_deleted', tenantId: slug })
      await reloadCompanies()
      feedback.success('Empresa removida do cadastro.')
      navigate(paths.empresas())
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível excluir.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="rounded-xl border border-[color-mix(in_srgb,var(--color-error-500)_30%,white)] bg-white p-5">
      <h2 className="font-sans text-base font-semibold text-[var(--color-error-700)]">Zona de risco</h2>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-[60ch] text-sm leading-relaxed text-[var(--color-brand-700)]">
          Excluir remove a empresa do cadastro e do painel. Respostas do diagnóstico, pesquisas e denúncias continuam guardadas no banco.
        </p>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
          Excluir empresa
        </Button>
      </div>
    </section>
  )
}
