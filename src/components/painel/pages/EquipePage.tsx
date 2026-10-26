import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Check, Eye, EyeOff, KeyRound, Loader2, Pencil, Plus, Power, PowerOff, Trash2, UserPlus, Users, X } from 'lucide-react'
import { feedback } from '@/lib/feedback'
import { cn } from '@/lib/utils'
import { logAdminAuditAction } from '@/services/api/audit'
import {
  DEPARTMENT_NAME_MAX,
  createDepartment,
  createMember,
  deleteDepartment,
  deleteMember,
  departmentNameError,
  getDepartments,
  getTeam,
  normalizeDepartmentName,
  renameDepartment,
  setDepartmentActive,
  updateMember,
  type Department,
  type TeamMember,
} from '@/types/equipe'
import { usePainel } from '../PainelContext'
import { paths, type EquipeTab } from '../router'
import { Button, EmptyState, Field, Notice, PageHeader, PainelLink, Panel, Skeleton, StatusPill, TabNav, inputCls, pluralize } from '../ui'

/** Senha provisória: o Supabase Auth exige no mínimo 6 caracteres. */
const PROVISIONAL_MIN = 6
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback)

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

/** Equipe do escritório: pessoas com login no painel e a lista de departamentos (sem campo livre). */
export function EquipePage({ tab }: { tab: EquipeTab }) {
  const { profile, refreshProfile } = usePainel()
  const [team, setTeam] = useState<TeamMember[] | null>(null)
  const [departments, setDepartments] = useState<Department[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const reload = useCallback(async () => {
    try {
      const [t, d] = await Promise.all([getTeam(), getDepartments()])
      setTeam(t)
      setDepartments(d)
      setError(null)
    } catch (err) {
      setTeam((v) => v ?? [])
      setDepartments((v) => v ?? [])
      setError(errorMessage(err, 'Não foi possível carregar a equipe.'))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const p of team ?? []) if (p.department) m[p.department] = (m[p.department] ?? 0) + 1
    return m
  }, [team])

  /** Mudanças que podem atingir o próprio perfil (departamento renomeado, por exemplo). */
  const reloadAll = useCallback(async () => {
    await reload()
    refreshProfile()
  }, [reload, refreshProfile])

  const loading = team === null || departments === null

  return (
    <>
      <PageHeader
        title="Equipe"
        description="Pessoas do escritório com acesso ao painel. Colaboradores das empresas não têm login: usam só os links públicos."
        actions={
          tab === 'pessoas' && !creating ? (
            <Button type="button" onClick={() => setCreating(true)} disabled={loading}>
              <UserPlus />
              Cadastrar pessoa
            </Button>
          ) : undefined
        }
      />

      <TabNav
        label="Seções da equipe"
        items={[
          { label: 'Pessoas', to: paths.equipe('pessoas'), active: tab === 'pessoas', count: team?.length },
          { label: 'Departamentos', to: paths.equipe('departamentos'), active: tab === 'departamentos', count: departments?.length },
        ]}
      />

      {error && (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      )}

      {loading ? (
        <Panel padded={false}>
          <ul className="divide-y divide-[var(--border)]">
            {[0, 1, 2].map((i) => (
              <li key={i} className="px-5 py-4">
                <Skeleton className="h-10 w-full" />
              </li>
            ))}
          </ul>
        </Panel>
      ) : tab === 'pessoas' ? (
        <div className="space-y-6">
          {creating && (
            <NovaPessoa
              departments={departments}
              existingEmails={team.map((p) => p.email.toLowerCase())}
              onCancel={() => setCreating(false)}
              onCreated={async () => {
                setCreating(false)
                await reload()
              }}
            />
          )}
          <Pessoas team={team} departments={departments} meId={profile.id} onChanged={reloadAll} />
        </div>
      ) : (
        <Departamentos departments={departments} counts={counts} onChanged={reloadAll} />
      )}
    </>
  )
}

// ---------- Pessoas ----------

function NovaPessoa({
  departments,
  existingEmails,
  onCancel,
  onCreated,
}: {
  departments: Department[]
  existingEmails: string[]
  onCancel: () => void
  onCreated: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'department' | 'password', string>>>({})
  const [saving, setSaving] = useState(false)
  const active = departments.filter((d) => d.active)
  const idp = useId()

  const validate = () => {
    const e: typeof errors = {}
    if (name.trim().replace(/\s+/g, ' ').length < 3) e.name = 'Informe o nome completo.'
    const mail = email.trim().toLowerCase()
    if (!EMAIL_RE.test(mail)) e.email = 'Informe um e-mail válido.'
    else if (existingEmails.includes(mail)) e.email = 'Já existe uma pessoa com este e-mail.'
    if (!department) e.department = 'Escolha o departamento.'
    if (password.length < PROVISIONAL_MIN) e.password = `A senha provisória precisa de pelo menos ${PROVISIONAL_MIN} caracteres.`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await createMember({ name, email, department, password })
      logAdminAuditAction({ action: 'team_member_created', details: { email: email.trim().toLowerCase(), department } })
      feedback.success('Cadastro criado. Envie o e-mail e a senha provisória para a pessoa: ela vai criar a própria senha ao entrar.')
      await onCreated()
    } catch (err) {
      feedback.error(errorMessage(err, 'Não foi possível cadastrar a pessoa.'))
      setSaving(false)
    }
  }

  return (
    <Panel title="Cadastrar pessoa" description="Ela entra com a senha provisória uma única vez e é obrigada a criar uma senha própria antes de ver qualquer dado.">
      {active.length === 0 ? (
        <Notice
          tone="warning"
          action={
            <Button asChild variant="outline" size="sm">
              <PainelLink to={paths.equipe('departamentos')}>Ir para departamentos</PainelLink>
            </Button>
          }
        >
          Não há departamento ativo. Cadastre ou reative um departamento antes de cadastrar pessoas.
        </Notice>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" htmlFor={`${idp}-nome`} error={errors.name}>
            <input id={`${idp}-nome`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" className={inputCls} aria-invalid={Boolean(errors.name)} autoFocus />
          </Field>
          <Field label="E-mail" htmlFor={`${idp}-email`} error={errors.email}>
            <input
              id={`${idp}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              className={inputCls}
              aria-invalid={Boolean(errors.email)}
            />
          </Field>
          <Field label="Departamento" htmlFor={`${idp}-depto`} error={errors.department}>
            <select
              id={`${idp}-depto`}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={inputCls}
              aria-invalid={Boolean(errors.department)}
            >
              <option value="" disabled>
                Escolha o departamento
              </option>
              {active.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Senha provisória"
            htmlFor={`${idp}-senha`}
            error={errors.password}
            hint={`Pelo menos ${PROVISIONAL_MIN} caracteres. Vale só para o primeiro acesso.`}
          >
            <div className="relative">
              <input
                id={`${idp}-senha`}
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className={cn(inputCls, 'pr-11')}
                aria-invalid={Boolean(errors.password)}
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
          </Field>
          <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <UserPlus />}
              Cadastrar pessoa
            </Button>
          </div>
        </form>
      )}
    </Panel>
  )
}

function Pessoas({ team, departments, meId, onChanged }: { team: TeamMember[]; departments: Department[]; meId: string; onChanged: () => Promise<void> }) {
  const [busyId, setBusyId] = useState<string | null>(null)

  const run = async (m: TeamMember, action: () => Promise<void>, success: string, audit: { action: string; details?: Record<string, string | boolean> }) => {
    setBusyId(m.id)
    try {
      await action()
      logAdminAuditAction({ action: audit.action, details: { email: m.email, ...audit.details } })
      feedback.success(success)
      await onChanged()
    } catch (err) {
      feedback.error(errorMessage(err, 'Não foi possível salvar a alteração.'))
    } finally {
      setBusyId(null)
    }
  }

  const mudarDepartamento = (m: TeamMember, department: string) =>
    run(m, () => updateMember(m.id, { department }), `${m.name} agora está em ${department}.`, { action: 'team_member_department', details: { department } })

  const exigirSenha = async (m: TeamMember) => {
    const ok = await feedback.confirm({
      title: 'Exigir nova senha',
      message: `${m.name} vai precisar criar uma senha nova antes de voltar a ver os dados do painel. Se estiver com o painel aberto agora, perde o acesso aos dados até trocar a senha.`,
      confirmLabel: 'Exigir nova senha',
    })
    if (ok) await run(m, () => updateMember(m.id, { requirePasswordChange: true }), 'Pronto: a troca de senha será exigida no próximo acesso.', { action: 'team_member_password_reset_required' })
  }

  const alternarAcesso = async (m: TeamMember) => {
    if (m.isActive) {
      const ok = await feedback.confirm({
        title: 'Desativar acesso',
        message: `${m.name} não vai mais conseguir entrar no painel. O cadastro continua e pode ser reativado depois.`,
        confirmLabel: 'Desativar',
      })
      if (!ok) return
    }
    await run(m, () => updateMember(m.id, { isActive: !m.isActive }), m.isActive ? 'Acesso desativado.' : 'Acesso reativado.', {
      action: m.isActive ? 'team_member_deactivated' : 'team_member_activated',
    })
  }

  const excluir = async (m: TeamMember) => {
    const ok = await feedback.confirm({
      title: 'Excluir pessoa',
      message: `O login de ${m.name} será excluído de vez. Se a ideia é só bloquear o acesso, use “Desativar”. Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
    })
    if (ok) await run(m, () => deleteMember(m.authId), 'Pessoa excluída.', { action: 'team_member_deleted' })
  }

  if (team.length === 0) {
    return (
      <Panel>
        <EmptyState icon={<Users className="h-6 w-6" />} title="Ninguém cadastrado ainda" description="Cadastre as pessoas do escritório que vão usar o painel." />
      </Panel>
    )
  }

  return (
    <Panel padded={false}>
      <ul className="divide-y divide-[var(--border)]">
        {team.map((m) => {
          const me = m.id === meId
          const busy = busyId === m.id
          return (
            <li key={m.id} className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4', !m.isActive && 'bg-[var(--color-brand-50)]/60')}>
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-sm font-semibold text-[var(--color-brand-700)]" aria-hidden>
                  {initials(m.name)}
                </span>
              )}
              <div className="min-w-0 flex-1 basis-56">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-[var(--color-brand-900)]">
                  <span className={cn(!m.isActive && 'text-[var(--color-brand-600)]')}>{m.name}</span>
                  {me && <StatusPill tone="neutral">Você</StatusPill>}
                  {!m.isActive && <StatusPill tone="danger">Acesso desativado</StatusPill>}
                  {m.isActive && m.requiresPasswordChange && <StatusPill tone="warning">Troca de senha pendente</StatusPill>}
                </p>
                <p className="truncate text-sm text-[var(--color-brand-700)]">{m.email}</p>
              </div>
              <DepartmentSelect member={m} departments={departments} disabled={busy} onChange={(d) => mudarDepartamento(m, d)} />
              <div className="ml-auto flex w-[7.5rem] shrink-0 items-center justify-end gap-1">
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-brand-600)]" aria-label="Salvando" />
                ) : (
                  !me && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        onClick={() => exigirSenha(m)}
                        disabled={m.requiresPasswordChange || !m.isActive}
                        title={m.requiresPasswordChange ? 'A troca de senha já está pendente' : 'Exigir nova senha'}
                        aria-label={`Exigir nova senha de ${m.name}`}
                      >
                        <KeyRound />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        onClick={() => alternarAcesso(m)}
                        title={m.isActive ? 'Desativar acesso' : 'Reativar acesso'}
                        aria-label={`${m.isActive ? 'Desativar' : 'Reativar'} acesso de ${m.name}`}
                      >
                        {m.isActive ? <PowerOff /> : <Power />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        onClick={() => excluir(m)}
                        className="hover:bg-[var(--color-error-50)] hover:text-[var(--color-error-700)]"
                        title="Excluir"
                        aria-label={`Excluir ${m.name}`}
                      >
                        <Trash2 />
                      </Button>
                    </>
                  )
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

/** Sempre uma escolha da lista: departamentos ativos, mais o atual da pessoa se ele estiver desativado. */
function DepartmentSelect({ member, departments, disabled, onChange }: { member: TeamMember; departments: Department[]; disabled: boolean; onChange: (name: string) => void }) {
  const options = departments.filter((d) => d.active || d.name === member.department)
  const known = member.department == null || options.some((d) => d.name === member.department)
  return (
    <select
      value={member.department ?? ''}
      onChange={(e) => e.target.value && e.target.value !== member.department && onChange(e.target.value)}
      disabled={disabled}
      aria-label={`Departamento de ${member.name}`}
      className={cn(inputCls, 'w-full sm:w-56', !member.department && 'text-[var(--color-warning-700)]')}
    >
      {!member.department && (
        <option value="" disabled>
          Sem departamento: escolha
        </option>
      )}
      {!known && <option value={member.department ?? ''}>{member.department}</option>}
      {options.map((d) => (
        <option key={d.id} value={d.name}>
          {d.active ? d.name : `${d.name} (desativado)`}
        </option>
      ))}
    </select>
  )
}

// ---------- Departamentos ----------

function Departamentos({ departments, counts, onChanged }: { departments: Department[]; counts: Record<string, number>; onChanged: () => Promise<void> }) {
  const [novo, setNovo] = useState('')
  const [novoError, setNovoError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<{ id: string; name: string; error: string | null } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const idp = useId()

  const adicionar = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const err = departmentNameError(novo, departments)
    setNovoError(err)
    if (err) return
    setAdding(true)
    try {
      const d = await createDepartment(novo)
      logAdminAuditAction({ action: 'department_created', details: { department: d.name } })
      feedback.success(`Departamento “${d.name}” criado.`)
      setNovo('')
      await onChanged()
    } catch (e) {
      setNovoError(errorMessage(e, 'Não foi possível criar o departamento.'))
    } finally {
      setAdding(false)
    }
  }

  const run = async (d: Department, action: () => Promise<void>, success: string, audit: { action: string; details?: Record<string, string | boolean> }) => {
    setBusyId(d.id)
    try {
      await action()
      logAdminAuditAction({ action: audit.action, details: { department: d.name, ...audit.details } })
      feedback.success(success)
      await onChanged()
      return true
    } catch (e) {
      feedback.error(errorMessage(e, 'Não foi possível alterar o departamento.'))
      return false
    } finally {
      setBusyId(null)
    }
  }

  const salvarNome = async () => {
    if (!editing) return
    const d = departments.find((x) => x.id === editing.id)
    if (!d) return setEditing(null)
    const name = normalizeDepartmentName(editing.name)
    if (name === d.name) return setEditing(null)
    const err = departmentNameError(name, departments, d.id)
    if (err) return setEditing({ ...editing, error: err })
    const n = counts[d.name] ?? 0
    const ok = await run(d, () => renameDepartment(d.id, name), n > 0 ? `Renomeado. ${pluralize(n, 'pessoa atualizada', 'pessoas atualizadas')}.` : 'Departamento renomeado.', {
      action: 'department_renamed',
      details: { to: name },
    })
    if (ok) setEditing(null)
  }

  const alternar = (d: Department) =>
    run(
      d,
      () => setDepartmentActive(d.id, !d.active),
      d.active ? `“${d.name}” desativado: não aparece mais nas escolhas. Quem já está nele continua.` : `“${d.name}” reativado.`,
      { action: d.active ? 'department_deactivated' : 'department_activated' }
    )

  const excluir = async (d: Department) => {
    const ok = await feedback.confirm({
      title: 'Excluir departamento',
      message: `“${d.name}” sai da lista de vez. Se só não deve mais ser usado, prefira desativar.`,
      confirmLabel: 'Excluir',
    })
    if (ok) await run(d, () => deleteDepartment(d.id), 'Departamento excluído.', { action: 'department_deleted' })
  }

  return (
    <Panel
      padded={false}
      title="Departamentos"
      description="É a lista usada no cadastro da equipe. Renomear atualiza todas as pessoas do departamento; desativar tira das escolhas sem mexer em quem já está nele."
    >
      <form onSubmit={adicionar} noValidate className="border-b border-[var(--border)] px-5 py-4">
        <label htmlFor={`${idp}-novo`} className="mb-1.5 block text-sm font-medium text-[var(--color-brand-900)]">
          Novo departamento
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id={`${idp}-novo`}
            value={novo}
            onChange={(e) => {
              setNovo(e.target.value)
              if (novoError) setNovoError(null)
            }}
            maxLength={DEPARTMENT_NAME_MAX}
            placeholder="Ex.: Tributário"
            autoComplete="off"
            className={cn(inputCls, 'min-w-0 flex-1 basis-60')}
            aria-invalid={Boolean(novoError)}
            aria-describedby={novoError ? `${idp}-novo-erro` : undefined}
          />
          <Button type="submit" disabled={adding}>
            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
            Adicionar
          </Button>
        </div>
        {novoError && (
          <p id={`${idp}-novo-erro`} className="mt-1.5 text-xs text-[var(--color-error-700)]" role="alert">
            {novoError}
          </p>
        )}
      </form>

      {departments.length === 0 ? (
        <EmptyState title="Nenhum departamento" description="Adicione os departamentos do escritório para poder cadastrar pessoas." />
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {departments.map((d) => {
            const n = counts[d.name] ?? 0
            const busy = busyId === d.id
            const isEditing = editing?.id === d.id
            return (
              <li key={d.id} className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3', !d.active && 'bg-[var(--color-brand-50)]/60')}>
                {isEditing ? (
                  <form
                    className="min-w-0 flex-1 basis-64"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void salvarNome()
                    }}
                  >
                    <div className="flex gap-2">
                      <input
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value, error: null })}
                        onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}
                        maxLength={DEPARTMENT_NAME_MAX}
                        aria-label={`Novo nome para ${d.name}`}
                        aria-invalid={Boolean(editing.error)}
                        className={cn(inputCls, 'min-w-0 flex-1')}
                        autoFocus
                        disabled={busy}
                      />
                      <Button type="submit" variant="ghost" size="iconSm" className="h-9 w-9" disabled={busy} aria-label="Salvar nome" title="Salvar">
                        {busy ? <Loader2 className="animate-spin" /> : <Check />}
                      </Button>
                      <Button type="button" variant="ghost" size="iconSm" className="h-9 w-9" onClick={() => setEditing(null)} disabled={busy} aria-label="Cancelar" title="Cancelar">
                        <X />
                      </Button>
                    </div>
                    {editing.error && (
                      <p className="mt-1.5 text-xs text-[var(--color-error-700)]" role="alert">
                        {editing.error}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-[var(--color-brand-900)]">
                      <span className={cn(!d.active && 'text-[var(--color-brand-600)]')}>{d.name}</span>
                      {!d.active && <StatusPill tone="neutral">Desativado</StatusPill>}
                    </p>
                    <p className="text-sm text-[var(--color-brand-700)]">{n === 0 ? 'Ninguém neste departamento' : pluralize(n, 'pessoa', 'pessoas')}</p>
                  </div>
                )}
                {!isEditing && (
                  <div className="flex shrink-0 items-center gap-1">
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-brand-600)]" aria-label="Salvando" />
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="iconSm"
                          onClick={() => setEditing({ id: d.id, name: d.name, error: null })}
                          title="Renomear"
                          aria-label={`Renomear ${d.name}`}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="iconSm"
                          onClick={() => alternar(d)}
                          title={d.active ? 'Desativar' : 'Reativar'}
                          aria-label={`${d.active ? 'Desativar' : 'Reativar'} ${d.name}`}
                        >
                          {d.active ? <PowerOff /> : <Power />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="iconSm"
                          onClick={() =>
                            n > 0
                              ? feedback.info(`Há ${pluralize(n, 'pessoa', 'pessoas')} em “${d.name}”. Mude o departamento ${n === 1 ? 'dela' : 'delas'} antes de excluir, ou só desative.`)
                              : excluir(d)
                          }
                          aria-disabled={n > 0}
                          className={cn('hover:bg-[var(--color-error-50)] hover:text-[var(--color-error-700)]', n > 0 && 'opacity-50')}
                          title={n > 0 ? 'Há pessoas neste departamento' : 'Excluir'}
                          aria-label={`Excluir ${d.name}`}
                        >
                          <Trash2 />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
