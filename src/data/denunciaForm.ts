/** Opções do formulário público de denúncia (canal whistleblower). */

export const RELACAO_DENUNCIADO = [
  'Gerente/Líder/Diretor/Supervisor (Superior)',
  'Agente ou funcionário público',
  'Clientes da empresa',
  'Prestador de serviço em geral (Terceiros)',
  'Meu subordinado',
  'Outro',
] as const

export const CATEGORIAS_DENUNCIA = [
  'Assédio sexual',
  'Assédio moral',
  'Discriminação',
  'Furto, roubo ou desvio',
  'Vazamento de informações',
  'Corrupção',
  'Descumprimento de normas ou políticas internas',
  'Qualidade do produto final',
  'Desvio comportamental',
  'Uso indevido de ativos',
  'Outros',
] as const

export const GENERO_OPCOES = ['Masculino', 'Feminino', 'Prefiro não me identificar'] as const

export const LOCAL_CAMERA_OPCOES = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
] as const

export const MAX_EVIDENCE_FILES = 5
export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024 // 10 MB por arquivo

/** Textos de ajuda por campo (formulário público de denúncia). */
export const DENUNCIA_FIELD_HELP = {
  identification:
    'Escolha se deseja enviar sem identificação (acompanhamento só pelo protocolo) ou informar nome e contato para eventual retorno.',
  reporterName: 'Nome como consta em documentos oficiais, se a organização precisar contatá-lo.',
  reporterContact: 'E-mail ou telefone com DDD. Será usado apenas para retorno relacionado à denúncia.',
  accusedRelationship: 'Relação da pessoa ou grupo denunciado com você no contexto do trabalho ou da organização.',
  complaintCategory: 'Selecione a categoria que melhor descreve o tipo de conduta ou situação denunciada.',
  complainantGender: 'Usado de forma agregada para análise; não identifica você individualmente no canal anônimo.',
  incidentDate: 'Data em que o fato ocorreu ou foi tomado conhecimento, se souber.',
  locationHasCamera: 'Indica se há registro em vídeo no local, o que pode ajudar na apuração.',
  subject: 'Uma linha que resume o que está sendo denunciado.',
  body: 'Inclua o máximo de detalhes: local, contexto, pessoas envolvidas e testemunhas, se houver.',
  evidence:
    'Anexe imagens ou PDF quando possível. Cada arquivo até 10 MB; no máximo 5 arquivos. Formatos comuns: JPG, PNG, WebP, GIF, PDF, DOC/DOCX.',
} as const

export const WIZARD_STEPS = [
  { id: 'identidade', label: 'Identificação' },
  { id: 'fato', label: 'Sobre o fato' },
  { id: 'descricao', label: 'Descrição' },
  { id: 'evidencias', label: 'Evidências' },
  { id: 'revisao', label: 'Revisão' },
] as const
