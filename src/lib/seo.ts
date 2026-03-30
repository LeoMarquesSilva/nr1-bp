import type { View } from '../App'

/** Keep in sync with default meta in index.html (build-time SEO). */
export const SEO_SITE_NAME = 'Confiara'

export const SEO_DEFAULT_TITLE = 'Confiara | Canal de denúncias, HSE-IT e compliance'

/** ~155–160 chars; aligned with hero (HeroContent). */
export const SEO_DEFAULT_DESCRIPTION =
  'Confiara: sistema de gestão da confiança organizacional com canal de denúncias seguro, diagnóstico HSE-IT em 7 dimensões e conformidade NR-1, Lei 14.457/22 e LGPD.'

const suffix = ` | ${SEO_SITE_NAME}`

const VIEW_TITLES: Partial<Record<View, string>> = {
  landing: SEO_DEFAULT_TITLE,
  'relatos-buscar': `Encontrar minha organização${suffix}`,
  sobre: `Sobre a plataforma${suffix}`,
  privacidade: `Privacidade e uso dos dados${suffix}`,
  login: `Entrar${suffix}`,
  contato: `Fale conosco${suffix}`,
  identificacao: `Diagnóstico psicossocial HSE-IT${suffix}`,
  form: `Questionário HSE-IT${suffix}`,
  obrigado: `Resposta registrada${suffix}`,
  'coleta-encerrada': `Coleta encerrada${suffix}`,
  'admin-gate': `Área administrativa${suffix}`,
  denuncia: `Enviar denúncia${suffix}`,
  'denuncia-hub': `Canal de denúncias${suffix}`,
  'denuncia-obrigado': `Denúncia registrada${suffix}`,
  'denuncia-consultar': `Consultar denúncia${suffix}`,
  admin: `Painel administrativo${suffix}`,
}

const VIEW_DESCRIPTIONS: Partial<Record<View, string>> = {
  landing: SEO_DEFAULT_DESCRIPTION,
  'relatos-buscar':
    'Busque sua organização pelo nome para acessar o canal de denúncias com segurança e anonimato quando permitido pela empresa.',
  sobre:
    'Entenda como funciona o diagnóstico HSE-IT em 7 dimensões, o canal de denúncias e a conformidade com NR-1 e Lei 14.457/22 na Confiara.',
  privacidade:
    'Transparência sobre coleta e uso de dados no diagnóstico HSE e no canal de denúncias, em linha com a LGPD.',
  login: 'Acesso seguro à área administrativa da Confiara para gestão de diagnósticos e denúncias.',
  contato: 'Entre em contato com a equipe Confiara para demonstrações e informações comerciais.',
  identificacao:
    'Inicie o questionário de clima organizacional HSE-IT: escolha o setor e responda com confidencialidade.',
  form: 'Questionário HSE-IT com 35 perguntas em 7 dimensões para mapeamento de riscos psicossociais.',
  obrigado: 'Sua participação no diagnóstico foi registrada. Obrigado por contribuir com o clima organizacional.',
  'coleta-encerrada': 'O período de coleta deste diagnóstico foi encerrado pela organização.',
  'admin-gate': 'Área restrita para administradores da plataforma Confiara.',
  denuncia: 'Envie uma denúncia com opção de anonimato. Seus dados são tratados com segurança e sigilo.',
  'denuncia-hub': 'Canal de denúncias da organização: enviar relato ou acompanhar protocolo.',
  'denuncia-obrigado':
    'Denúncia registrada com sucesso. Guarde o protocolo para acompanhar o andamento quando permitido.',
  'denuncia-consultar': 'Consulte o status da sua denúncia informando o número do protocolo.',
  admin: 'Painel administrativo Confiara: gestão de empresas, diagnósticos HSE-IT e canal de denúncias.',
}

export function getSeoTitleForView(view: View): string {
  return VIEW_TITLES[view] ?? SEO_DEFAULT_TITLE
}

export function getSeoDescriptionForView(view: View): string {
  return VIEW_DESCRIPTIONS[view] ?? SEO_DEFAULT_DESCRIPTION
}
