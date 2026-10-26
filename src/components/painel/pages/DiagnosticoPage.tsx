import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BarChart3, Ban, Loader2, Lock, RotateCcw, Trash2, Users } from 'lucide-react'
import { getSubmissions, deleteSubmissions, updateTenantRegistry, type Submission } from '@/types/submission'
import { logAdminAuditAction } from '@/services/api/audit'
import { QUESTIONS, DIMENSION_DESCRIPTIONS, computeDimensionScores, aggregateDimensionScores } from '@/data/hseIt'
import { buildDiagnosticOrgUrl } from '@/lib/routes'
import { feedback } from '@/lib/feedback'
import { GraficosResultados } from '@/components/GraficosResultados'
import { Resultados } from '@/components/Resultados'
import { RelatorioConclusao } from '@/components/RelatorioConclusao'
import { usePainel, companyName } from '../PainelContext'
import { paths, setSearchParam, useSearchParam, type DiagnosticoTab } from '../router'
import { SharePanel } from '../SharePanel'
import { Button, EmptyState, Notice, PageHeader, PageSkeleton, PainelLink, Panel, StatusPill, TabNav, formatDateBR, pluralize } from '../ui'

/** Abaixo disso, o resultado de um setor fica oculto: com poucas respostas daria para deduzir quem respondeu. */
const MIN_POR_SETOR = 3

type Grupo = { key: string; setor: string; funcao: string; items: Submission[] }

function agruparPorSetor(submissions: Submission[]): Grupo[] {
  const map = new Map<string, Grupo>()
  for (const s of submissions) {
    const funcao = (s.funcao ?? '').trim()
    const key = `${s.setor.trim()}|||${funcao}`
    const g = map.get(key) ?? { key, setor: s.setor.trim(), funcao, items: [] }
    g.items.push(s)
    map.set(key, g)
  }
  return [...map.values()].sort((a, b) => a.setor.localeCompare(b.setor, 'pt-BR') || a.funcao.localeCompare(b.funcao, 'pt-BR'))
}

function hoje(): string {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function DiagnosticoPage({ slug, tab }: { slug: string; tab: DiagnosticoTab }) {
  const { companyBySlug, reloadCompanies } = usePainel()
  const company = companyBySlug(slug)
  const [submissions, setSubmissions] = useState<Submission[] | null>(null)
  const [toggling, setToggling] = useState(false)
  const setorKey = useSearchParam('setor')

  useEffect(() => {
    setSubmissions(null)
    getSubmissions(slug)
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
  }, [slug])

  const grupos = useMemo(() => agruparPorSetor(submissions ?? []), [submissions])
  const scoresEmpresa = useMemo(() => aggregateDimensionScores((submissions ?? []).map((s) => computeDimensionScores(s.answers))), [submissions])

  if (!company) return null
  const name = companyName(company, slug)
  const active = company.active

  const toggleColeta = async () => {
    if (active) {
      const ok = await feedback.confirm({
        title: 'Encerrar coleta',
        message: 'Quem abrir o link do diagnóstico verá o aviso de coleta encerrada. As respostas recebidas continuam disponíveis. Você pode reabrir quando quiser.',
        confirmLabel: 'Encerrar coleta',
        cancelLabel: 'Cancelar',
      })
      if (!ok) return
    }
    setToggling(true)
    try {
      await updateTenantRegistry(slug, { active: !active })
      logAdminAuditAction({ action: active ? 'tenant_collection_closed' : 'tenant_collection_reopened', tenantId: slug })
      await reloadCompanies()
      feedback.success(active ? 'Coleta encerrada.' : 'Coleta reaberta.')
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível atualizar.')
    } finally {
      setToggling(false)
    }
  }

  const tabs = [
    { label: 'Resultados', to: paths.diagnostico(slug), active: tab === 'resultados' },
    { label: 'Por setor', to: paths.diagnostico(slug, 'setores'), active: tab === 'setores', count: grupos.length || undefined },
    { label: 'Compartilhar', to: paths.diagnostico(slug, 'compartilhar'), active: tab === 'compartilhar' },
    { label: 'Perguntas', to: paths.diagnostico(slug, 'perguntas'), active: tab === 'perguntas' },
  ]

  const link = buildDiagnosticOrgUrl(`${window.location.origin}/`, slug)
  const semRespostas = submissions !== null && submissions.length === 0

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Empresas', to: paths.empresas() },
          { label: name, to: paths.empresa(slug) },
          { label: 'Pesquisas', to: paths.empresa(slug, 'pesquisas') },
          { label: 'Diagnóstico NR-1' },
        ]}
        title="Diagnóstico NR-1 (HSE-IT)"
        meta={<StatusPill tone={active ? 'success' : 'neutral'}>{active ? 'Coleta aberta' : 'Coleta encerrada'}</StatusPill>}
        description="Questionário de riscos psicossociais com 35 perguntas em 7 dimensões. Coleta contínua: fica aberto até você encerrar."
        actions={
          <Button type="button" variant="outline" onClick={toggleColeta} disabled={toggling}>
            {toggling ? <Loader2 className="animate-spin" /> : active ? <Ban /> : <RotateCcw />}
            {active ? 'Encerrar coleta' : 'Reabrir coleta'}
          </Button>
        }
      />
      <TabNav label="Seções do diagnóstico" items={tabs} />

      {tab === 'compartilhar' && (
        <SharePanel
          title="Link do diagnóstico"
          description="Envie aos colaboradores. Cada pessoa escolhe o setor e responde de forma anônima."
          url={link}
          fileName={`qrcode-diagnostico-${slug}`}
          emailSubject={`Diagnóstico de riscos psicossociais — ${name}`}
          emailIntro="Olá! Pedimos que você responda ao diagnóstico de riscos psicossociais (NR-1). É anônimo e leva cerca de 10 minutos:"
          unavailableReason={active ? null : 'A coleta está encerrada: quem abrir o link verá o aviso de coleta encerrada. Reabra a coleta para receber respostas.'}
        />
      )}

      {tab === 'perguntas' && <PerguntasHseIt />}

      {(tab === 'resultados' || tab === 'setores') && submissions === null && <PageSkeleton />}

      {(tab === 'resultados' || tab === 'setores') && semRespostas && (
        <Panel>
          <EmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title="Nenhuma resposta ainda"
            description="Os resultados aparecem aqui assim que os colaboradores responderem."
            action={
              <Button asChild>
                <PainelLink to={paths.diagnostico(slug, 'compartilhar')}>Pegar o link do diagnóstico</PainelLink>
              </Button>
            }
          />
        </Panel>
      )}

      {tab === 'resultados' && submissions && submissions.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-brand-700)]">
            <Users className="h-4 w-4" aria-hidden />
            <span>
              <strong className="text-[var(--color-brand-900)]">{pluralize(submissions.length, 'resposta', 'respostas')}</strong> no total ·{' '}
              {pluralize(grupos.length, 'setor', 'setores')} · última em {formatDateBR(submissions[0].submittedAt)}
            </span>
          </div>
          <GraficosResultados scores={scoresEmpresa} showDownloadChart />
          <Resultados answers={{}} setor="Empresa (agregado)" onVoltar={() => {}} isAdmin scoresOverride={scoresEmpresa} />
          <RelatorioConclusao scores={scoresEmpresa} setor="Empresa (agregado)" showCopy meta={{ empresaNome: name, totalRespostas: submissions.length, dataRelatorio: hoje() }} />
        </div>
      )}

      {tab === 'setores' && submissions && submissions.length > 0 && (
        <PorSetor
          grupos={grupos}
          selectedKey={setorKey}
          empresa={name}
          onDeleted={(ids) => setSubmissions((prev) => (prev ?? []).filter((s) => !ids.includes(s.id)))}
          slug={slug}
        />
      )}
    </>
  )
}

function PorSetor({
  grupos,
  selectedKey,
  empresa,
  slug,
  onDeleted,
}: {
  grupos: Grupo[]
  selectedKey: string | null
  empresa: string
  slug: string
  onDeleted: (ids: string[]) => void
}) {
  const selected = grupos.find((g) => g.key === selectedKey)
  const scores = useMemo(() => (selected ? aggregateDimensionScores(selected.items.map((s) => computeDimensionScores(s.answers))) : null), [selected])

  const excluir = async (g: Grupo) => {
    const label = g.funcao ? `${g.setor} · ${g.funcao}` : g.setor
    const ok = await feedback.confirm({
      title: 'Excluir respostas do setor',
      message: `Excluir ${pluralize(g.items.length, 'resposta', 'respostas')} de “${label}”? Use para remover testes. Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
    })
    if (!ok) return
    try {
      const ids = g.items.map((s) => s.id)
      await deleteSubmissions(ids, slug)
      logAdminAuditAction({ action: 'diagnostico_responses_deleted', tenantId: slug, details: { total: ids.length } })
      onDeleted(ids)
      setSearchParam('setor', null)
      feedback.success('Respostas excluídas.')
    } catch (err) {
      feedback.error(err instanceof Error ? err.message : 'Não foi possível excluir.')
    }
  }

  if (selected && scores && selected.items.length >= MIN_POR_SETOR) {
    const label = selected.funcao ? `${selected.setor} · ${selected.funcao}` : selected.setor
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => setSearchParam('setor', null)}>
            <ArrowLeft />
            Todos os setores
          </Button>
          <p className="text-sm text-[var(--color-brand-700)]">
            <strong className="text-[var(--color-brand-900)]">{label}</strong> · média de {pluralize(selected.items.length, 'resposta', 'respostas')}
          </p>
        </div>
        <GraficosResultados scores={scores} showDownloadChart />
        <Resultados answers={{}} setor={label} onVoltar={() => setSearchParam('setor', null)} isAdmin scoresOverride={scores} />
        <RelatorioConclusao scores={scores} setor={label} showCopy meta={{ empresaNome: empresa, totalRespostas: selected.items.length, dataRelatorio: hoje() }} />
      </div>
    )
  }

  return (
    <Panel padded={false} title="Resultados por setor" description={`Setores com menos de ${MIN_POR_SETOR} respostas ficam ocultos para proteger o anonimato; eles continuam contando no total da empresa.`}>
      <ul className="divide-y divide-[var(--border)]">
        {grupos.map((g) => {
          const label = g.funcao ? `${g.setor} · ${g.funcao}` : g.setor
          const visivel = g.items.length >= MIN_POR_SETOR
          return (
            <li key={g.key} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--color-brand-900)]">{label}</p>
                <p className="text-xs text-[var(--color-brand-700)]">
                  {pluralize(g.items.length, 'resposta', 'respostas')} · última em {formatDateBR(g.items[0].submittedAt)}
                </p>
              </div>
              {visivel ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setSearchParam('setor', g.key)}>
                  Ver resultado
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-brand-600)]">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  Oculto (menos de {MIN_POR_SETOR})
                </span>
              )}
              <Button type="button" variant="ghost" size="iconSm" onClick={() => excluir(g)} aria-label={`Excluir respostas de ${label}`}>
                <Trash2 />
              </Button>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

function PerguntasHseIt() {
  const dimensoes = useMemo(() => {
    const map = new Map<string, { label: string; id: string; perguntas: typeof QUESTIONS }>()
    for (const q of QUESTIONS) {
      const d = map.get(q.dimensionId) ?? { label: q.dimensionLabel, id: q.dimensionId, perguntas: [] }
      d.perguntas.push(q)
      map.set(q.dimensionId, d)
    }
    return [...map.values()]
  }, [])

  return (
    <div className="space-y-6">
      <Notice tone="neutral">
        <span className="inline-flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          Instrumento HSE-IT validado: as perguntas não podem ser editadas, para manter a metodologia e a comparação entre empresas.
        </span>
      </Notice>
      {dimensoes.map((d) => (
        <Panel key={d.id} title={d.label} description={DIMENSION_DESCRIPTIONS[d.id as keyof typeof DIMENSION_DESCRIPTIONS]}>
          <ol className="space-y-2">
            {d.perguntas.map((q) => (
              <li key={q.id} className="flex gap-3 text-sm leading-relaxed">
                <span className="w-6 shrink-0 text-right font-mono text-xs leading-6 text-[var(--color-brand-600)]">{q.id}</span>
                <span className="text-[var(--color-brand-900)]">{q.text}</span>
              </li>
            ))}
          </ol>
        </Panel>
      ))}
    </div>
  )
}
