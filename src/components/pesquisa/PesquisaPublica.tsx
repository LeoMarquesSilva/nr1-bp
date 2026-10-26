import { useEffect, useState } from 'react'
import { Lock, SearchX } from 'lucide-react'
import { getPublicSurvey, submitSurveyResponse, type PublicSurvey } from '@/types/pesquisas'
import { buildDenunciaUrl } from '@/lib/routes'
import { SurveyRespondent, StatusCard } from './SurveyRespondent'

/** Página pública de uma pesquisa interna: /pesquisa/<id>. */
export function PesquisaPublica({ surveyId }: { surveyId: string }) {
  const [survey, setSurvey] = useState<PublicSurvey | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    getPublicSurvey(surveyId).then((s) => {
      if (!cancelled) setSurvey(s)
    })
    return () => {
      cancelled = true
    }
  }, [surveyId])

  useEffect(() => {
    if (survey?.title) document.title = `${survey.title} | Confiara`
  }, [survey?.title])

  if (survey === undefined) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-400)] border-t-transparent motion-reduce:animate-none" aria-label="Carregando" />
      </div>
    )
  }

  if (survey === null) {
    return (
      <StatusCard icon={<SearchX className="h-10 w-10" />} title="Pesquisa não encontrada">
        Confira se o link está completo. Se recebeu este link agora, fale com quem o enviou.
      </StatusCard>
    )
  }

  if (survey.status !== 'aberta') {
    return (
      <StatusCard icon={<Lock className="h-10 w-10" />} title="Pesquisa encerrada">
        {survey.orgName ? `A pesquisa “${survey.title}” da ${survey.orgName}` : `A pesquisa “${survey.title}”`} não está recebendo respostas no momento.
      </StatusCard>
    )
  }

  return (
    <SurveyRespondent
      survey={{ id: survey.id, title: survey.title, intro: survey.intro, questions: survey.questions, orgName: survey.orgName, minResponses: survey.minResponses }}
      canalHref={survey.whistleblowerEnabled ? buildDenunciaUrl(`${window.location.origin}/`, survey.tenantId, 'hub') : null}
      onSubmit={(answers) => submitSurveyResponse(survey, answers)}
    />
  )
}
